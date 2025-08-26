import { Background } from "../components/Background";
import { LoginForm } from "../components/LoginForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

import bg from "../assets/bg/bg_1.png"

export const LoginPage = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate("/tools");
            } else{
                setLoading(false);
            }
        });
        return () => unsub();
    }, [navigate]);

    if (loading) return <div className="container min-h-screen flex justify-center items-center">
                <p className="text-lg font-semibold">Loading...</p>
            </div>;

    return (
        <div className="min-h-screen overflow-hidden">
            <Background bg={bg}/>

            <main>
                <LoginForm />
            </main>
        </div>
    );
};
