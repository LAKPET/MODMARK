import React from "react";
import Navber from "../../components/Profressor/Dashboard/Navbar";
import Sidebar from "../../components/Profressor/Dashboard/Sidebar";
import { Container } from "react-bootstrap";
import Getoverviewscore from "../../components/Profressor/Score/Getoverviewscore";
import "../../styles/Main.css";
export default function Scorepage() {
  return (
    <div>
      <Navber />
      <Sidebar />
      <div className="main-content">
        <Container className="mt-2">
          <Getoverviewscore />
        </Container>
      </div>
    </div>
  );
}
