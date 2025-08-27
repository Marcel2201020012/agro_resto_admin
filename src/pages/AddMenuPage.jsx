import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export const AddMenuPage = () => {
    const navigate = useNavigate();

    const [foodCategory, setFoodCategory] = useState("");
    const [foodCategoryError, setFoodCategoryError] = useState("");

    const [foodImg, setFoodImg] = useState("");
    const [foodImgError, setFoodImgError] = useState("");

    const [foodName, setFoodName] = useState("");
    const [foodNameError, setFoodNameError] = useState("");

    const [cnName, setCnName] = useState("");
    const [cnNameError, setCnNameError] = useState("");

    const [foodDesc, setFoodDesc] = useState("");
    const [foodDescError, setFoodDescError] = useState("");

    const [foodPrice, setFoodPrice] = useState("");
    const [foodPriceError, setFoodPriceError] = useState("");

    const [foodStocks, setFoodStocks] = useState("");
    const [foodStocksError, setStocksError] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    const validateFoodCategory = () => {
        if (foodCategory === "") {
            setFoodCategoryError("Please choose food category.");
            return false;
        }
        setFoodCategoryError("");
        return true;
    }

    const validateFoodImg = () => {
        if (foodImg.trim().length < 1) {
            setFoodImgError("Please enter the food image link.");
            return false;
        }
        try {
            new URL(foodImg);
        } catch (_) {
            setFoodImgError("Please enter a valid URL.");
            return false;
        }
        setFoodImgError("");
        return true;
    };

    const validateFoodName = () => {
        if (foodName.trim().length < 1) {
            setFoodNameError("Please enter the food name.");
            return false;
        }
        setFoodNameError("");
        return true;
    };

    const validateCnName = () => {
        const value = cnName.trim().normalize('NFKC').replace(/\u3000/g, ' ');

        if (value.length === 0) {
            setCnNameError("Please enter the Chinese name.");
            return false;
        }

        const onlyChineseRegex = /^[\p{Script=Han}0-9·\s]+$/u;

        if (!onlyChineseRegex.test(value)) {
            setCnNameError("Only Chinese characters, numbers, and spaces are allowed.");
            return false;
        }

        setCnNameError("");
        return true;
    };

    const validateFoodDesc = () => {
        if (foodName.trim().length < 1) {
            setFoodDescError("Please enter food description.");
            return false;
        }
        setFoodDescError("");
        return true;
    };

    const validateFoodPrice = () => {
        if (foodPrice.trim().length < 1) {
            setFoodPriceError("Please enter the food price.");
            return false;
        }
        if (isNaN(foodPrice) || Number(foodPrice) <= 0) {
            setFoodPriceError("Please enter a valid positive number.");
            return false;
        }
        setFoodPriceError("");
        return true;
    };

    const validateFoodStock = () => {
        const num = Number(foodStocks);

        if (foodStocks === "" || isNaN(num)) {
            setStocksError("Please enter the food stock.");
            return false;
        }
        if (num < 0) {
            setStocksError("Please enter a valid positive number.");
            return false;
        }

        setStocksError("");
        return true;
    };

    const saveMenu = async (e) => {
        e.preventDefault();

        if (!validateFoodCategory() || !validateFoodImg() || !validateFoodName() || !validateCnName() || !validateFoodDesc() || !validateFoodPrice() || !validateFoodStock()) {
            setIsSaving(false);
            return;
        }

        setIsSaving(true);

        const menu = {
            category: foodCategory,
            image: foodImg,
            name: foodName,
            cn: cnName,
            desc: foodDesc,
            price: foodPrice,
            stocks: foodStocks,
            createdAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "menu_makanan"), menu);
        } catch (error) {
            console.error("Error saving menu:", error);
        } finally {
            setIsSaving(false);
        }

        setFoodCategory("");
        setFoodImg("");
        setFoodName("");
        setCnName("");
        setFoodDesc("");
        setFoodPrice("");
        setFoodStocks("");
    };

    if (isSaving) {
        return (
            <div className="container min-h-screen flex justify-center items-center">
                <p className="text-lg font-semibold">Saving new menu...</p>
            </div>
        )
    }

    return (
        <div className="container min-h-screen overflow-x-hidden">
            <div className="relative text-left pt-8 pb-12">
                <div onClick={() => navigate("/", { replace: true })} className="text-agro-color font-medium cursor-pointer">AGRO RESTO</div>
                <div className="text-4xl font-bold">Add Menu</div>
            </div>

            <div className="flex justify-center">
                <div className="text-left bg-white border p-8 rounded-2xl w-3/4">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Food Category</label>
                            <select
                                className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${foodCategoryError ? "border-red-500" : ""}`}
                                value={foodCategory}
                                onChange={e => setFoodCategory(e.target.value)}
                                onBlur={validateFoodCategory}
                            >
                                <option value="">-- Select Food Category --</option>
                                <option value="Main Dish">Main Dish</option>
                                <option value="Sides">Sides</option>
                                <option value="Coffee">Coffee</option>
                                <option value="Non-Coffee">Non-Coffee</option>
                                <option value="Juice">Juice</option>
                                <option value="Tea">Tea</option>
                                <option value="Soft Drink">Soft Drink</option>
                                <option value="Beer">Beer</option>
                            </select>
                            {foodCategoryError && (
                                <p className="text-red-500 mt-1 text-sm">{foodCategoryError}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Image Link</label>
                            <input
                                className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${foodImgError ? "border-red-500" : ""}`}
                                type="text"
                                placeholder="Enter image URL"
                                value={foodImg}
                                onChange={e => setFoodImg(e.target.value)}
                                onBlur={validateFoodImg}
                            />
                            {foodImgError && (
                                <p className="text-red-500 mt-1 text-sm">{foodImgError}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Food Name</label>
                            <input
                                className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${foodNameError ? "border-red-500" : ""}`}
                                type="text"
                                placeholder="Enter food name"
                                value={foodName}
                                onChange={e => setFoodName(e.target.value)}
                                onBlur={validateFoodName}
                            />
                            {foodNameError && (
                                <p className="text-red-500 mt-1 text-sm">{foodNameError}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Chinese Name</label>
                            <input
                                className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${cnNameError ? "border-red-500" : ""}`}
                                type="text"
                                placeholder="Enter chinese name"
                                value={cnName}
                                onChange={e => setCnName(e.target.value)}
                                onBlur={validateCnName}
                            />
                            {cnNameError && (
                                <p className="text-red-500 mt-1 text-sm">{cnNameError}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Food Description</label>
                            <input
                                className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${cnNameError ? "border-red-500" : ""}`}
                                type="text"
                                placeholder="Enter food description"
                                value={foodDesc}
                                onChange={e => setFoodDesc(e.target.value)}
                                onBlur={validateFoodDesc}
                            />
                            {foodDescError && (
                                <p className="text-red-500 mt-1 text-sm">{foodDescError}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Price</label>
                            <input
                                className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${foodPriceError ? "border-red-500" : ""}`}
                                type="text"
                                placeholder="Enter price"
                                value={foodPrice}
                                onChange={e => setFoodPrice(e.target.value)}
                                onBlur={validateFoodPrice}
                            />
                            {foodPriceError && (
                                <p className="text-red-500 mt-1 text-sm">{foodPriceError}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Stocks</label>
                            <input
                                className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${cnNameError ? "border-red-500" : ""}`}
                                type="text"
                                placeholder="Enter stocks"
                                value={foodStocks}
                                onChange={e => setFoodStocks(e.target.value)}
                                onBlur={validateFoodStock}
                            />
                            {foodStocksError && (
                                <p className="text-red-500 mt-1 text-sm">{foodStocksError}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center mt-8">
                        <button onClick={saveMenu} className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-8 py-3 rounded-full shadow font-medium">
                            Save
                        </button>
                    </div>
                </div>
            </div>

            <div onClick={() => navigate(-1)} className="bg-agro-color absolute bottom-12 rounded-full px-6 py-2 w-45">
                <span className="text-white">
                    Back
                </span>
            </div>
        </div>
    )
};