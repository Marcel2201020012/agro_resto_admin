import { useState } from "react";
import { auth } from "../../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const LoginForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.email && formData.password) {
            try{
                const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;
                console.log("signed in: ", user);
                navigate("/tools");
            } catch (error){
                console.error("Login error: ", error);
                setError(error.message);
            }
        } else{
            setError("Please enter email and password")
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-start gap-8 pt-4">
            <div className="font-bold text-white text-center text-3xl">
                <span>Agro Hotel Restaurant</span>
                <br />
                <span>Admin Panel</span>
            </div>

            <div className="border border-none rounded-4xl bg-agro-color p-12 w-5/12 flex flex-col space-y-12">
                <div className="text-white flex flex-col space-y-4">
                    <div className="font-semibold text-4xl">Login</div>
                    <div className="font-medium">Please enter your credentials below to continue</div>
                </div>

                <form className="text-white flex flex-col gap-2 w-full max-w-sm mx-auto items-center">
                    <label htmlFor="email" className="text-left font-medium w-full">email</label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        required
                        className="w-full p-1 rounded bg-white text-black"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <label className="text-left font-medium w-full">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        className="w-full p-1 rounded bg-white text-black"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <button
                        type="submit"
                        className="mt-2 rounded bg-white text-black font-semibold py-2 w-1/4"
                        onClick={handleSubmit}
                    >
                        Login
                    </button>
                    {error && <p className="text-red-500">{error}</p>}
                </form>
            </div>
        </div>
    );
}