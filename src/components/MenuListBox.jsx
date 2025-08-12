import { Edit, Trash } from "lucide-react"
import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export const MenuListBox = ({ id, img, name, cn, price }) => {
    const originalValues = { img, name, cn, price };

    const [tempImg, setTempImg] = useState(img);
    const [tempName, setTempName] = useState(name);
    const [tempCn, setTempCn] = useState(cn);
    const [tempPrice, setTempPrice] = useState(price);

    const [foodNameError, setFoodNameError] = useState("");
    const [cnNameError, setCnNameError] = useState("");
    const [foodImgError, setFoodImgError] = useState("");
    const [foodPriceError, setFoodPriceError] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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

    const validateFoodName = (nameToCheck) => {
        if (nameToCheck.trim().length < 1) {
            setFoodNameError("Please enter the food name.");
            return false;
        }
        setFoodNameError("");
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

    const handleEditToggle = () => {
        if (!isEditing) {
            setTempImg("");
            setTempName("");
            setTempCn("");
            setTempPrice("");
        }
        setIsEditing(!isEditing);
    };

    const handleBlur = (field) => {
        if (field === "img" && !tempImg) setTempImg(originalValues.img);
        if (field === "name" && !tempName) setTempName(originalValues.name);
        if (field === "chinese" && !tempCn) setTempCn(originalValues.cn);
        if (field === "price" && !tempPrice) setTempPrice(originalValues.price);

        if (field === "img" && tempImg) validateFoodImg();
        if (field === "name" && tempName) validateFoodName();
        if (field === "chinese" && tempCn) validateCnName();
        if (field === "price" && tempPrice) validateFoodPrice();
    };

    const handleSave = async () => {
        const updatedValues = {
            image: tempImg.trim() === "" ? originalValues.img : tempImg,
            name: tempName.trim() === "" ? originalValues.name : tempName,
            cn: tempCn.trim() === "" ? originalValues.cn : tempCn,
            price: tempPrice.trim() === "" ? originalValues.price : tempPrice,
        };

        if (
            !validateFoodName(updatedValues.name) ||
            !validateCnName(updatedValues.cn) ||
            !validateFoodPrice(updatedValues.price) ||
            !validateFoodImg(updatedValues.image)
        ) {
            return;
        }

        setIsSaving(true);

        setTempImg(updatedValues.image);
        setTempName(updatedValues.name);
        setTempCn(updatedValues.cn);
        setTempPrice(updatedValues.price);

        await updateDoc(doc(db, "menu_makanan", id), updatedValues);

        originalValues.img = updatedValues.image;
        originalValues.name = updatedValues.name;
        originalValues.cn = updatedValues.cn;
        originalValues.price = updatedValues.price;

        setTempImg(updatedValues.image);
        setTempName(updatedValues.name);
        setTempCn(updatedValues.cn);
        setTempPrice(updatedValues.price);

        setIsSaving(false);
        setIsEditing(false);
    };


    const handleDelete = async () => {
        await deleteDoc(doc(db, "menu_makanan", id));
        setShowConfirm(false);
    };

    return (
        <div className="bg-white border rounded-2xl px-6 py-4 shadow-md w-3/4">
            <div className="flex gap-8 items-center">
                <img
                    src={tempImg || originalValues.img}
                    alt="menu_icon"
                    className="h-32 w-32 object-cover rounded-lg"
                />

                <div className="flex flex-col flex-1 gap-3">
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
                    <input
                        className={`border rounded-lg px-3 py-2 ${isEditing ? "border-blue-400" : "border-gray-300"
                            }`}
                        type="text"
                        value={tempPrice}
                        placeholder="Input food price"
                        onChange={(e) => setTempPrice(e.target.value)}
                        onBlur={() => handleBlur("price")}
                        readOnly={!isEditing}
                    />
                    {foodPriceError && (
                        <p className="text-red-500 mt-1 text-sm">{foodPriceError}</p>
                    )}
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