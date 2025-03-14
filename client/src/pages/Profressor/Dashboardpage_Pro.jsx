import React from "react";
import Sidebar from "../../components/Profressor/Dashboard/Sidebar";
import Navber from "../../components/Profressor/Dashboard/Navbar";
import Getdetailcourse from "../../components/Profressor/Dashboard/Getdetailcourse";
import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";

import "../../styles/Main.css";

export default function Dashboardpage() {
  // Access the section_id from the route parameter
  const { id } = useParams(); // This gets the :id from the route

  return (
    <div>
      <Sidebar />
      <Navber />
      <div className="main-content">
        <Container className="mt-2">
          {/* Pass the section_id to Getdetailcourse */}
          <Getdetailcourse id={id} />
        </Container>
      </div>
    </div>
  );
}
