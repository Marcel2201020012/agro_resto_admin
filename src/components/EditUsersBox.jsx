import { Edit, Trash } from "lucide-react"
import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

export const EditUsersBox = ({ uid, email, role }) => {
    const originalValues = { email, role };

    const [tempEmail, setTempEmail] = useState(email);
    const [tempRole, setTempRole] = useState(role);

    const [tempEmailError, setTempEmailError] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
            setTempEmailError("Please enter a valid email address");
            return false;
        }
        setTempEmailError("");
        return true;
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            setTempEmail("");
            setTempPassword("");
            setTempRole("user");
        }
        setIsEditing(!isEditing);
    };

    const handleBlur = (field) => {
        if (!isEditing) return;

        if (field === "email" && !tempEmail) setTempEmail(originalValues.email);

        if (field === "email" && tempEmail) validateEmail(tempEmail);
    };

    const handleSave = async () => {
        const updatedValues = {
            email: tempEmail.trim() === "" ? originalValues.email : tempEmail,
            role: tempRole,
        };

        if (
            !validateEmail(updatedValues.email)
        ) {
            return;
        }

        setIsSaving(true);

        setTempEmail(updatedValues.email);

        await updateDoc(doc(db, "admin_accounts", uid), updatedValues);

        originalValues.email = updatedValues.email;
        originalValues.role = updatedValues.role;

        setTempEmail(updatedValues.email);
        setTempRole(updatedValues.role);

        setIsSaving(false);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        setShowConfirm(false);
        try {
            await deleteDoc(doc(db, "admin_accounts", uid));
            await sendPasswordResetEmail(auth, email);
        } catch (err) {
            console.error("Failed to delete admin:", err);
            alert("Failed to delete admin. Check console.");
        }
    }

    return (
        <div className="bg-white border rounded-2xl px-6 py-4 shadow-md">
            <div className="flex gap-8 items-center">
                <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-left font-medium text-gray-700">Email</label>
                        <input
                            className={`border rounded-lg px-3 py-2 ${isEditing ? "border-blue-400" : "border-gray-300"
                                }`}
                            type="email"
                            value={tempEmail}
                            placeholder="Input email"
                            onChange={(e) => setTempEmail(e.target.value)}
                            onBlur={() => handleBlur("email")}
                            readOnly={!isEditing}
                        />
                        {tempEmailError && (
                            <p className="text-red-500 mt-1 text-sm">{tempEmailError}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-left font-medium text-gray-700">Role</label>
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={tempRole}
                            onChange={e => setTempRole(e.target.value)}
                            disabled={!isEditing}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="super admin">Super Admin</option>
                        </select>
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
                        <div></div>
                        // <button
                        //     onClick={handleEditToggle}
                        //     className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg shadow"
                        // >
                        //     <Edit size={16} />
                        //     Edit
                        // </button>
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
                            <p className="mb-6">Delete <b>{email}</b>?</p>
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
}