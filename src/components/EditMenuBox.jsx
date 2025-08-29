import { Edit, Trash } from "lucide-react"
import { useState } from "react";
import { doc, updateDoc, deleteDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../hooks/useAuth";

import { Loader2 } from "lucide-react";

export const EditMenuBox = ({ id, img, name, desc, cn, price, promotion, stocks, solds }) => {
    const { userData, checking } = useAuth();
    const originalValues = { img, name, desc, cn, price, promotion, stocks, solds };

    const [tempImg, setTempImg] = useState(img);
    const [tempName, setTempName] = useState(name);
    const [tempDesc, setTempDesc] = useState(desc);
    const [tempCn, setTempCn] = useState(cn);
    const [tempPrice, setTempPrice] = useState(price);
    const [tempPromotionPrice, setTempPromotionPrice] = useState(promotion);
    const [tempStocks, setTempStocks] = useState(stocks);
    const [tempSolds, setTempSolds] = useState(solds);

    const [foodImgError, setFoodImgError] = useState("");
    const [foodNameError, setFoodNameError] = useState("");
    const [foodDescError, setFoodDescError] = useState("");
    const [cnNameError, setCnNameError] = useState("");
    const [foodPriceError, setFoodPriceError] = useState("");
    const [promotionPriceError, setPromotionPriceError] = useState();
    const [foodStocksError, setFoodStocksError] = useState();
    const [soldsError, setSoldsError] = useState();

    const [isEditing, setIsEditing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // const addStocksField = async (value) => {
    //     try {
    //         const querySnapshot = await getDocs(collection(db, "menu_makanan"));
    //         const updates = querySnapshot.docs.map((document) => {
    //             const ref = doc(db, "menu_makanan", document.id);
    //             return updateDoc(ref, { promotion: value });
    //         });

    //         await Promise.all(updates);
    //         console.log(`✅ Added stocks field with value ${value} to all menu items`);
    //     } catch (error) {
    //         console.error("❌ Error updating stocks:", error);
    //     }
    // };

    // useState(() =>{
    //     addStocksField(0)
    // })

    const validateFoodImg = (imgToCheck) => {
        if (imgToCheck.trim().length < 1) {
            setFoodImgError("Please enter the food image link.");
            return false;
        }
        try {
            new URL(imgToCheck);
        } catch (_) {
            setFoodImgError("Please enter a valid URL.");
            return false;
        }
        setFoodImgError("");
        return true;
    };

    const validateFoodName = (nameToCheck) => {
        if (nameToCheck.trim().length < 1) {
            setFoodNameError("Please enter the food name.");
            return false;
        }
        setFoodNameError("");
        return true;
    };

    const validateCnName = (cnToCheck) => {
        const value = cnToCheck.trim().normalize('NFKC').replace(/\u3000/g, ' ');

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

    const validateFoodDesc = (descToCheck) => {
        if (descToCheck.trim().length < 1) {
            setFoodDescError("Please enter food description.");
            return false;
        }
        setFoodDescError("");
        return true;
    };

    const validateFoodPrice = (priceToCheck) => {
        if (priceToCheck.trim().length < 1) {
            setFoodPriceError("Please enter the food price.");
            return false;
        }
        if (isNaN(priceToCheck) || Number(priceToCheck) <= 0) {
            setFoodPriceError("Please enter a valid positive number.");
            return false;
        }
        setFoodPriceError("");
        return true;
    };

    const validatePromotionPrice = (promotionToCheck, priceToCheck) => {
        if (isNaN(priceToCheck) || isNaN(promotionToCheck) || Number(promotionToCheck) < 0 || Number(promotionToCheck) > Number(priceToCheck)) {
            setPromotionPriceError("Please enter value lower than normal price.");
            return false;
        }
        setPromotionPriceError("");
        return true;
    }

    const validateFoodStock = (stockToCheck) => {
        const num = Number(stockToCheck);

        if (stockToCheck === "" || isNaN(num)) {
            setFoodStocksError("Please enter the food stock.");
            return false;
        }
        if (num < 0) {
            setFoodStocksError("Please enter a valid positive number.");
            return false;
        }

        setFoodStocksError("");
        return true;
    };

    const validateSolds = (soldsToCheck) => {
        const num = Number(soldsToCheck);

        if (soldsToCheck === "" || isNaN(num)) {
            setSoldsError("Please enter valid solds value.");
            return false;
        }
        if (num < 0) {
            setSoldsError("Please enter a valid positive number.");
            return false;
        }

        setSoldsError("");
        return true;
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            setTempImg("");
            setTempName("");
            setTempCn("");
            setTempDesc("");
            setTempPrice("");
            setTempPromotionPrice("");
            setTempStocks("");
            setTempSolds("");
        }
        setIsEditing(!isEditing);
    };

    const handleBlur = (field) => {
        if (!isEditing) return;

        if (field === "img" && !tempImg) setTempImg(originalValues.img);
        if (field === "name" && !tempName) setTempName(originalValues.name);
        if (field === "chinese" && !tempCn) setTempCn(originalValues.cn);
        if (field === "desc" && !tempDesc) setTempDesc(originalValues.desc);
        if (field === "price" && !tempPrice) setTempPrice(originalValues.price);
        if (field === "promotion" && !tempPromotionPrice) setTempPromotionPrice(originalValues.promotion);
        if (field === "stocks" && !tempStocks) setTempStocks(originalValues.stocks);
        if (field === "solds" && !tempSolds) setTempSolds(originalValues.solds);

        if (field === "img" && tempImg) validateFoodImg(tempImg);
        if (field === "name" && tempName) validateFoodName(tempName);
        if (field === "chinese" && tempCn) validateCnName(tempCn);
        if (field === "desc" && tempDesc) validateFoodDesc(tempDesc);
        if (field === "price" && tempPrice) validateFoodPrice(tempPrice);
        if (field === "promotion" && tempPromotionPrice) validatePromotionPrice(tempPromotionPrice, price);
        if (field === "stocks" && tempStocks) validateFoodStock(tempStocks);
        if (field === "solds" && tempSolds) validateSolds(tempSolds);
    };

    const handleSave = async () => {
        const updatedValues = {
            image: tempImg.trim() === "" ? originalValues.img : tempImg,
            name: tempName.trim() === "" ? originalValues.name : tempName,
            cn: tempCn.trim() === "" ? originalValues.cn : tempCn,
            desc: tempDesc.trim() === "" ? originalValues.desc : tempDesc,
            price: tempPrice.trim() === "" ? originalValues.price : tempPrice,
            promotion: tempPromotionPrice === "" ? originalValues.promotion : Number(tempPromotionPrice),
            stocks: tempStocks === "" ? originalValues.stocks : Number(tempStocks),
            solds: tempSolds === "" ? originalValues.solds : Number(tempSolds),
        };

        if (
            !validateFoodImg(updatedValues.image) ||
            !validateFoodName(updatedValues.name) ||
            !validateCnName(updatedValues.cn) ||
            !validateFoodDesc(updatedValues.desc) ||
            !validateFoodPrice(updatedValues.price) ||
            !validatePromotionPrice(updatedValues.promotion, price) ||
            !validateFoodStock(updatedValues.stocks) ||
            !validateSolds(updatedValues.solds)
        ) {
            return;
        }

        setIsSaving(true);

        setTempImg(updatedValues.image);
        setTempName(updatedValues.name);
        setTempCn(updatedValues.cn);
        setTempDesc(updatedValues.desc);
        setTempPrice(updatedValues.price);
        setTempPromotionPrice(updatedValues.promotion);
        setTempStocks(updatedValues.stocks);
        setTempSolds(updatedValues.solds);

        await updateDoc(doc(db, "menu_makanan", id), updatedValues);

        originalValues.img = updatedValues.image;
        originalValues.name = updatedValues.name;
        originalValues.cn = updatedValues.cn;
        originalValues.price = updatedValues.price;
        originalValues.promotion = updatedValues.promotion;
        originalValues.stocks = updatedValues.stocks;
        originalValues.solds = updatedValues.solds;

        setTempImg(updatedValues.image);
        setTempName(updatedValues.name);
        setTempCn(updatedValues.cn);
        setTempPrice(updatedValues.price);
        setTempPromotionPrice(updatedValues.promotion);
        setTempStocks(updatedValues.stocks);
        setTempSolds(updatedValues.solds);

        setIsSaving(false);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        await deleteDoc(doc(db, "menu_makanan", id));
        setShowConfirm(false);
    };

    if (checking) {
        return (
            <div className="container min-h-screen flex justify-center items-center">
                <Loader2 />
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-2xl px-6 py-4 shadow-md">
            <div className="flex gap-8 items-center">
                <img
                    src={tempImg || originalValues.img}
                    alt="menu_icon"
                    className="h-40 w-40 object-cover rounded-lg"
                />

                <div className="grid grid-cols-2 gap-3 flex-1">
                    {/* {userData?.role !== "user" && <> */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-left font-medium text-gray-700">Image Link</label>
                            <input
                                className={`border rounded-lg px-3 py-2 ${isEditing ? "border-blue-400" : "border-gray-300"
                                    }`}
                                type="text"
                                value={tempImg}
                                placeholder="Input food image link"
                                onChange={(e) => setTempImg(e.target.value)}
                                onBlur={() => handleBlur("img")}
                                readOnly={!isEditing}
                            />
                            {foodImgError && (
                                <p className="text-red-500 mt-1 text-sm">{foodImgError}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-left font-medium text-gray-700">Food Name</label>
                            <input
                                className={`border rounded-lg px-3 py-2 ${isEditing ? "border-blue-400" : "border-gray-300"
                                    }`}
                                type="text"
                                value={tempName}
                                placeholder="Input food name"
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={() => handleBlur("name")}
                                readOnly={!isEditing}
                            />
                            {foodNameError && (
                                <p className="text-red-500 mt-1 text-sm">{foodNameError}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-left font-medium text-gray-700">Chinese Name</label>
                            <input
                                className={`border rounded-lg px-3 py-2 ${isEditing ? "border-blue-400" : "border-gray-300"
                                    }`}
                                type="text"
                                value={tempCn}
                                placeholder="Input chinese name"
                                onChange={(e) => setTempCn(e.target.value)}
                                onBlur={() => handleBlur("chinese")}
                                readOnly={!isEditing}
                            />
                            {cnNameError && (
                                <p className="text-red-500 mt-1 text-sm">{cnNameError}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-left font-medium text-gray-700">Food Description</label>
                            <input
                                className={`border rounded-lg px-3 py-2 ${isEditing ? "border-blue-400" : "border-gray-300"
                                    }`}
                                type="text"
                                value={tempDesc}
                                placeholder="Input Food Description"
                                onChange={(e) => setTempDesc(e.target.value)}
                                onBlur={() => handleBlur("desc")}
                                readOnly={!isEditing}
                            />
                            {foodDescError && (
                                <p className="text-red-500 mt-1 text-sm">{foodDescError}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-left font-medium text-gray-700">Food Price</label>
                            <input
                                className={`border rounded-lg px-3 py-2 ${isEditing ? "border-blue-400" : "border-gray-300"
                                    }`}
                                type="text"
                                value={tempPrice}
                                placeholder="Input Food Price"
                                onChange={(e) => setTempPrice(e.target.value)}
                                onBlur={() => handleBlur("price")}
                                readOnly={!isEditing}
                            />
                            {foodPriceError && (
                                <p className="text-red-500 mt-1 text-sm">{foodPriceError}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-left font-medium text-gray-700">Promotion Price</label>
                            <input
                                className={`border rounded-lg px-3 py-2 ${isEditing ? "border-blue-400" : "border-gray-300"
                                    }`}
                                type="text"
                                value={tempPromotionPrice}
                                placeholder="Input Promo"
                                onChange={(e) => setTempPromotionPrice(e.target.value)}
                                onBlur={() => handleBlur("promotion")}
                                readOnly={!isEditing}
                            />
                            {promotionPriceError && (
                                <p className="text-red-500 mt-1 text-sm">{promotionPriceError}</p>
                            )}
                        </div>
                    {/* </>} */}

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-left font-medium text-gray-700">Food Stocks</label>
                        <input
                            className={`border rounded-lg px-3 py-2 ${isEditing ? "border-blue-400" : "border-gray-300"
                                }`}
                            type="text"
                            value={tempStocks}
                            placeholder="Input food stock"
                            onChange={(e) => setTempStocks(e.target.value)}
                            onBlur={() => handleBlur("stocks")}
                            readOnly={!isEditing}
                        />
                        {foodStocksError && (
                            <p className="text-red-500 mt-1 text-sm">{foodStocksError}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-left font-medium text-gray-700">Solds</label>
                        <input
                            className={`border rounded-lg px-3 py-2 ${isEditing ? "border-blue-400" : "border-gray-300"
                                }`}
                            type="text"
                            value={tempSolds}
                            placeholder="Input Solds"
                            onChange={(e) => setTempSolds(e.target.value)}
                            onBlur={() => handleBlur("solds")}
                            readOnly={!isEditing}
                        />
                        {soldsError && (
                            <p className="text-red-500 mt-1 text-sm">{soldsError}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow text-white ${isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                                }`}>
                            {isSaving ? (
                                <>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Edit size={16} />
                                    Save
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleEditToggle}
                            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg shadow"
                        >
                            <Edit size={16} />
                            Edit
                        </button>
                    )}
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={isSaving || isEditing}
                        className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow ${isEditing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                            }`}
                    >
                        <Trash size={16} />
                        Delete
                    </button>
                </div>

                {showConfirm && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white rounded-xl p-6 shadow-lg w-1/2">
                            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
                            <p className="mb-6">Are you sure you want to delete <b>{name}</b>?</p>
                            <div className="flex justify-center gap-8">
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};