
import { Outlet, Navigate } from "react-router-dom";

const PublicRoutes = () => {
  const user = JSON.parse(localStorage.getItem("userin"));
  return user ? <Navigate to="/blogs" /> : <Outlet />;
};

export default PublicRoutes;
