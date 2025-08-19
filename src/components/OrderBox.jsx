import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export const OrderBox = ({ id, date, status, customerName }) => {
    const navigate = useNavigate();
    const [isCancelled, setIsCancelled] = useState(false);

    const formatDate = (timestamp) => {
        const d = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        try {
            await deleteDoc(doc(db, "transaction_id", id));
            console.log(`Order ${id} deleted`);
        } catch (err) {
            console.error("Failed to delete order:", err);
        }
    };

    useEffect(() => {
        setIsCancelled(status === "Order Canceled");
    }, [status]);

    return (
        <div
            onClick={() => navigate(`/orderDetail/${id}`)}
            className="relative group border rounded-xl bg-white p-3 hover:scale-[1.03] hover:shadow-md cursor-pointer transition-all duration-200 max-h-22"
        >
            <div className="flex flex-col gap-1">
                <div className="grid grid-cols-2 text-sm font-medium">
                    <span className="text-left">#{id}</span>
                    <span className="text-right text-gray-500">{formatDate(date)}</span>
                </div>
                <div className="grid grid-cols-2 text-xs text-gray-600">
                    <span className="text-left">Ordered by: </span>
                    <span className="text-right">{customerName}</span>
                </div>
            </div>

            {isCancelled && (
                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 text-red-600 text-xs bg-red-100 px-2 py-0.5 rounded hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                    Delete
                </button>
            )}
        </div>
    );
};