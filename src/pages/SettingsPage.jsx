import { useState, useEffect } from "react";
import { Background } from "../components/Background";
import { ToolsBox } from "../components/ToolsBox";

import menuImg from "../assets/tools_img/menuImg.svg"
import userImg from "../assets/tools_img/user.png"

import bg from "../assets/bg/bg_1.png"
import { useNavigate } from "react-router-dom";

import { db, auth } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

async function getUserRole() {
    const user = auth.currentUser;
    if (!user) return null;

    const roleRef = doc(db, "admin_accounts", user.uid);
    const snap = await getDoc(roleRef);

    if (snap.exists()) {
        return snap.data().role;
    }
    return null;
}

export const SettingsPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserRole().then((r) => {
            if (r === "user") {
                navigate("/");
            } else {
                setRole(r);
            }
            setLoading(false);
        });
    }, [navigate]);

    if (role === "user") return null;

    if (loading) {
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
                        <span>Settings</span>
                    </div>

                    <div className="relative flex gap-8 p-4">
                        {role === "super admin" &&
                            <ToolsBox img={userImg} title={"Users"} route={"/userSettings"} />
                        }
                        <ToolsBox img={menuImg} title={"Menu Settings"} route={"/menuSetting"} />
                    </div>
                </div>
            </main>

            <div onClick={() => navigate(-1)} className="bg-agro-color absolute bottom-12 rounded-full px-6 py-2 w-45">
                <span className="text-white">
                    Back
                </span>
            </div>
        </div>
    );
};