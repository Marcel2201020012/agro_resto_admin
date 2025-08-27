import mainDish from "../assets/edit_menu_img/main_dish.svg"
import sideDish from "../assets/edit_menu_img/side_dish.svg"

import { useNavigate } from "react-router-dom";
import { ToolsBox } from "../components/ToolsBox";
import { Background } from "../components/Background";
import { useState } from "react";

import { db } from "../../firebase/firebaseConfig";
import { getDocs, updateDoc, collection, doc } from "firebase/firestore";

import bg from "../assets/bg/bg_1.png"

import { useAuth } from "../../hooks/useAuth";

export const MenuSettingPage = () => {
    const navigate = useNavigate();
    const [confirmReset, setConfirmReset] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const { userData, checking } = useAuth();

    const handleResetBestSeller = () => {
        setConfirmReset(true);
    };

    const handleConfirm = async () => {
        try {
            setConfirmed(true);
            const querySnapshot = await getDocs(collection(db, "menu_makanan"));
            const updates = querySnapshot.docs.map((document) => {
                const ref = doc(db, "menu_makanan", document.id);
                return updateDoc(ref, { solds: 0 });
            });

            await Promise.all(updates);
            setConfirmReset(false);
            alert("Success Reseting Best Seller!");
        } catch (error) {
            alert("Error:", error);
        } finally {
            setConfirmed(false);
        }
    }

    if (checking) {
        return <div className="container min-h-screen flex justify-center items-center">
            <p className="text-lg font-semibold">Loading...</p>
        </div>
    }

    return (
        <div className="container min-h-screen overflow-x-hidden overflow-y-hidden">
            <Background bg={bg} />

            <main className="flex items-center justify-center min-h-screen">
                <div className="relative flex flex-col items-center justify-start gap-8 pt-4">
                    <div className="font-bold text-white text-center text-3xl">
                        <span>Menu Settings</span>
                    </div>

                    <div className="relative flex gap-8 p-4">
                        {userData?.role !== "user" &&
                            <ToolsBox img={mainDish} title={"Add Menu"} route={"/addMenu"}></ToolsBox>
                        }
                        <ToolsBox img={sideDish} title={"Edit Menu"} route={"/chooseMenu"}></ToolsBox>
                        {userData?.role !== "user" &&
                            <div onClick={handleResetBestSeller}>
                                <ToolsBox img={sideDish} title={"Reset Best Seller"} route={""}></ToolsBox>
                            </div>
                        }
                    </div>
                </div>
            </main>

            {confirmReset && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center w-1/2">
                        <h2 className="text-lg font-bold mb-4">Attention</h2>
                        <p>Are you sure wanted to reset best seller value?</p>
                        { }
                        {confirmed ? (<span>loading...</span>) : (<div className="mt-6 flex justify-center gap-4">
                            <button
                                onClick={handleConfirm}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Yes
                            </button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => setConfirmReset(false)}>
                                No
                            </button>
                        </div>)}

                    </div>
                </div>
            )
            }

            <div onClick={() => navigate(-1)} className="bg-agro-color absolute bottom-12 rounded-full px-6 py-2 w-45">
                <span className="text-white">
                    Back
                </span>
            </div>
        </div>
    );
}