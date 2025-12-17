import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useSecureAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      const from = `${location.pathname}${location.search}`;
      navigate("/auth", { replace: true, state: { from } });
    }
  }, [user, loading, navigate, location.pathname, location.search]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;