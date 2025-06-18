import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import Register from "./Register"; // อย่าลืมสร้างหรือ import ให้ถูก path

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;