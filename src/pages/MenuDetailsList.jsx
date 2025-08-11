import { useEffect, useState } from "react";
import { MenuListBox } from "../components/MenuListBox";
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";

export const MenuDetailsList = () => {
    const navigate = useNavigate();
    const [order, setOrder] = useState([]);
    const location = useLocation();
    const category = location.state;

    const [foodName, setFoodName] = useState("");
    const [foodNameError, setFoodNameError] = useState("");

    const [cnName, setCnName] = useState("");
    const [cnNameError, setCnNameError] = useState("");

    const [foodPrice, setFoodPrice] = useState("");
    const [foodPriceError, setFoodPriceError] = useState("");

    const [foodImg, setFoodImg] = useState("");
    const [foodImgError, setFoodImgError] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "menu_makanan"), (snapshot) => {
            const orderData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrder(orderData);
            setIsLoading(false);
        })

        return () => unsub();
    }, []);

    const getOrderByCategory = (category) => {
        return order
            .filter(item => item.category === category && item.createdAt)
            .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    };

    const orders = getOrderByCategory(category);

    const validateFoodName = () => {
        if (foodName.trim().length < 1) {
            setFoodNameError("Please enter the food name.");
            return false;
        }
        setFoodNameError("");
        return true;
    };

    const validateCnName = () => {
        const value = foodName.trim();

        if (value.length === 0) {
            setCnNameError("Please enter the Chinese name.");
            return false;
        }

        const onlyChineseRegex = /^[\u4e00-\u9fff0-9·\s]+$/;
        if (!onlyChineseRegex.test(value)) {
            setCnNameError("Only Chinese characters, numbers, and spaces are allowed.");
            return false;
        }

        setCnNameError("");
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

    const saveMenu = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        if (!validateFoodName() || !validateCnName || !validateFoodPrice() || !validateFoodImg()) {
            setIsSaving(false);
            return;
        }

        const menu = {
            name: foodName,
            cn: cnName,
            image: foodImg,
            price: foodPrice,
            category: category,
            createdAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "menu_makanan"), menu);
        } catch (error) {
            console.error("Error saving menu:", error);
        } finally {
            setIsSaving(false);
        }

        setFoodName("");
        setFoodPrice("");
        setFoodImg("");
        setCnName("");
    };

    if (isSaving) {
        return (
            <div className="container min-h-screen flex justify-center items-center">
                <p className="text-lg font-semibold">Saving new menu...</p>
            </div>
        )
    }

    if (!order.every(item => item.createdAt) || isLoading) {
        return <div>Loading Menu List...</div>;
    }

    return (
        <div className="container min-h-screen overflow-x-hidden">
            <div className="relative text-left pt-8 pb-12">
                <div className="text-agro-color font-medium">AGRO RESTO</div>
                <div className="text-4xl font-bold">Edit Menu</div>
            </div>

            <div className="flex justify-center">
                <div className="text-left bg-white border p-8 rounded-2xl w-3/4">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Food Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Name</label>
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
                    </div>

                    <div className="flex justify-center mt-8">
                        <button onClick={saveMenu} className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-8 py-3 rounded-full shadow font-medium">
                            Save
                        </button>
                    </div>
                </div>
            </div>


            <div className="text-left mt-8 font-bold text-4xl">
                Menu List
            </div>

            <div className="flex flex-col items-center justify-center gap-8 mt-8 mb-8">
                {orders.length === 0 ? (
                    <div>Menu is empty</div>
                ) : (
                    orders.map(order => (
                        <MenuListBox
                            key={order.id}
                            id={order.id}
                            img={order.image}
                            name={order.name}
                            cn={order.cn}
                            price={order.price}
                        />
                    ))
                )}
            </div>

            <div onClick={() => navigate(-1)} className="bg-agro-color rounded-full px-6 py-2 w-45 mb-8">
                <span className="text-white">
                    Back
                </span>
            </div>
        </div>
    );
}