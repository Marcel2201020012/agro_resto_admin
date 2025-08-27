import { signOut } from "firebase/auth";
import { Background } from "../components/Background";
import { ToolsBox } from "../components/ToolsBox";
import { ToolsBoxSales } from "../components/ToolBoxSales";

import settingImg from "../assets/tools_img/settings.png"
import orderImg from "../assets/tools_img/orderImg.svg"
import salesImg from "../assets/tools_img/salesImg.png"

import { auth } from "../../firebase/firebaseConfig";

import bg from "../assets/bg/bg_1.png"

import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

export const ToolsPage = () => {
    const { userData, checking } = useAuth();
    const [showModal, setShowModal] = useState(false);

    // const handleShowModal = () => {
    //     setShowModal(true)
    // }

    const ClosingTool = () => {
        // Get current hour in 24-hour format
        const now = new Date();
        const hour = now.getHours();

        // Determine title based on hour
        // 6 AM to 3 AM the next day = 6 to 23, 0 to 3
        const title =
            (hour >= 6 && hour <= 15)
                ? "Shift Closing"
                : "Cashier Closing";

        return <ToolsBox img={orderImg} title={title} route="/closing" />;
    };

    const logout = async () => {
        await signOut(auth);
    }

    // const handleCashierClosing = async () => {
    //     try {
    //         console.log("running expire logic")
    //         const q = query(
    //             collection(db, "transaction_id"),
    //             where("status", "in", ["Waiting For Payment On Cashier", "Preparing Food"])
    //         );
    //         const snapshot = await getDocs(q);

    //         const updates = [];
    //         snapshot.forEach(docSnap => {
    //             const { status } = docSnap.data();
    //             if (status === "Waiting For Payment On Cashier") {
    //                 updates.push(updateDoc(docSnap.ref, { status: "Order Canceled" }));
    //             } else if (status === "Preparing Food") {
    //                 updates.push(updateDoc(docSnap.ref, { status: "Order Finished" }));
    //             }
    //         });
    //         if (updates.length) {
    //             await Promise.all(updates);
    //             console.log(`Updated ${updates.length} orders`);
    //         }
    //     } catch (error) {
    //         console.log("Error updating pending status: ", error)
    //     }

    //     logout();
    // }

    if (checking) {
        return <div className="container min-h-screen flex justify-center items-center">
            <p className="text-lg font-semibold">Loading...</p>
        </div>
    }

    return (
        <div className="container min-h-screen overflow-x-hidden overflow-y-hidden">
            <Background bg={bg} />

            <main className="flex items-center justify-center min-h-screen">
                <div className="relative flex flex-col items-center justify-start gap-6">

                    {/* Hello + Select Tools grouped together */}
                    <div className="flex flex-col items-center text-center gap-2">
                        <span className="font-bold text-white text-3xl">
                            Hello, {userData?.username}
                        </span>
                    </div>

                    {/* Tools section */}
                    <div className="relative flex gap-8 p-4">
                        <ToolsBox img={orderImg} title="Order" route="/order" />
                        <ToolsBox img={salesImg} title="Sales" route="/sales" />
                        <ClosingTool/>
                        {/* <ToolsBoxSales href="https://dashboard.midtrans.com/login" img={salesImg} title={"Sales"} /> */}
                        {/* <div
                            onClick={handleShowModal}
                            className="snap-center cursor-pointer border rounded-3xl flex flex-col items-center gap-4 bg-white p-8 min-w-[240px] transition-all duration-200 hover:scale-105 hover:shadow-xl"
                        >
                            <img
                                src={orderImg}
                                alt={"Cashier Closing"}
                                className="w-32 h-32 object-contain"
                            />
                            <span className="font-bold text-2xl text-agro-color text-center">
                                {"Cashier Closing"}
                            </span>
                        </div> */}
                        <ToolsBox img={settingImg} title="Settings" route="/settings" />
                    </div>
                </div>
            </main>

            {/* {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center w-1/2">
                        <h2 className="text-lg font-bold mb-4 text-red-600">⚠️ Warning: </h2>
                        <p>
                            Performing <span className="font-bold">Cashier Closing</span>
                            <span className="text-gray-700"> will <span className="font-bold">cancel all unfinished orders</span>.</span>
                        </p>
                        <p>
                            Only proceed if you intend to <span className="font-bold text-red-600">discard all pending transactions</span>.
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                onClick={() => { handleCashierClosing }}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Yes
                            </button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => setShowModal(false)}>
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )
            } */}

            <button
                onClick={logout}
                className="absolute bottom-2 mt-auto mb-32 md:mb-8 flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-200 font-semibold">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M3 4.5A1.5 1.5 0 014.5 3h5a.5.5 0 010 1h-5A.5.5 0 004 4.5v11a.5.5 0 00.5.5h5a.5.5 0 010 1h-5A1.5 1.5 0 013 15.5v-11zm11.854 4.646a.5.5 0 10-.708-.708L12.5 10.086V7a.5.5 0 00-1 0v6a.5.5 0 001 0v-3.086l1.646 1.648a.5.5 0 00.708-.708l-2.5-2.5z"
                        clipRule="evenodd"
                    />
                </svg>
                Logout
            </button>
        </div>
    );
};