import React from "react";
import Sidebar from "../components/Dashboard/Sidebar";
import Navber from "../components/Dashboard/Navbar";
import Getdetailcourse from "../components/Dashboard/Getdetailcourse";
import { Container, Row, Col, Button } from "react-bootstrap";
export default function Dashboardpage() {
  return (
    <div>
      <Sidebar />
      <Navber />
      <div className="main-content">
        <Container className="mt-2">
          <Getdetailcourse />
        </Container>
      </div>
    </div>
  );
}
