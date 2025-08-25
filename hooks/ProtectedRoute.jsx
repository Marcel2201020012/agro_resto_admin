import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { userData, checking } = useAuth();

  if (checking) {
    return <div className="container min-h-screen flex justify-center items-center">
      <p className="text-lg font-semibold">Loading...</p>
    </div>
  }

  if (!userData || !allowedRoles.includes(userData.role)) {
    return <Navigate to="*" replace />;
  }

  return children;
}
