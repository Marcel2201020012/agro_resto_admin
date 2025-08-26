import { useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, setDoc, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AddUsersPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [role, setRole] = useState("user");

  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateUsername = async (username) => {
    if (!username || username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters long");
      return false;
    }

    const usernameToCheck = username.trim().toLowerCase();
    console.log({usernameToCheck});

    try {
      const q = query(collection(db, "admin_accounts"), where("username", "==", usernameToCheck));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setUsernameError("Username already exists");
        return false;
      }
      setUsernameError("");
      return true;
    } catch (error) {
      setUsernameError("Error checking account data");
      return false;
    }
  }

  const validatePassword = (password) => {
    if (!password || password.trim().length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleCreateUser = async () => {
    setLoading(true);

    //in Js, async functio always return Promise not Value, so we need await
    const isEmailValid = validateEmail(email);
    const isUsernameValid = await validateUsername(username); // await here
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isUsernameValid || !isPasswordValid) {
      setLoading(false);
      return;
    }


    try {
      const adminEmail = auth.currentUser.email;
      const adminPassword = prompt("Please enter master password to continue.");

      if (adminPassword === null || adminPassword === "") {
        setLoading(false);
        return;
      }

      //this one to check if pass is correct
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      //the funny thing is, after using createUserWithEmailAndPassword, firebase auto sign the current user with that account :v
      //so we need to sign back in with the correct email.
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

      // const usernameToLowerCase = username.trim().toLowerCase();

      await updateProfile(newUser, { displayName: role });
      console.log(adminEmail);
      
      await setDoc(doc(db, "admin_accounts", newUser.uid), {
        email,
        username,
        role,
        createdAt: new Date(),
      });

      alert("User created successfully!");

      setEmail("");
      setPassword("");
      setUsername("");
      setRole("user");
    } catch (error) {
      console.error("Error creating user:", error);
      alert(error.message || "Something went wrong while creating the user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-h-screen p-6 flex flex-col">
      <div className="mb-10">
        <div className="text-left text-agro-color font-medium text-lg">
          AGRO RESTO
        </div>
        <h1 className="text-left text-4xl font-bold">
          Add User
        </h1>
      </div>

      <div className="flex-1 flex justify-center items-start">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-left text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              {emailError && <p className="text-red-500 mt-1 text-sm">{emailError}</p>}
            </div>

            <div>
              <label className="block text-left text-sm font-medium text-gray-600 mb-1">
                Username
              </label>
              <input
                type="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              {usernameError && <p className="text-red-500 mt-1 text-sm">{usernameError}</p>}
            </div>

            <div>
              <label className="block text-left text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="text"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              {passwordError && <p className="text-red-500 mt-1 text-sm">{passwordError}</p>}
            </div>

            <div>
              <label className="block text-left text-sm font-medium text-gray-600 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super admin">Super Admin</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCreateUser}
            disabled={loading}
            className="w-full mt-4 bg-blue-600 text-white font-medium py-2.5 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Loading..." : "Add User"}
          </button>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate(-1)}
          disabled={loading}
          className={`bg-agro-color rounded-full px-6 py-2 w-45 text-white font-medium hover:opacity-90 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Back
        </button>
      </div>
    </div>
  );
};