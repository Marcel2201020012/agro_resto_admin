import { Background } from "../components/Background";
import { LoginForm } from "../components/LoginForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

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

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="min-h-screen overflow-x-hidden overflow-y-hidden m-16">
            <Background />

            <main>
                <LoginForm />
            </main>
        </div>
    );
};
