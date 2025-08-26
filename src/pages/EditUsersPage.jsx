import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../../firebase/firebaseConfig";
import { onSnapshot, collection } from "firebase/firestore";

import { EditUsersBox } from "../components/EditUsersBox";

export const EditUsersPage = () => {
    const navigate = useNavigate();
    const [account, setAccount] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "admin_accounts"), (snapshot) => {
            let data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            data = data.filter((acc) => acc.role !== "super admin");

            setAccount(data);
            setIsLoading(false);
        });

        return () => unsub();
    }, []);

    const getAdminByCreateAt = () => account;

    const admins = getAdminByCreateAt();

    if (isLoading) {
        return (
            <div className="container min-h-screen flex justify-center items-center">
                <p className="text-lg font-semibold">Loading Users Data...</p>
            </div>
        );
    }

    return (
        <div className="container min-h-screen overflow-x-hidden">
            <div className="text-left pt-8">
                <div onClick={() => navigate("/", { replace: true })} className="text-agro-color font-medium cursor-pointer">
                    AGRO RESTO
                </div>
                <div className="text-4xl font-bold">
                    Edit User
                </div>
            </div>

            <div className="grid grid-cols-2 items-center justify-center gap-8 mt-8 mb-8">
                {
                    admins.map(admin => (
                        <EditUsersBox
                            key={admin.id}
                            uid={admin.id}
                            username={admin.username}
                            role={admin.role}
                        />
                    ))
                }
            </div>

            <div onClick={() => navigate(-1)} className="bg-agro-color absolute bottom-12 rounded-full px-6 py-2 w-45">
                <span className="text-white">
                    Back
                </span>
            </div>
        </div>
    );
}