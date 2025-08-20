import mainDish from "../assets/edit_menu_img/main_dish.svg"
import sideDish from "../assets/edit_menu_img/side_dish.svg"

import { useNavigate } from "react-router-dom";
import { ToolsBox } from "../components/ToolsBox";
import { Background } from "../components/Background";

import bg from "../assets/bg/bg_1.png"

export const MenuSettingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="container min-h-screen overflow-x-hidden overflow-y-hidden">
            <Background bg={bg} />

            <main className="flex items-center justify-center min-h-screen">
                <div className="relative flex flex-col items-center justify-start gap-8 pt-4">
                    <div className="font-bold text-white text-center text-3xl">
                        <span>Menu Settings</span>
                    </div>

                    <div className="relative flex gap-8 p-4">
                        <ToolsBox img={mainDish} title={"Add Menu"} route={"/addMenu"}></ToolsBox>
                        <ToolsBox img={sideDish} title={"Edit Menu"} route={"/chooseMenu"}></ToolsBox>
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
}