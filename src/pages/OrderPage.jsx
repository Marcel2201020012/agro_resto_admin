import { useState, useEffect, useMemo } from "react";
import { OrderBox } from "../components/OrderBox";
import { collection, updateDoc, onSnapshot, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const toStartOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};

const toEndOfDay = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
};

export const OrderPage = () => {
    const [orders, setOrder] = useState([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const today = new Date(); // utc time
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const localDate = `${yyyy}-${mm}-${dd}`; //convert to local time UTC + 7

    const [from, setFrom] = useState(localDate);
    const [to, setTo] = useState(localDate);

    const STATUS_PRIORITY = {
        'Waiting For Payment On Cashier': 1,
        'Preparing Food': 2,
        'Order Canceled': 3,
        'Order Finished': 4
    };

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

    const filteredSortedOrders = (() => {
        const start = toStartOfDay(new Date(from));
        const end = toEndOfDay(new Date(to));

        return [...orders]
            .filter(order => {
                const createdAt = order.createdAt?.toDate();
                if (!createdAt) return false;
                return createdAt >= start && createdAt <= end;
            })
            .sort((a, b) => {
                const statusComparison = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
                if (statusComparison !== 0) return statusComparison;
                return b.createdAt.toDate() - a.createdAt.toDate();
            })
            .map(order => ({
                ...order,
                isComplimentary: order.complimentary === true
            }));
    })();

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
        const checkAndExpire = async () => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();

            // Only run if current time is 12:00 AM or 6:00 PM
            try {
                if ((hour === 0 || hour === 18) && minute === 0) {
                    console.log("running expire logic")
                    const q = query(
                        collection(db, "transaction_id"),
                        where("status", "in", ["Waiting For Payment On Cashier", "Preparing Food"])
                    );
                    const snapshot = await getDocs(q);
                    const nowMs = now.getTime();

                    const updates = [];
                    snapshot.forEach(docSnap => {
                        const data = docSnap.data();
                        const status = data.status;
                        const createdAtField = data.createdAt;
                        if (!createdAtField) return;
                        const createdAt = createdAtField.toDate().getTime();
                        const diffMinutes = (nowMs - createdAt) / (1000 * 60);

                        // expire if >15 min
                        if (status === "Waiting For Payment On Cashier" && diffMinutes >= 15) {
                            updates.push(
                                updateDoc(doc(db, "transaction_id", docSnap.id), {
                                    status: "Order Canceled"
                                })
                            );
                        }

                        if (status === "Preparing Food") {
                            if (diffMinutes >= 15) {
                                updates.push(
                                    updateDoc(doc(db, "transaction_id", docSnap.id), {
                                        status: "Order Finished"
                                    })
                                );
                            }
                        }
                    });
                    if (updates.length) {
                        await Promise.all(updates);
                        console.log(`Updated ${updates.length} orders`);
                    }
                }
            } catch (error) {
                console.log("Error updating pending status: ", error)
            }
        };

        // Run check immediately and then set interval to check every minute
        checkAndExpire();
        const interval = setInterval(() => {
            const now = new Date();
            if ((now.getHours() === 0 || now.getHours() === 18) && now.getMinutes() === 0) {
                checkAndExpire();
            }
        }, 60 * 1000);
        return () => clearInterval(interval);
    }, []);

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
                        Order List
                    </div>
                </div>
                <div className="flex gap-6">
                    <div>
                        <label className="block text-left text-sm text-gray-600">From</label>
                        <input
                            type="date"
                            className="border bg-white rounded-xl px-3 py-2"
                            value={from} // convert Date to yyyy-mm-dd string
                            onChange={(e) => setFrom(e.target.value)} // convert string back to Date
                        />
                    </div>
                    <div>
                        <label className="block text-left text-sm text-gray-600">To</label>
                        <input
                            type="date"
                            className="border bg-white rounded-xl px-3 py-2"
                            value={to} // convert Date to yyyy-mm-dd string
                            onChange={(e) => setTo(e.target.value)} // convert string back to Date
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                                    isComplimentary={order.isComplimentary}
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
                                    isComplimentary={order.isComplimentary}
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
                                    isComplimentary={order.isComplimentary}
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
                                    isComplimentary={order.isComplimentary}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-10 mb-8 text-left">
                <button onClick={() => navigate(-1)} className="bg-agro-color rounded-full p-2 w-24 text-white">
                    Back
                </button>
            </div>

        </div>
    );
}