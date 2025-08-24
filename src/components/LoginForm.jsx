import { useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export const LoginForm = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });

    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLogin(true);
        setError(null);

        const { identifier, password } = formData;

        if (!identifier || !password) {
            setError("Please enter email/username and password");
            setIsLogin(false);
            return;
        }

        try {
            let email = identifier;

            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(identifier)) {
                const q = query(collection(db, "admin_accounts"), where("username", "==", identifier));
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    setError("This account has been deleted or does not exist.");
                    setIsLogin(false);
                    return;
                }

                email = snapshot.docs[0].data().email;
            }

            const q2 = query(collection(db, "admin_accounts"), where("email", "==", email));
            const querySnapshot = await getDocs(q2);

            if (querySnapshot.empty) {
                setError("This account has been deleted or does not exist.");
                setIsLogin(false);
                return;
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("signed in: ", user);

            navigate("/tools");
        } catch (error) {
            console.error("Login error: ", error);
            setError(error.message);
        } finally {
            setIsLogin(false);
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
                    <label htmlFor="email" className="text-left font-medium w-full">Email or Username</label>
                    <input
                        type="text"
                        id="email"
                        name="identifier"
                        required
                        className="w-full p-1 rounded bg-white text-black"
                        placeholder="Please enter your Email or Username"
                        value={formData.identifier}
                        onChange={handleChange}
                    />

                    <label htmlFor="password" className="text-left font-medium w-full">Password</label>
                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            required
                            className="w-full p-1 rounded bg-white text-black"
                            placeholder="Please enter your Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                            tabIndex={-1}
                        >
                            {showPassword ? <Eye /> : <EyeOff />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="mt-2 rounded bg-white text-black font-semibold py-2 w-1/4"
                        onClick={handleSubmit}
                        disabled={isLogin}
                    >
                        {!isLogin ? <span>Login</span> : <span>Loading...</span>}
                    </button>
                    {error && <p className="text-red-500">{error}</p>}
                </form>
            </div>
        </div>
    );
}