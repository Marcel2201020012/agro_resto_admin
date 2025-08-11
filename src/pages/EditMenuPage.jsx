import { EditMenuListBox } from "../components/EditMenuListBox";

import mainDish from "../assets/edit_menu_img/main_dish.svg"
import sideDish from "../assets/edit_menu_img/side_dish.svg"
import drinks from "../assets/edit_menu_img/drinks.svg"
import { useNavigate } from "react-router-dom";

export const EditMenuPage = () => {
    const navigate = useNavigate();

    return (
        <div className="container min-h-screen overflow-x-hidden">
            <div
                className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-cover bg-center bg-no-repeat bg-background"
            ></div>

            <main>
                <div className="relative text-left pt-8 pb-12">
                    <div className="text-agro-color font-medium">AGRO RESTO</div>
                    <div className="text-4xl font-bold">Edit Menu</div>
                </div>

                <div className="relative flex flex-col items-center justify-start gap-8 pt-8">
                    <div className="flex gap-8">
                        <EditMenuListBox img={mainDish} title={"Main Dish"} route={"/editMenu"} category={"Main Dish"}/>
                        <EditMenuListBox img={sideDish} title={"Side Dish"} route={"/editMenu"} category={"Sides"}/>
                        <EditMenuListBox img={drinks} title={"Drinks"} route={"/editMenu"} category={"Drinks"}/>
                    </div>
                </div>

                <div onClick={() => navigate(-1)} className="bg-agro-color rounded-full px-6 py-2 w-45 absolute bottom-2 mb-12">
                    <span className="text-white">
                        Back
                    </span>
                </div>
            </main>
        </div>
    );
}