import { EditMenuListBox } from "../components/EditMenuListBox";
import { useRef } from "react";

import mainDish from "../assets/edit_menu_img/main_dish.svg"
import sideDish from "../assets/edit_menu_img/side_dish.svg"
import drinks from "../assets/edit_menu_img/drinks.svg"
import { useNavigate } from "react-router-dom";
import { Background } from "../components/Background";

import bg from "../assets/bg/bg_1.png"

export const ChooseMenuPage = () => {
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -300 : 300,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="container min-h-screen overflow-x-hidden overflow-y-hidden">
            <Background bg={bg} />

            <main className="flex items-center justify-center min-h-screen">
                <div className="relative flex flex-col items-center justify-start gap-8 pt-4">
                    <div className="font-bold text-white text-center text-3xl">
                        <span>Menu Settings</span>
                    </div>

                    <div className="relative flex items-center w-full max-w-5xl">
                        <div
                            ref={scrollRef}
                            className="flex gap-6 w-full overflow-x-auto snap-x snap-mandatory scroll-smooth "
                        >
                            <div className="flex gap-6 w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth p-5">
                                <EditMenuListBox img={mainDish} title="Main Dish" route="/editMenu" category="Main Dish" />
                                <EditMenuListBox img={sideDish} title="Side Dish" route="/editMenu" category="Sides" />
                                <EditMenuListBox img={drinks} title="Coffee" route="/editMenu" category="Coffee" />
                                <EditMenuListBox img={drinks} title="Non-Coffee" route="/editMenu" category="Non-Coffee" />
                                <EditMenuListBox img={drinks} title="Juice" route="/editMenu" category="Juice" />
                                <EditMenuListBox img={drinks} title="Tea" route="/editMenu" category="Tea" />
                                <EditMenuListBox img={drinks} title="Soft Drink" route="/editMenu" category="Soft Drink" />
                                <EditMenuListBox img={drinks} title="Beer" route="/editMenu" category="Beer" />
                            </div>
                        </div>
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