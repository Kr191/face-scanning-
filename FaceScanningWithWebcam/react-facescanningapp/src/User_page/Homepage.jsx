import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Homepage.css";

function Homepage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <div className="homepage-container">
      <title>Face Scanning System</title>
      <div className="w-100">
        <div className="text-center p-4 bg-white shadow rounded">
          <h1 className="mb-4 fs-4">Welcome to Face Scanning System</h1>
          <div className="d-grid gap-3">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
            <button
              className="btn btn-success btn-lg"
              onClick={() => navigate("/webcam")}
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Webcam"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
