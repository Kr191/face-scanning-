import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Homepage.css";
import AdminNavbar from "./AdminNavbar";

function AdminHomepage() {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <div className="w-100">
        <div className="text-center p-4 bg-white shadow rounded">
          <h1 className="mb-4 fs-4">Welcome to Admin Homepage</h1>
          <div className="d-grid gap-3">
            <button
              className="btn btn-info btn-lg"
              onClick={() => navigate("/admin/users")}
            >
              See all user account
            </button>
            <button
              className="btn btn-info btn-lg"
              onClick={() => navigate("/admin/usersloggedin")}
            >
              See all user logged in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHomepage;
