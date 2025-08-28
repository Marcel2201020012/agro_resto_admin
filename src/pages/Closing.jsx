import { useState, useEffect, useMemo } from "react";
import { OrderBox } from "../components/OrderBox";
import { doc, collection, updateDoc, onSnapshot, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

import { TrendingUp, Receipt, BadgePercent, File } from "lucide-react";

const dayKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
};

export const Closing = () => {
    const [orders, setOrder] = useState([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const formatIDR = new Intl.NumberFormat("id-ID");
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalTransactions: 0,
    });

    const now = new Date();
    const hour = now.getHours();

    // Determine if it's morning or night shift
    const shiftDocRef = doc(db, "app_state", "shift");
    const [lastClosed, setIsLastClosed] = useState(null);
    const [shiftType, setShiftType] = useState(null);
    const summaryTitle = shiftType === "morning" ? "Morning Shift" : "Night Shift";
    const shiftTitle = shiftType === "morning" ? "Shift Closing" : "Cashier Closing";

    useEffect(() => {
        const initializeLastClosed = async () => {
            try {
                const docSnap = await getDoc(shiftDocRef);

                if (!docSnap.exists() || !docSnap.data().lastClosed) {
                    // Initialize lastClosed to current time
                    await setDoc(
                        shiftDocRef,
                        { lastClosed: Timestamp.fromDate(new Date()) },
                        { merge: true } // merge so other fields aren't overwritten
                    );
                    console.log("lastClosed initialized to current time");
                }
            } catch (error) {
                console.error("Error initializing lastClosed:", error);
            }
        };

        initializeLastClosed();
    }, []); // run only once on mount

    useEffect(() => {
        const unsub = onSnapshot(shiftDocRef, (snap) => {
            if (snap.exists()) {
                setShiftType(snap.data().type);
            }
        }, (err) => {
            console.error("Error listening to shift doc:", err);
        });

        return () => unsub(); // cleanup listener
    }, []);

    // Compute from and to including the day
    let from = new Date();
    let to = new Date();

    const STATUS_PRIORITY = {
        'Waiting For Payment On Cashier': 1,
        'Preparing Food': 2,
        'Order Canceled': 3,
        'Order Finished': 4
    };

    useEffect(() => {
        const checkTime = () => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            const currentTime = hour * 60 + minute;

            let allowed = false;

            if (shiftType === "morning") {
                // Morning: 11:35 - 06:00 (next day)
                allowed = currentTime >= 695 || currentTime < 360;
            } else if (shiftType === "night") {
                // Night: 20:35 - 11:35 (next day)
                allowed = currentTime >= 1235 || currentTime < 695;
            }

            setIsAllowed(allowed);
        };

        // Run immediately
        checkTime();

        // Set interval to check every minute (60000ms)
        const interval = setInterval(checkTime, 60000);

        // Cleanup
        return () => clearInterval(interval);
    }, [shiftType]);

    if (shiftType === "morning") {
        from.setHours(6, 0, 0, 0);
        to.setHours(14, 59, 59, 999);
    } else if (shiftType === "night") {
        if (hour >= 15) {
            // Night shift starting today 15:00
            from.setHours(15, 0, 0, 0);
            to.setDate(to.getDate() + 1); // next day
            to.setHours(5, 59, 59, 999);
        } else {
            // Early morning of night shift (past midnight, before 06:00)
            from.setDate(from.getDate() - 1); // yesterday 15:00
            from.setHours(15, 0, 0, 0);
            to.setHours(5, 59, 59, 999); // today
        }
    }

    useEffect(() => {
        const unsub = onSnapshot(shiftDocRef, (doc) => {
            const data = doc.data();
            const lastClosed = data?.lastClosed?.toDate ? data.lastClosed.toDate() : new Date(0);
            setIsLastClosed(lastClosed);
        });

        return () => unsub(); // cleanup on unmount
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "transaction_id"), (snapshot) => {
            const orderData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrder(orderData);
            setIsLoading(false)
        });
        return () => unsub();
    }, []);

    const filteredSortedOrders = useMemo(() => {
        return orders
            .filter(order => {
                const createdAt = order.createdAt?.toDate();
                if (!createdAt) return false;
                return createdAt >= lastClosed && createdAt <= to;
            })
            .sort((a, b) => {
                const statusComparison = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
                if (statusComparison !== 0) return statusComparison;
                return b.createdAt.toDate() - a.createdAt.toDate();
            });
    }, [orders, lastClosed, to]);


    const getOrdersByStatus = status => {
        const statusOrders = filteredSortedOrders.filter(order => order.status === status);

        let heightClass = "";
        if (statusOrders.length > 0 && statusOrders.length < 2) heightClass = "h-32";
        else if (statusOrders.length < 4) heightClass = "h-40";
        else if (statusOrders.length >= 6) heightClass = "h-96";

        return { orders: statusOrders, heightClass };
    };

    const { orders: waitingOrders, heightClass: waitingHeight } = getOrdersByStatus("Waiting For Payment On Cashier");
    const { orders: preparingOrders, heightClass: preparingHeight } = getOrdersByStatus("Preparing Food");
    const { orders: finishedOrders, heightClass: finishedHeight } = getOrdersByStatus("Order Finished");
    const { orders: canceledOrders, heightClass: canceledHeight } = getOrdersByStatus("Order Canceled");

    useEffect(() => {
        (async () => {
            try {
                const qRef = query(
                    collection(db, "transaction_id"),
                    orderBy("createdAt", "asc"),
                    where("createdAt", ">=", Timestamp.fromDate(lastClosed)),
                    where("createdAt", "<=", Timestamp.fromDate(to))
                );

                const snap = await getDocs(qRef);
                const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

                let income = 0;
                const perDay = new Map();

                for (const t of rows) {
                    const created = t.createdAt?.toDate ? t.createdAt.toDate() : null;
                    if (!created) continue;

                    const key = dayKey(created);
                    const totalNum = t.status === "Order Finished" ? Number(t.total) || 0 : 0;
                    income += totalNum;

                    const dEntry = perDay.get(key) || { date: created, income: 0, count: 0 };
                    dEntry.income += totalNum;
                    dEntry.count += 1;
                    perDay.set(key, dEntry);
                }

                setSummary({ totalIncome: income, totalTransactions: rows.length });
            } catch (e) {
                console.error(e);
            }
        })();
    }, [lastClosed, to]);

    const handleShiftClose = () => {
        setShowModal(true);
    }

    const handleShiftClosing = async () => {
        if (!isAllowed) return;
        setIsProcessing(true);

        // Update shift type after closing
        const closingShift = shiftType;
        const newShift = shiftType === "morning" ? "night" : "morning";
        // await updateDoc(shiftDocRef, { type: newShift });
        // setShiftType(newShift);

        try {
            const q = query(
                collection(db, "transaction_id"),
                where("createdAt", ">=", lastClosed),
                where("createdAt", "<=", to)
            );

            const snapshot = await getDocs(q);

            //add shiftType into every transactions
            const addShiftUpdates = snapshot.docs.map(docSnap =>
                updateDoc(docSnap.ref, { shiftType: closingShift })
            );

            if (addShiftUpdates.length) {
                await Promise.all(addShiftUpdates);
                console.log(`Added shiftType "${closingShift}" to ${addShiftUpdates.length} transactions`);
            }

            // Keep doc snapshots for updates
            const filteredDocs = snapshot.docs.filter(doc =>
                ["Waiting For Payment On Cashier", "Preparing Food"].includes(doc.data().status)
            );

            const updates = [];
            filteredDocs.forEach(docSnap => {
                const { status } = docSnap.data();
                if (status === "Waiting For Payment On Cashier") {
                    updates.push(updateDoc(docSnap.ref, { status: "Order Canceled" }));
                } else if (status === "Preparing Food") {
                    updates.push(updateDoc(docSnap.ref, { status: "Order Finished" }));
                }
            });
            if (updates.length) {
                await Promise.all(updates);
                console.log(`Updated ${updates.length} orders`);
            }

            // Update the shift type document
            await updateDoc(shiftDocRef, {
                type: newShift,
                lastClosed: new Date()
            });
            setShiftType(newShift);

        } catch (error) {
            console.log("Error updating pending status: ", error)
        }

        await signOut(auth);
    };

    if (isLoading) return <div className="container min-h-screen flex justify-center items-center">
        <p className="text-lg font-semibold">Loading Transaction List...</p>
    </div>;

    return (
        <div className="container min-h-screen overflow-x-hidden">

            <div className="flex flex-wrap justify-between items-center gap-4 text-left pt-8 pb-12">
                <div className="text-left">
                    <div onClick={() => navigate("/", { replace: true })} className="text-agro-color font-medium cursor-pointer">
                        AGRO RESTO
                    </div>
                    <div className="text-4xl font-bold">
                        {shiftTitle}
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
                <h2 className="text-xl font-semibold mb-4">{summaryTitle} Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mx-auto mt-6">
                    <div className="flex gap-4 justify-center items-center jusigap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm font-medium">Total Income</div>
                            <div className="text-xs text-gray-400 italic">*Before Tax</div>
                            <div className="text-2xl font-bold text-gray-800">
                                Rp {formatIDR.format(summary.totalIncome)}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center items-center jusigap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow">
                        <div className="p-3 bg-red-100 text-red-600 rounded-full">
                            <BadgePercent size={24} />
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm font-medium">Total Tax</div>
                            <div className="text-2xl font-bold text-gray-800">
                                Rp {formatIDR.format(summary.totalIncome * 0.1)}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center items-center jusigap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                            <File size={24} />
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm font-medium">Total Service Fee</div>
                            <div className="text-2xl font-bold text-gray-800">
                                Rp {formatIDR.format(summary.totalIncome * 0.1)}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center items-center gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <Receipt size={24} />
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm font-medium">Total Transactions</div>
                            <div className="text-2xl font-bold text-gray-800">
                                {summary.totalTransactions}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8">
                {waitingOrders.length > 0 && (
                    <div>
                        <div className="text-left font-semibold text-orange-600 mb-2">
                            Waiting For Payment On Cashier
                        </div>
                        <div className={`grid grid-cols-2 gap-2 overflow-y-scroll scrollbar-hide p-2 ${waitingHeight}`}>
                            {waitingOrders.map(order => (
                                <OrderBox
                                    key={order.id}
                                    id={order.id}
                                    date={order.createdAt}
                                    status={order.status}
                                    customerName={order.customerName}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {preparingOrders.length > 0 && (
                    <div>
                        <div className="text-left font-medium text-yellow-600 mb-2">
                            Preparing Food
                        </div>
                        <div className={`grid grid-cols-2 gap-2 overflow-y-scroll scrollbar-hide p-2 ${preparingHeight}`}>
                            {preparingOrders.map(order => (
                                <OrderBox
                                    key={order.id}
                                    id={order.id}
                                    date={order.createdAt}
                                    status={order.status}
                                    customerName={order.customerName}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {finishedOrders.length > 0 && (
                    <div>
                        <div className="text-left font-medium text-gray-600 mb-2">
                            Order Finished
                        </div>
                        <div className={`grid grid-cols-2 gap-2 overflow-y-scroll scrollbar-hide p-2 ${finishedHeight}`}>
                            {finishedOrders.map(order => (
                                <OrderBox
                                    key={order.id}
                                    id={order.id}
                                    date={order.createdAt}
                                    status={order.status}
                                    customerName={order.customerName}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {canceledOrders.length > 0 && (
                    <div>
                        <div className="text-left font-medium text-red-600 mb-2">
                            Order Canceled
                        </div>
                        <div className={`grid grid-cols-2 gap-2 overflow-y-scroll scrollbar-hide p-2 ${canceledHeight}`}>
                            {canceledOrders.map(order => (
                                <OrderBox
                                    key={order.id}
                                    id={order.id}
                                    date={order.createdAt}
                                    status={order.status}
                                    customerName={order.customerName}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center w-1/2">
                        <h2 className="text-lg font-bold mb-4 text-red-600">⚠️ Warning: </h2>
                        <p>
                            Performing <span className="font-bold">{shiftTitle}</span>
                            <span className="text-gray-700"> will <span className="font-bold">cancel all unfinished orders</span>.</span>
                        </p>
                        <p>
                            Only proceed if you intend to <span className="font-bold text-red-600">cancel all pending transactions</span>.
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                            {!isProcessing ? (<><button
                                onClick={handleShiftClosing}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Yes
                            </button>
                                <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => setShowModal(false)}>
                                    No
                                </button></>) : (<span>Loading...</span>)}

                        </div>
                    </div>
                </div>
            )
            }

            <div className="mt-10 mb-8 flex justify-between">
                <button onClick={() => navigate(-1)} className="bg-agro-color rounded-full p-2 w-24 text-white">
                    Back
                </button>
                <button
                    onClick={handleShiftClose}
                    disabled={!isAllowed}
                    className={`bg-red-500 rounded-full p-2 w-48 text-white ${isAllowed ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                    {shiftTitle}
                </button>
            </div>

        </div>
    );
}