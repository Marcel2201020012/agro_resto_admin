import { Background } from "../components/Background";
import { ToolsBox } from "../components/ToolsBox";

import menuImg from "../assets/tools_img/menuImg.svg"
import orderImg from "../assets/tools_img/orderImg.svg"

import bg from "../assets/bg/bg_1.png"
import { useNavigate } from "react-router-dom";

export const SettingsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="container min-h-screen overflow-x-hidden overflow-y-hidden">
            <Background bg={bg} />


            <main className="flex items-center justify-center min-h-screen">
                <div className="relative flex flex-col items-center justify-start gap-8 pt-4">
                    <div className="font-bold text-white text-center text-3xl">
                        <span>Settings</span>
                    </div>

                    <div className="relative flex gap-8">
                        <ToolsBox img={orderImg} title={"Users"} route={""} />
                        <ToolsBox img={menuImg} title={"Edit Menu"} route={"/edit"} />
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