import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function RequireAuth({ children }){
  const {user, checking} = useAuth();
  const navigate = useNavigate();

  if (checking) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!user){
    navigate("/logn");
    return null;
  }

  return children;
};