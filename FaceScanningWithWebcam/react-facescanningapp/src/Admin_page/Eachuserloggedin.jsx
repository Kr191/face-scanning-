import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";
import { useParams, useNavigate } from "react-router-dom";
import "./Eachuserloggedin.css";

const Eachuserloggedin = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { loggedin_id } = useParams();
  const [loggedin, setLoggedin] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/eachuser/loggedin/${loggedin_id}`)
      .then((res) => {
        setLoggedin(res.data);
      })
      .catch((err) => {
        console.error("Error fetching login history:", err);
      });
  }, [API_URL, loggedin_id]);
  return (
    <div>
      <title>Each User Logged In</title>
      <AdminNavbar />
      <div className="eachuserloggedin-img-container">
        {!loggedin ? (
          <div>Loading...</div>
        ) : (
          <img
            src={loggedin.image_name}
            alt="user"
            className="eachuserloggedin-img"
          />
        )}
      </div>
    </div>
  );
};

export default Eachuserloggedin;
