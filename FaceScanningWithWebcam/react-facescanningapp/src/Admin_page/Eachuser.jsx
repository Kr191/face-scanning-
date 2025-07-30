import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";
import { useParams, useNavigate } from "react-router-dom";
import "./Eachuser.css";

const Eachuser = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState(null);
  const [loggedin, setLoggedin] = useState([]);
  const { user_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/getuser/${user_id}`)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      });

    axios
      .get(`/api/getloggedin/${user_id}`)
      .then((res) => {
        setLoggedin(res.data);
      })
      .catch((err) => {
        console.error("Error fetching login history:", err);
      });
  }, [API_URL, user_id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/deleteuser/${user_id}`);
        navigate("/admin/users");
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <title>User Details</title>
      <AdminNavbar />
      <div className="eachuser-main">
        {/* User image and buttons */}
        <div className="eachuser-img-btns">
          <img src={user.image_url} alt="user" />
          <br /> <br />
          <button
            onClick={() => navigate(`/admin/users/user/updateuser/${user._id}`)}
            className="eachuser-edit-btn"
          >
            EDIT
          </button>
          <br /> <br />
          <button onClick={handleDelete} className="eachuser-delete-btn">
            DELETE
          </button>
        </div>

        {/* User info */}
        <div className="eachuser-info">
          <h2>
            {user.first_name} {user.last_name}
          </h2>
          <br />
          <div className="eachuser-meta">
            <h5>
              Created at:{" "}
              {user.created_at
                ? new Date(user.created_at).toLocaleString()
                : "-"}
              {",   "}
              Updated at:{" "}
              {user.updated_at
                ? new Date(user.updated_at).toLocaleString()
                : "-"}
            </h5>
          </div>

          {/* Log-in history */}
          <br />
          <h4 className="eachuser-history-title">Log in history</h4>

          <div className="eachuser-history-list">
            {loggedin.length === 0 ? (
              <div>No login history found.</div>
            ) : (
              loggedin
                .sort(
                  (a, b) =>
                    new Date(b.loggedInAt).getTime() -
                    new Date(a.loggedInAt).getTime()
                )
                .map((log) => (
                  <div
                    key={log._id}
                    className="eachuser-history-item"
                    onClick={() => navigate(`/admin/usersloggedin/${log._id}`)}
                  >
                    Logged in at:{" "}
                    {log.loggedInAt
                      ? new Date(log.loggedInAt).toLocaleString()
                      : "-"}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eachuser;
