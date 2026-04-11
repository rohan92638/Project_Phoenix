import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    // Check for real JWT token, not just a truthy string flag
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;