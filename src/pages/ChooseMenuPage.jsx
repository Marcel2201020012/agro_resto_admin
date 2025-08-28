import { EditMenuListBox } from "../components/EditMenuListBox";
import { useRef } from "react";

import mainDish from "../assets/edit_menu_img/main_dish_2.png"
import sideDish from "../assets/edit_menu_img/side_dish_2.png"
import riceBowl from "../assets/edit_menu_img/rice_bowl.png"
import coffee from "../assets/edit_menu_img/coffee.png"
import nonCoffee from "../assets/edit_menu_img/non_coffee.png"
import juice from "../assets/edit_menu_img/juice.png"
import softDrink from "../assets/edit_menu_img/soft_drink.png"
import tea from "../assets/edit_menu_img/tea.png"
import beer from "../assets/edit_menu_img/beer.png"
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
                        <span>Edit Menu</span>
                    </div>

                    <div className="relative flex items-center w-full max-w-5xl">
                        <div
                            ref={scrollRef}
                            className="flex gap-6 w-full overflow-x-auto snap-x snap-mandatory scroll-smooth "
                        >
                            <div className="flex gap-6 w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth p-5">
                                <EditMenuListBox img={mainDish} title="Main Dish" route="/editMenu" category="Main Dish" />
                                <EditMenuListBox img={sideDish} title="Side Dish" route="/editMenu" category="Sides" />
                                <EditMenuListBox img={riceBowl} title="Rice Bowl" route="/editMenu" category="Rice Bowl" />
                                <EditMenuListBox img={coffee} title="Coffee" route="/editMenu" category="Coffee" />
                                <EditMenuListBox img={nonCoffee} title="Non-Coffee" route="/editMenu" category="Non-Coffee" />
                                <EditMenuListBox img={juice} title="Juice" route="/editMenu" category="Juice" />
                                <EditMenuListBox img={tea} title="Tea" route="/editMenu" category="Tea" />
                                <EditMenuListBox img={softDrink} title="Soft Drink" route="/editMenu" category="Soft Drink" />
                                <EditMenuListBox img={beer} title="Beer" route="/editMenu" category="Beer" />
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