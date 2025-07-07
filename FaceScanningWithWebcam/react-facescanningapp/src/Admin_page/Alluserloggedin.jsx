import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";
import { useNavigate } from "react-router-dom";
import "./Alluser.css";

const Alluser = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/api/getalluserloggedin`)
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, []);
  // Sort users by loggedInAt descending (latest first)
  const sortedUsers = [...users].sort((a, b) => {
    // If loggedInAt is missing, treat as oldest
    if (!a.loggedInAt) return 1;
    if (!b.loggedInAt) return -1;
    return new Date(b.loggedInAt) - new Date(a.loggedInAt);
  });

  return (
    <div>
      <title>All User Logged In</title>
      <AdminNavbar />
      <div className="alluser-container">
        <h3 className="alluser-title">Logged in history:</h3>

        {sortedUsers.map((user) => (
          <div key={user._id} className="user-card">
            <div className="user-info">
              <div className="user-name">
                {user.first_name}
                {"   "}
                {user.last_name}
              </div>
              <div className="user-meta">
                Logged in time:{" "}
                {user.loggedInAt
                  ? new Date(user.loggedInAt).toLocaleString()
                  : "-"}{" "}
                {"      "}
              </div>
            </div>

            <button
              className="detail-btn"
              onClick={() => navigate(`/admin/usersloggedin/${user._id}`)}
            >
              Detail
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alluser;
