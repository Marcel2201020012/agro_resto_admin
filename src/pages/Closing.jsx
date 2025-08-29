import { useState, useEffect, useMemo } from "react";
import { OrderBox } from "../components/OrderBox";
import { doc, collection, onSnapshot, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
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

    const STATUS_PRIORITY = {
        'Waiting For Payment On Cashier': 1,
        'Preparing Food': 2,
        'Order Canceled': 3,
        'Order Finished': 4
    };

    const initialNow = useMemo(() => new Date(), []);

    // Determine if it's morning or night shift
    const shiftDocRef = doc(db, "app_state", "shift");
    const [lastClosed, setIsLastClosed] = useState(null);
    const [shiftType, setShiftType] = useState(null);
    const summaryTitle = shiftType === "morning" ? "Morning Shift" : "Night Shift";
    const shiftTitle = shiftType === "morning" ? "Shift Closing" : "Cashier Closing";

    //fetch shiftType and lastClosed from firestore
    useEffect(() => {
        const unsub = onSnapshot(shiftDocRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setShiftType(data.type);
                setIsLastClosed(data?.lastClosed?.toDate ? data.lastClosed.toDate() : new Date(0));

            }
        }, (err) => {
            console.error("Error listening to shift doc:", err);
        });

        return () => unsub();
    }, []);

    //set allowed logic (for when user are allowed to press the close button)
    useEffect(() => {
        const checkTime = () => {
            if (!shiftType) return;

            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            let allowed = false;

            // thresholds in minutes
            const morningThreshold = 11 * 60 + 35; // 11:35
            const nightThreshold = 20 * 60 + 35;   // 20:35

            if (shiftType === "morning") {
                // only allow closing if time >= 11:35
                if (currentMinutes >= morningThreshold) {
                    allowed = true;
                }
            } else if (shiftType === "night") {
                // allow closing if time >= 20:35 OR (past midnight until indefinetly)
                if (currentMinutes >= nightThreshold || currentMinutes > 0) {
                    allowed = true;
                }
            }

            // prevent double-close within the same shift
            if (lastClosed instanceof Date) {
                const sameDay = lastClosed.toDateString() === now.toDateString();

                if (shiftType === "morning" && sameDay) {
                    const morningStartMinutes = 11 * 60 + 35; // 11:35
                    const morningEndMinutes = 21 * 60;        // 21:00
                    const lastClosedMinutes = lastClosed.getHours() * 60 + lastClosed.getMinutes();

                    if (lastClosedMinutes >= morningStartMinutes && lastClosedMinutes < morningEndMinutes) {
                        allowed = false;
                    }
                }

                if (shiftType === "night") {
                    const nightStartMinutes = 20 * 60 + 35; // 20:35
                    const nightEndMinutes = 6 * 60;        // 06:00
                    const lastClosedMinutes = lastClosed.getHours() * 60 + lastClosed.getMinutes();

                    // Wrap-around logic for night
                    if (shiftType === "night" && (lastClosedMinutes >= nightStartMinutes || lastClosedMinutes < nightEndMinutes)) {
                        allowed = false;
                    }
                }
            }

            setIsAllowed(allowed);
        };

        checkTime();
        const interval = setInterval(checkTime, 60_000); // check every minute
        return () => clearInterval(interval);
    }, [shiftType, lastClosed]);

    //calculate summary data from the lastClosed time to current date
    useEffect(() => {
        if (!lastClosed) return;

        (async () => {
            try {
                const qRef = query(
                    collection(db, "transaction_id"),
                    orderBy("createdAt", "asc"),
                    where("createdAt", ">=", Timestamp.fromDate(lastClosed)),
                    where("createdAt", "<=", Timestamp.fromDate(initialNow))
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
    }, [lastClosed, initialNow]);

    //fetch order data from fireStore
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
                return createdAt >= lastClosed && createdAt <= initialNow;
            })
            .sort((a, b) => {
                const statusComparison = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
                if (statusComparison !== 0) return statusComparison;
                return b.createdAt.toDate() - a.createdAt.toDate();
            });
    }, [orders, lastClosed, initialNow]);

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

    const handleShiftClose = () => {
        setShowModal(true);
    }

    //handle close shift button logic
    const handleShiftClosing = async () => {
        if (!isAllowed) return;
        setIsProcessing(true);

        const closingShift = shiftType;
        const newShift = shiftType === "morning" ? "night" : "morning";

        try {
            const now = new Date();
            const q = query(
                collection(db, "transaction_id"),
                where("createdAt", ">=", lastClosed),
                where("createdAt", "<=", now)
            );

            const snapshot = await getDocs(q);
            const batch = writeBatch(db);

            //add shiftType into every transactions
            snapshot.docs.forEach(docSnap => {
                // Always add shiftType to each transaction
                batch.update(docSnap.ref, { shiftType: closingShift });

                // Auto-update statuses
                const { status } = docSnap.data();
                if (status === "Waiting For Payment On Cashier") {
                    batch.update(docSnap.ref, { status: "Order Canceled" });
                } else if (status === "Preparing Food") {
                    batch.update(docSnap.ref, { status: "Order Finished" });
                }
            });

            // Update the shift type document
            batch.update(shiftDocRef, { type: newShift, lastClosed: new Date() });

            await batch.commit();
            setShiftType(newShift);
            console.log(`Shift closed: ${closingShift} → ${newShift}`);
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

            <div className="mb-12 flex justify-between">
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