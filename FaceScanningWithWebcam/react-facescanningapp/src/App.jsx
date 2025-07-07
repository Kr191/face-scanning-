import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./User_page/Homepage";
import Register from "./User_page/Register"; // อย่าลืมสร้างหรือ import ให้ถูก path
import Webcamstream from "./User_page/webcam";
import AdminHomepage from "./Admin_page/AdminHomepage";
import Alluser from "./Admin_page/Alluser";
import Alluserloggedin from "./Admin_page/Alluserloggedin";
import Eachuser from "./Admin_page/Eachuser";
import Updateuser from "./Admin_page/Updateuser";
import Forbidden from "./Admin_page/Forbidden";
import Eachuserloggedin from "./Admin_page/Eachuserloggedin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/webcam" element={<Webcamstream />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* <Route element={<AdminRoute />}> */}
        <Route path="/admin" element={<AdminHomepage />} />
        <Route path="/admin/users" element={<Alluser />} />
        <Route path="/admin/users/user/:user_id" element={<Eachuser />} />
        <Route path="/admin/usersloggedin" element={<Alluserloggedin />} />
        <Route
          path="/admin/usersloggedin/:loggedin_id"
          element={<Eachuserloggedin />}
        />
        <Route
          path="/admin/users/user/updateuser/:user_id"
          element={<Updateuser />}
        />
        {/* </Route> */}
      </Routes>
    </Router>
  );
}

export default App;
