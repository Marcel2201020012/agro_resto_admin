import { useState, useEffect } from "react";
import { Background } from "../components/Background";
import { ToolsBox } from "../components/ToolsBox";
import { ToolsBoxSales } from "../components/ToolBoxSales";

import settingImg from "../assets/tools_img/settings.png"
import orderImg from "../assets/tools_img/orderImg.svg"
import salesImg from "../assets/tools_img/salesImg.png"
import closingImg from "../assets/tools_img/closing.png"

import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

import bg from "../assets/bg/bg_1.png"

import { useAuth } from "../../hooks/useAuth";

export const ToolsPage = () => {
    const { userData, checking } = useAuth();

    const shiftDocRef = doc(db, "app_state", "shift");
    const [shiftType, setShiftType] = useState(null);
    const [canClose, setCanClose] = useState(false);
    const [lastClosed, setIsLastClosed] = useState(null);

    //fetch shiftType and lastClosed from firestore
    useEffect(() => {
        const unsub = onSnapshot(shiftDocRef, (snap) => {
            if (!snap.exists()) return;

            const data = snap.data();
            setShiftType(data.type);
            setIsLastClosed(data?.lastClosed?.toDate ? data.lastClosed.toDate() : null);
        }, (err) => console.error("Error listening to shift doc:", err));

        return () => unsub();
    }, []);

    useEffect(() => {
        const checkTime = async () => {
            if (!shiftType) return;

            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            let allowed = false;

            // Shift thresholds in minutes
            const morningThreshold = 11 * 60 + 35; // 11:35
            const nightThreshold = 20 * 60 + 35;   // 20:35

            let newShift = shiftType;

            // 1. Basic allow rules
            if (shiftType === "morning" && currentMinutes >= morningThreshold) {
                allowed = true;
            }
            if (shiftType === "night" && currentMinutes >= nightThreshold) {
                allowed = true;
            }

            // 2. Double-close prevention
            if (lastClosed instanceof Date) {
                const sameDay = lastClosed.toDateString() === now.toDateString();
                const lastClosedMinutes = lastClosed.getHours() * 60 + lastClosed.getMinutes();

                if (shiftType === "morning") {
                    if (sameDay && lastClosedMinutes >= morningThreshold) {
                        allowed = false; // already closed this morning
                    }
                    // if last night shift was closed yesterday, block until morning threshold
                    const closedWasYesterdayNight =
                        !sameDay && lastClosedMinutes >= nightThreshold;
                    if (closedWasYesterdayNight && currentMinutes < morningThreshold) {
                        allowed = false;
                    }
                }

                if (shiftType === "night") {
                    if (sameDay && lastClosedMinutes >= nightThreshold) {
                        allowed = false; // already closed this night
                    }
                    // if morning shift already closed today, block until night threshold
                    if (sameDay && lastClosedMinutes >= morningThreshold && currentMinutes < nightThreshold) {
                        allowed = false;
                    }
                }
            }

            // 3. Missed shift detection
            if (shiftType === "morning" && currentMinutes >= nightThreshold) {
                newShift = "night"; // morning missed, auto switch
            } else if (shiftType === "night" && currentMinutes < morningThreshold) {
                newShift = "morning"; // next day morning
            }

            // Update shiftType if needed
            if (newShift !== shiftType) {
                setShiftType(newShift);
                try {
                    await updateDoc(shiftDocRef, { type: newShift });
                    console.log("Shift updated due to missed shift:", newShift);
                } catch (err) {
                    console.error("Failed to update shift:", err);
                }
            }

            setCanClose(allowed); // update your state (was setIsAllowed before)
        };

        checkTime(); // run immediately
        const timer = setInterval(checkTime, 60 * 1000); // re-check every minute
        return () => clearInterval(timer);
    }, [shiftType, lastClosed]);

    const shiftTitle = shiftType === "morning" ? "Shift Closing" : "Cashier Closing";

    useEffect(() => {
        const unsub = onSnapshot(
            shiftDocRef,
            (snap) => {
                if (snap.exists()) {
                    setShiftType(snap.data().type);
                }
            },
            (err) => {
                console.error("Error listening to shift doc:", err);
            }
        );

        // Cleanup listener when component unmounts
        return () => unsub();
    }, [shiftDocRef]);

    const logout = async () => {
        await signOut(auth);
    }

    if (checking) {
        return <div className="container min-h-screen flex justify-center items-center">
            <p className="text-lg font-semibold">Loading...</p>
        </div>
    }

    return (
        <div className="container min-h-screen overflow-x-hidden overflow-y-auto">
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
                    <div className="relative flex justify-center gap-6 p-4">
                        <ToolsBox img={orderImg} title="Order" route="/order" />
                        <ToolsBox img={salesImg} title="Sales" route="/sales" />
                        <ToolsBox
                            img={closingImg}
                            title={shiftTitle}
                            route="/closing"
                            canClose={canClose}
                        />
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

            <button
                onClick={logout}
                className="fixed bottom-4 mt-auto mb-32 md:mb-8 flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-200 font-semibold">
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