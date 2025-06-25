import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import Register from "./Register"; // อย่าลืมสร้างหรือ import ให้ถูก path
import Webcamstream from "./webcam";
import AdminHomepage from "./AdminHomepage";
import Alluser from "./Alluser";
import Alluserloggedin from "./Alluserloggedin";
import Eachuser from "./Eachuser";
import Updateuser from "./Updateuser";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/webcam" element={<Webcamstream />} />
        <Route path="/admin" element={<AdminHomepage />} />
        <Route path="/admin/users" element={<Alluser />} />
        <Route path="/admin/users/user/:user_id" element={<Eachuser />} />
        <Route path="/admin/usersloggedin" element={<Alluserloggedin />} />
        <Route
          path="/admin/users/user/updateuser/:user_id"
          element={<Updateuser />}
        />
      </Routes>
    </Router>
  );
}

export default App;
