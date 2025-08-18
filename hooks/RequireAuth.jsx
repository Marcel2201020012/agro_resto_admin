import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function RequireAuth({ children }){
  const {user, checking} = useAuth();
  const navigate = useNavigate();

  if (checking) {
    return <div className="container min-h-screen flex justify-center items-center">
                <p className="text-lg font-semibold">Loading...</p>
            </div>;
  }

  if (!user){
    navigate("/login");
    return null;
  }

  return children;
};