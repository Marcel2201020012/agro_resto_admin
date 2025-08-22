import { doc, collection, updateDoc, onSnapshot, increment } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";

export const OrderDetails = () => {
    const navigate = useNavigate();
    const [order, setOrder] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    const { id } = useParams();
    const result = order.find((p) => p.id.toString() === id);

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

    const updateStock = async (details) => {
        if (!details?.orderDetails) return;

        const batchUpdates = details.orderDetails.map(async (item) => {
            try {
                const menuRef = doc(db, "menu_makanan", item.id);
                await updateDoc(menuRef, { stocks: increment(-item.jumlah) });
            } catch (err) {
                console.error(`Failed to update stock for ${item.id}:`, err);
            }
        });

        await Promise.all(batchUpdates);
    };

    const updateMenuSolds = async (orderDetails) => {
        if (!Array.isArray(orderDetails)) return;

        const updates = orderDetails.map(async (item) => {
            const menuRef = doc(db, "menu_makanan", item.id);
            await updateDoc(menuRef, {
                solds: increment(item.jumlah),
            });
        });

        await Promise.all(updates);
    }

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "transaction_id"), (snapshot) => {
            const orderData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrder(orderData);
            setLoading(false)
        });
        return () => unsub();
    }, []);

    const handleYes = () => {
        if (!id) return;

        if (modalAction === 'confirm') {
            updateStatus(id, "Preparing Food", result.tableId);
            updateStock(result);
            updateMenuSolds(result.orderDetails);

        } else if (modalAction === 'cancel') {
            updateStatus(id, "Order Canceled", result.tableId);
        } else if (modalAction === 'finish') {
            updateStatus(id, "Order Finished", result.tableId);
        }

        setShowModal(false);
        setModalAction(null);
    };

    const handleConfirmPayment = () => {
        setModalAction('confirm');
        setShowModal(true);
    };

    const handleCancelOrder = () => {
        setModalAction('cancel');
        setShowModal(true);
    };

    const handleFinishOrder = () => {
        setModalAction('finish');
        setShowModal(true);
    };

    const updateStatus = async (id, statusValue, tableId) => {
        setLoading(true);
        try {
            const orderRef = doc(db, "transaction_id", id);
            if (statusValue === "") {
                // await updateDoc(orderRef, {
                //     paymentUrl: "Pay With Cash"
                // });

                // window.open(`https://client.fbagrohotel.com/confirm?orderId=${id}&tableId=${tableId}&transaction_status=settlement`);
            } else {
                await updateDoc(orderRef, {
                    status: statusValue,
                    // paymentUrl: ""
                });
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container min-h-screen flex justify-center items-center">
        <p className="text-lg font-semibold">Loading...</p>
    </div>;

    return (
        <div className="container min-h-screen overflow-x-hidden">
            <div className="text-left pt-8 pb-12">
                <div className="text-agro-color font-medium">
                    AGRO RESTO
                </div>
                <div className="text-4xl font-bold">
                    Order Detail
                </div>
            </div>

            <div className="border p-4 text-sm text-left rounded-xl bg-gray-50 mb-10">
                <div className="grid gap-4">

                    <div>
                        <div className="font-bold">Transcation ID</div>
                        <div>{id}</div>
                    </div>

                    <div>
                        <div className="font-bold">Order Type</div>
                        <div>{result.orderType}</div>
                    </div>

                    <div>
                        <div className="font-bold">Customer Name</div>
                        <div>{result.customerName}</div>
                    </div>

                    <div>
                        <div className="font-bold">Date</div>
                        <div>{formatDate(result.createdAt)}</div>
                    </div>

                    <div>
                        <div className="font-bold">Table ID</div>
                        <div>{result.tableId}</div>
                    </div>

                    <div>
                        <div className="font-bold">Payment Methode</div>
                        <div>{result.payment}</div>
                    </div>

                    {/* <div>
                        <div className="font-bold">Payment URL</div>
                        <a
                            href={result?.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline cursor-pointer transition-colors duration-200"
                        >
                            {result?.paymentUrl}
                        </a>
                    </div> */}

                    <div>
                        <div className="font-bold">Notes</div>
                        <div>{result.notes}</div>
                    </div>


                    <div>
                        <div className="font-bold">Status</div>
                        <div>{result.status}</div>
                    </div>

                </div>
            </div>

            <div className="border p-4 rounded-xl bg-gray-50">
                <div className="space-y-2">
                    {Object.values(result.orderDetails).map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <div className="text-left">
                                <span>{item.jumlah}x</span>{" "}
                                <span>{item.name}</span>
                            </div>

                            {item.promotion > 0 ?
                                <div className="text-right font-semibold">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.promotion)}
                                </div>
                                :
                                <div className="text-right font-semibold">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}
                                </div>
                            }
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-4 border-t pt-2">
                    <p className="font-semibold">Total</p>
                    <p className="text-green-700 font-semibold">
                        {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(Number(result.total))}
                    </p>
                </div>
            </div>

            <div className="flex justify-between mt-10 mb-8">
                <button onClick={() => navigate(-1)} className="bg-agro-color rounded-full text-white px-6 py-2 w-45">
                    <span>Back</span>
                </button>

                {/* {result.status !== "Order Canceled" && result.status !== "Order Finished" && result.status !== "Preparing Food" && ( */}
                {result.status === "Waiting For Payment On Cashier" && (
                    <button onClick={handleCancelOrder} className="bg-red-500 rounded-full text-white px-6 py-2 w-45">
                        <span>Cancel Order</span>
                    </button>
                )}

                {result.status === "Waiting For Payment On Cashier" && (
                    <button onClick={handleConfirmPayment} className="bg-yellow-500 rounded-full text-white px-6 py-2 w-45">
                        <span>Confirm Payment</span>
                    </button>
                )}

                {result.status === "Preparing Food" && (
                    <button onClick={handleFinishOrder} className="bg-green-500 rounded-full text-white px-6 py-2 w-45">
                        <span>Finish Order</span>
                    </button>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center w-1/2">
                        <h2 className="text-lg font-bold mb-4">Attention</h2>
                        <p>
                            {modalAction === 'confirm' && "Confirm payment?"}
                            {modalAction === 'cancel' && "Cancel this order?"}
                            {modalAction === 'finish' && "Mark this order as finished?"}
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                onClick={handleYes}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => { setShowModal(false); setModalAction(null); }}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}