import { doc, collection, updateDoc, onSnapshot, increment, serverTimestamp } from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { useReactToPrint } from "react-to-print";
import { Reprint } from "../components/Reprint";

import { useAuth } from "../../hooks/useAuth";

export const OrderDetails = () => {
    const navigate = useNavigate();
    const {userData} = useAuth();
    const [order, setOrder] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCashPayment, setShowCashPayment] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const [cashValue, setCashValue] = useState();
    const [isSavingCashValue, setIsSavingCashValue] = useState(false);
    const [cashValueError, setCashValueError] = useState("");

    const [isEdit, setIsEdit] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editItems, setEditItems] = useState([]);

    const [isComplimentary, setIsComplimentary] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

    const { id } = useParams();
    const result = order.find((p) => p.id.toString() === id);

    const receiptRef = useRef();
    const printFn = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `Receipt_${id}`,
        pageStyle: `
            @page { size: auto; margin: 0mm; }
            @media print {
                body {
                    width: 58mm;
                    margin: 0 auto;
                }
            }
        `,
        onAfterPrint: () => setIsPrinting(false),
    });

    const handlePrint = () => {
        setIsPrinting(true);
        printFn?.();
    };

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
                    complimentary: isComplimentary,
                    // paymentUrl: ""
                });
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setLoading(false);
        }
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
    };

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
    }, [id]);

    const validateCashValue = (valueToCheck) => {
        if (isNaN(valueToCheck) || Number(valueToCheck) <= 0 || Number(valueToCheck) < Number(result.total - 2 * result.total * 0.1)) {
            setCashValueError("Please enter a valid cash value.");
            return false;
        }
        setCashValueError("");
        return true;
    };

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

    const handleSubmit = async () => {
        if (!validateCashValue(cashValue)) return;

        setIsSavingCashValue(true);
        const transactionRef = doc(db, "transaction_id", id);
        await updateDoc(transactionRef, {
            cash: cashValue,
            complimentary: isComplimentary,
        });
        updateStatus(id, "Preparing Food", result.tableId);
        updateStock(result);
        updateMenuSolds(result.orderDetails);

        setShowCashPayment(false);
    };

    const handleConfirm = () => {
        setShowEdit(true);
    };

    const handleConfirmPayment = () => {
        setShowEdit(false);
        if (result.payment !== "Cash") {
            setModalAction('confirm');
            setShowModal(true);
        } else {
            setShowCashPayment(true);
        }
    }

    const handleEdit = () => {
        setShowEdit(false);
        if (!result?.orderDetails) return;
        // make a copy so you can edit without mutating the original
        setEditItems(Object.values(result.orderDetails));
        setIsEdit(true);
    };

    const handleChange = (index, field, value) => {
        const updated = [...editItems];
        let newValue = value;

        // Validation rules
        if (field === "jumlah") {
            // must be an integer >= 0
            newValue = parseInt(value, 10);
            if (isNaN(newValue) || newValue < 0) newValue = 0;
        }

        if (field === "price" || field === "promotion" || field === "discount") {
            // must be a number >= 0
            newValue = Number(value);
            if (isNaN(newValue) || newValue < 0) newValue = 0;
        }

        if (field === "name") {
            // trim whitespace, disallow empty string
            newValue = value.trim();
            if (newValue.length === 0) {
                alert("Item name cannot be empty.");
                return; // don’t update state if invalid
            }
        }

        updated[index] = { ...updated[index], [field]: newValue };
        setEditItems(updated);
    };

    const handleConfirmEdit = async () => {
        try {
            setIsLoading(true);
            // calculate new total
            const newTotal = editItems.reduce((sum, item) => {
                const basePrice = item.promotion > 0 ? item.promotion : item.price;
                const discount = item.discount || 0;
                const finalPrice = Math.max(basePrice - discount, 0); // prevent negative
                return sum + finalPrice * Number(item.jumlah);
            }, 0);

            const ref = doc(db, "transaction_id", result.id);
            await updateDoc(ref, {
                orderDetails: editItems.reduce((acc, item, idx) => {
                    acc[idx] = item; // keep same structure
                    return acc;
                }, {}),
                total: newTotal,
                editedBy: userData?.username,
                editedAt: serverTimestamp(),
                prevValue: JSON.stringify(result, null, 2)
            });

            setIsEdit(false);
        } catch (err) {
            console.error("Update failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelOrder = () => {
        setModalAction('cancel');
        setShowModal(true);
    };

    const handleFinishOrder = () => {
        setModalAction('finish');
        setShowModal(true);
    };


    if (loading) return <div className="container min-h-screen flex justify-center items-center">
        <p className="text-lg font-semibold">Loading...</p>
    </div>;

    return (
        <div className="container min-h-screen overflow-x-hidden">
            <div className="text-left pt-8 pb-12">
                <div onClick={() => navigate("/", { replace: true })} className="text-agro-color font-medium cursor-pointer">
                    AGRO RESTO
                </div>
                <div className="text-4xl font-bold">
                    Order Detail
                </div>
            </div>

            <div className="border p-4 text-sm text-left rounded-xl bg-gray-50 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
                    {Object.values(result.orderDetails)
                        .filter(item => Number(item.jumlah) > 0)
                        .map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div className="text-left">
                                    <span>{item.jumlah}x</span>{" "}
                                    <span>{item.name}</span>
                                </div>

                                {item.promotion > 0 ? (
                                    <div className="text-right font-semibold">
                                        {new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                            minimumFractionDigits: 0,
                                        }).format(item.promotion)}
                                    </div>
                                ) : (
                                    <div className="text-right font-semibold">
                                        {new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                            minimumFractionDigits: 0,
                                        }).format(item.price)}
                                    </div>
                                )}
                            </div>
                        ))}
                    <div className="flex justify-between items-center">
                        <span className="font-bold">Service 10%</span>
                        <span className="font-bold">{new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(Number(result.total * 0.1))}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-bold">Tax 10%</span>
                        <span className="font-bold">{new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(Number(result.total * 0.1))}</span>
                    </div>

                    {isComplimentary &&
                        <div className="flex justify-between items-center">
                            <span className="font-bold">Complimentary</span>
                        </div>
                    }

                    {(result.status === "Preparing Food" || result.status === "Order Finished") && (<div className="flex justify-between items-center">
                        <span className="font-bold">{result.payment}</span>
                        {result.cash ? (<span className="font-bold">{new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(Number(result.cash))}</span>) : (<span className="font-bold">{new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(Number(result.total - 2 * result.total * 0.1))}</span>)}
                    </div>)}

                    {result.cash > result.total - 2 * result.total * 0.1 && (
                        <div className="flex justify-between items-center">
                            <span className="font-bold">Change</span>
                            <span className="font-bold">{new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                            }).format(Number(result.cash - (result.total)))}</span>
                        </div>
                    )}

                </div>

                <div className="flex justify-between mt-4 border-t pt-2">
                    <p className="font-bold">Total</p>
                    <p className="text-green-700 font-bold">
                        {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(Number(result.total))}
                    </p>
                </div>
            </div>

            <div className="flex justify-between mt-4 mb-12">
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
                    <button onClick={handleConfirm} className="bg-yellow-500 rounded-full text-white px-6 py-2 w-45">
                        <span>Confirm Payment</span>
                    </button>
                )}

                {(result.status === "Preparing Food" || result.status === "Order Finished") && (
                    <button onClick={handlePrint} disabled={isPrinting} className="bg-blue-500 rounded-full text-white px-6 py-2 w-45">
                        {isPrinting ? 'Printing…' : 'Print'}
                    </button>
                )}
                {result.status === "Preparing Food" && (
                    <button onClick={handleFinishOrder} className="bg-green-500 rounded-full text-white px-6 py-2 w-45">
                        Finish
                    </button>
                )}
            </div>

            {
                showModal && (
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
                )
            }

            {
                showCashPayment && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white p-6 rounded shadow-lg text-center w-1/2">
                            <h2 className="text-lg font-bold mb-4">Cash Payment</h2>
                            <span>Rp</span>
                            <input
                                className="border border-gray-500 rounded-sm min-w-100"
                                placeholder="Please input the payment value"
                                onChange={(e) => setCashValue(e.target.value)}
                            />
                            {cashValueError && (
                                <p className="text-red-500 mt-1 text-sm">{cashValueError}</p>
                            )}
                            <div className="mt-6 flex justify-center gap-4">
                                {!isSavingCashValue ? (<><button
                                    onClick={handleSubmit}
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    Submit
                                </button>
                                    <button
                                        onClick={() => { setShowCashPayment(false) }}
                                        className="bg-red-500 text-white px-4 py-2 rounded"
                                    >
                                        Cancel
                                    </button></>) : (<span>Loading...</span>)}

                            </div>
                        </div>
                    </div>
                )
            }

            {
                showEdit && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white p-6 rounded shadow-lg text-center w-1/2">
                            <h2 className="text-lg font-bold mb-4">Attention</h2>
                            <p>Are the current order need to be edited?</p>
                            <div className="mt-6 flex justify-center gap-4">
                                <button
                                    onClick={handleEdit}
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => { setShowEdit(false); handleConfirmPayment() }}
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {isEdit && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 flex flex-col">
                        {/* Header */}
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 text-left">
                            Edit Order
                        </h2>

                        {/* Table Headings */}
                        <div className="grid grid-cols-3 bg-gray-100 rounded-lg px-4 py-2 font-medium text-gray-700">
                            <span>Food Name</span>
                            <span className="text-center">Quantity</span>
                            <span className="text-right">Price / Item</span>
                        </div>

                        {/* Scrollable rows */}
                        <div className="divide-y divide-gray-200 overflow-y-auto max-h-80">
                            {editItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-3 items-center px-4 py-2 hover:bg-gray-50 transition"
                                >
                                    {/* Food Name */}
                                    <input
                                        type="text"
                                        value={item.name}
                                        className="border border-gray-300 rounded-lg px-3 py-1.5 bg-gray-100 text-gray-700"
                                        readOnly
                                    />

                                    {/* Quantity */}
                                    <input
                                        type="text"
                                        min="0"
                                        value={item.jumlah}
                                        onChange={(e) => handleChange(index, "jumlah", e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-1.5 w-20 mx-auto text-center"
                                        readOnly={isComplimentary}
                                    />

                                    {/* Price */}
                                    <div className="flex items-center justify-end space-x-1">
                                        <span className="text-gray-500">Rp</span>
                                        <input
                                            type="text"
                                            value={item.promotion > 0 ? item.promotion : item.price}
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    item.promotion > 0 ? "promotion" : "price",
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-1.5 w-28 text-right"
                                            readOnly={isComplimentary}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        {isLoading ? (<span>Loading...</span>) : (<div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEdit(false)}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                            >
                                Cancel
                            </button>

                            {isComplimentary ? (
                                <button
                                    onClick={() => setIsComplimentary(false)}
                                    className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                                >
                                    Cancel Complimentary
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsComplimentary(true)}
                                    className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                                >
                                    Set Complimentary
                                </button>
                            )}

                            <button
                                onClick={handleConfirmEdit}
                                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                            >
                                Confirm
                            </button>
                        </div>)}

                    </div>
                </div>
            )}

            <div style={{ position: "absolute", left: "-9999px" }}>
                {result ? <Reprint ref={receiptRef} id={id} result={result} /> : ""}
            </div>

        </div >
    );
}