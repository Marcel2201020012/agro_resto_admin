import { useState, useEffect } from "react";
import { OrderBox } from "../components/OrderBox";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export const OrderPage = () => {
    const [orders, setOrder] = useState([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const STATUS_PRIORITY = {
        'waiting for payment': 1,
        'Preparing Your Food': 2,
        'Order Canceled': 3,
        'Order Finished': 4
    };

    const sortedOrders = [...orders].sort((a, b) => {
        const statusComparison = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        if (statusComparison !== 0) return statusComparison;

        return new Date(b.createdAt) - new Date(a.createdAt);
    });

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

    if (isLoading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="container min-h-screen overflow-x-hidden">

            <div className="text-left pt-8 pb-12">
                <div className="text-agro-color font-medium">
                    AGRO RESTO
                </div>
                <div className="text-4xl font-bold">
                    Order List
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 h-96 overflow-y-scroll scrollbar-hide p-4">
                {sortedOrders.map((order) => (
                    <OrderBox
                        key={order.id}
                        id={order.id}
                        date={order.createdAt}
                        status={order.status}
                    />
                ))}
            </div>


            <div className="absolute bottom-12 text-left">
                <button onClick={() => navigate(-1)} className="bg-agro-color rounded-full p-2 w-24 text-white">
                    Back
                </button>
            </div>

        </div>
    );
}