import React from "react";
import Navber from "../../components/Profressor/Dashboard/Navbar";
import Sidebar from "../../components/Profressor/Dashboard/Sidebar";
import { Container } from "react-bootstrap";
import Getteam from "../../components/Profressor/Team/Getteam";

export default function Teampage() {
  return (
    <div>
      <Navber />
      <Sidebar />
      <div className="main-content">
        <Container className="mt-2">
          <Getteam />
        </Container>
      </div>
    </div>
  );
}
