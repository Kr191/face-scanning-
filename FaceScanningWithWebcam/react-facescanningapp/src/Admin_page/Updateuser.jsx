import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";
import { useParams, useNavigate } from "react-router-dom";
import "./Updateuser.css";

function UpdateForm() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();
  const { user_id } = useParams();

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/updateuser/${user_id}`, {
        first_name: firstName,
        last_name: lastName,
      });
      alert("User updated successfully!");
      navigate(`/admin/users/user/${user_id}`);
    } catch (err) {
      alert("Failed to update user.");
      console.error(err);
    }
  };

  return (
    <div>
      <title>Update User</title>
      <AdminNavbar />
      <div className="updateuser-container">
        <form className="updateuser-form" onSubmit={handleUpdate}>
          <h2>Update User</h2>
          <label htmlFor="firstName">First name:</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <label htmlFor="lastName">Last name:</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <button type="submit" className="updateuser-submit-btn">
            SUBMIT
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateForm;
