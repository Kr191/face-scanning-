import React, { useState } from "react";
import axios from "axios";

function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const userData = {
      first_name: firstName,
      last_name: lastName,
      image_name: "",
      created_at: "",
      updated_at: "",
    };

    formData.append("user_json", JSON.stringify(userData));
    formData.append("file", image);

    try {
      const res = await axios.post(
        "http://localhost:3001/api/adduser",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Register success!");
      console.log(res.data);
    } catch (error) {
      alert("Register failed.");
      console.error(error);
    }
  };

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow"
        encType="multipart/form-data"
        style={{ width: "400px" }}
      >
        <h2 className="text-center mb-4">Register</h2>

        <div className="mb-3">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Profile Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>

        {preview && (
          <div className="text-center mb-3">
            <img
              src={preview}
              alt="Preview"
              className="rounded-circle"
              width={100}
              height={100}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100">
          Register
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;
