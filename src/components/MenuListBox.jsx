import { Edit, Trash } from "lucide-react"
import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export const MenuListBox = ({ id, img, name, price }) => {
    const originalValues = { img, name, price };

    // Each field has its own state
    const [tempImg, setTempImg] = useState(img);
    const [tempName, setTempName] = useState(name);
    const [tempPrice, setTempPrice] = useState(price);

    // Edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleEditToggle = () => {
        if (!isEditing) {
            // Going into edit mode → clear fields to show placeholders
            setTempImg("");
            setTempName("");
            setTempPrice("");
        }
        setIsEditing(!isEditing);
    };

    const handleBlur = (field) => {
        if (field === "img" && !tempImg) setTempImg(originalValues.img);
        if (field === "name" && !tempName) setTempName(originalValues.name);
        if (field === "price" && !tempPrice) setTempPrice(originalValues.price);
    };

    const handleSave = async () => {
        const updatedValues = {
            image: tempImg.trim() === "" ? originalValues.img : tempImg,
            name: tempName.trim() === "" ? originalValues.name : tempName,
            price: tempPrice.trim() === "" ? originalValues.price : tempPrice,
        };

        await updateDoc(doc(db, "menu_makanan", id), updatedValues);

        // Update original values so next edit uses fresh data
        originalValues.img = updatedValues.image;
        originalValues.name = updatedValues.name;
        originalValues.price = updatedValues.price;

        // Update state with final values
        setTempImg(updatedValues.image);
        setTempName(updatedValues.name);
        setTempPrice(updatedValues.price);

        setIsEditing(false);
    };


    const handleDelete = async () => {
        await deleteDoc(doc(db, "menu_makanan", id));
        setShowConfirm(false);
    };

    return (
        <div className="bg-white border rounded-2xl px-6 py-4 shadow-md w-3/4">
            <div className="flex gap-8 items-center">
                {/* Food image */}
                <img
                    src={tempImg || originalValues.img}
                    alt="menu_icon"
                    className="h-32 w-32 object-cover rounded-lg"
                />

                {/* Inputs */}
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
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow"
                        >
                            <Edit size={16} />
                            Save
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
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
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