import React, { forwardRef } from "react";
import { useAuth } from "../../hooks/useAuth";

const formatDate = (timestamp) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

    const pad = (num) => String(num).padStart(2, "0");

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
};

export const Reprint = forwardRef(({ id, result, cashValue }, ref) => {
    const { user, userData,checking } = useAuth();

    return (
        <div ref={ref} className="p-2 text-xs" style={{ width: "58mm" }}>
            <div className="text-center font-bold mb-2">
                <div>AGRO HOTEL</div>
                <div>ASIANA 早餐汀</div>
            </div>
            <div className="text-right font-bold">{id}</div>
            <div className="flex justify-between">
                <div className="">Table&nbsp;: {result.tableId}</div>
                <div>{formatDate(result.createdAt)}</div>
            </div>
            <div className="text-left">Guest: {result.customerName}</div>
            <div className="flex justify-between">
                <span>Item</span>
                <span>Qty</span>
                <span>Total</span>
            </div>
            <hr />
            {Object.values(result.orderDetails).map((item, i) => (
                <div key={i}>
                    <div className="flex flex-col text-left">
                        <span> {item.name} </span>
                        <div className="grid grid-cols-2">
                            <span className="text-center">  x{item.jumlah} </span>
                            <span className="text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.promotion > 0 ? item.promotion : item.price)}</span>
                        </div>
                    </div>
                </div>
            ))}

            <div className="flex justify-between mt-2">
                <div className="flex w-full">
                    <span className="flex-1 text-left">Subtotal</span>
                    <span className="w-4 text-center">:</span>
                    <span className="flex-1 text-right">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
                            .format(Number(result.total))}
                    </span>
                </div>
            </div>

            <div className="flex justify-between">
                <div className="flex w-full">
                    <span className="flex-1 text-left">Service 10%</span>
                    <span className="w-4 text-center">:</span>
                    <span className="flex-1 text-right">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
                            .format(Number(result.total * 0.1))}
                    </span>
                </div>
            </div>

            <div className="flex justify-between">
                <div className="flex w-full">
                    <span className="flex-1 text-left">Tax 10%</span>
                    <span className="w-4 text-center">:</span>
                    <span className="flex-1 text-right">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
                            .format(Number(result.total * 0.1))}
                    </span>
                </div>
            </div>

            <div className="flex justify-between">
                <div className="flex w-full font-bold">
                    <span className="flex-1 text-left">Total</span>
                    <span className="w-4 text-center">:</span>
                    <span className="flex-1 text-right">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
                            .format(Number(result.total + 2 * result.total * 0.1))}
                    </span>
                </div>
            </div>

            <div className="flex justify-between">
                <div className="flex w-full font-bold">
                    <span className="flex-1 text-left">{result.payment}</span>
                    <span className="w-4 text-center">:</span>
                    {result.cash ? (<span className="flex-1 text-right">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
                            .format(Number(cashValue))}
                    </span>) : (<span className="flex-1 text-right">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
                            .format(Number(result.total + 2 * result.total * 0.1))}
                    </span>)}

                </div>
            </div>

            {result.cash > result.total + 2 * result.total * 0.1 &&
                <div className="flex justify-between">
                    <div className="flex w-full font-bold">
                        <span className="flex-1 text-left">Change</span>
                        <span className="w-4 text-center">:</span>
                        <span className="flex-1 text-right">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
                                .format(Number(result.cash - (result.total + 2 * result.total * 0.1)))}
                        </span>
                    </div>
                </div>
            }

            <div className="font-bold mt-4 text-center">THANK YOU</div>
            <div className="text-left">Waiter&nbsp;: {userData?.username} </div>
        </div>
    );
});