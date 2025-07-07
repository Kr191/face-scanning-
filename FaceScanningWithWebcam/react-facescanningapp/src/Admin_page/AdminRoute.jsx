import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

function AdminRoute() {
  const [authorized, setAuthorized] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios
      .get(`${API_URL}/api/check-admin-access`)
      .then(() => setAuthorized(true))
      .catch(() => setAuthorized(false));
  }, []);

  if (authorized === null) return <div>Loading...</div>;
  if (authorized === false) return navigate("/forbidden");

  return <Outlet />;
}

export default AdminRoute;
