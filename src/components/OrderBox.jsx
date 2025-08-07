import { useNavigate } from "react-router-dom";

export const OrderBox = ({ id, date, status }) => {
    const navigate = useNavigate();

    const formatDate = (timestamp) => {
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

        const day = date.toLocaleString("en-US", { day: "2-digit" });
        const month = date.toLocaleString("en-US", { month: "2-digit" });
        const year = date.toLocaleString("en-US", { year: "numeric" });
        const hour = date.toLocaleString("en-US", { hour: "2-digit", hour12: false });
        const minute = date.toLocaleString("en-US", { minute: "2-digit" });

        return `${month}/${day}/${year} ${hour}:${minute}`;
    };

    return (
        <div onClick={() => navigate(`/orderDetail/${id}`)} className="border rounded-2xl bg-white p-8 max-h-28 hover:scale-[1.02] hover:shadow-lg">
            <div className="grid grid-cols-2">
                <div className="text-left font-medium">
                    {id}
                </div>
                <div className="text-right">
                    {formatDate(date)}
                </div>
                <div
                    className={`text-left ${status === 'waiting for payment'
                        ? 'text-orange-700'
                        : status === 'Preparing Your Food'
                            ? 'text-yellow-700'
                            : status === 'Order Canceled'
                                ? 'text-red-700'
                                : 'text-gray-700'
                        }`}
                >
                    {status}
                </div>

            </div>
        </div>
    );
}