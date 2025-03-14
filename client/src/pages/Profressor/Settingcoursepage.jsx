import React from "react";
import Sidebar from "../../components/Profressor/Dashboard/Sidebar";
import Navber from "../../components/Profressor/Dashboard/Navbar";
import Settingcourse from "../../components/Profressor/Settingcourse/Settingcourse";

import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import "../../styles/Main.css";
export default function Settingcoursepage() {
  const { id } = useParams(); // This gets the :id from the route
  return (
    <div>
      <Sidebar />
      <Navber />

      <div className="main-content">
        <Container className="mt-2">
          <Settingcourse id={id} />
        </Container>
      </div>
    </div>
  );
}
