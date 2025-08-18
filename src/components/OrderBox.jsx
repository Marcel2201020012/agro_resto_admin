import { useNavigate } from "react-router-dom";

export const OrderBox = ({ id, date, status, customerName }) => {
    const navigate = useNavigate();

    const formatDate = (timestamp) => {
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

        const pad = (num) => String(num).padStart(2, "0");

        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();
        const hour = pad(date.getHours());
        const minute = pad(date.getMinutes());

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
                    // className={`text-left ${status === 'Waiting For Payment On Cashier'
                    //     ? 'text-orange-700'
                    //     : status === 'Preparing Food'
                    //         ? 'text-yellow-700'
                    //         : status === 'Order Canceled'
                    //             ? 'text-red-700'
                    //             : 'text-gray-700'
                    //     }`}
                    className="text-left"
                >
                    {/* {status} */}
                    Ordered by: {customerName}
                </div>

            </div>
        </div>
    );
}