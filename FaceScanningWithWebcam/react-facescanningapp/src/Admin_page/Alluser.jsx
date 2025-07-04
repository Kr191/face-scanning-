import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";
import { useNavigate } from "react-router-dom";
import "./Alluser.css";

const Alluser = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/getusers`)
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, []);

  // Sort users by created_at descending (latest first)
  const sortedUsers = [...users].sort((a, b) => {
    if (!a.created_at) return 1;
    if (!b.created_at) return -1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div>
      <AdminNavbar />
      <div className="alluser-container">
        <h3 className="alluser-title">User:</h3>

        {sortedUsers.map((user) => (
          <div key={user._id} className="user-card">
            <div className="user-info">
              <div className="user-name">
                {user.first_name}
                {"   "}
                {user.last_name}
              </div>
              <div className="user-meta">
                Created at:{" "}
                {user.created_at
                  ? new Date(user.created_at).toLocaleString()
                  : "-"}
                {",      "}
                Updated at:{" "}
                {user.updated_at
                  ? new Date(user.updated_at).toLocaleString()
                  : "-"}{" "}
              </div>
            </div>

            <button
              className="detail-btn"
              onClick={() => navigate(`/admin/users/user/${user._id}`)}
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
