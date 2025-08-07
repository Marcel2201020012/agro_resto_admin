import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { Background } from "../components/Background";
import { ToolsBox } from "../components/ToolsBox";

import menuImg from "../assets/tools_img/menuImg.svg"
import salesImg from "../assets/tools_img/salesImg.svg"
import orderImg from "../assets/tools_img/orderImg.svg"

export const ToolsPage = () => {
    const logout = async () => {
        await signOut(auth);
    }

    return (
        <div className="container min-h-screen overflow-x-hidden overflow-y-hidden">
            <Background />

            <main className="flex items-center justify-center min-h-screen">
                <div className="relative flex flex-col items-center justify-start gap-8 pt-4">
                    <div className="font-bold text-white text-center text-3xl">
                        <span>Select Tools</span>
                    </div>

                    <div className="relative flex gap-8">
                        <ToolsBox img={orderImg} title={"Order"} route={"/order"} />
                        <ToolsBox img={salesImg} title={"Sales"} route={"/sales"} />
                        <ToolsBox img={menuImg} title={"Edit Menu"} route={"/edit"} />
                    </div>
                </div>
            </main>

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