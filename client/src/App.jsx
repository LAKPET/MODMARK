import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Loginpage";
import Register from "./pages/Registerpage";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Coursepage from "./pages/Coursepage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/course" element={<Coursepage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
