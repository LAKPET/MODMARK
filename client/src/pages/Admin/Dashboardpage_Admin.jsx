import React from "react";
import { Route, Routes } from "react-router-dom";
import Navber from "../../components/Admin/Navbar";
import Sidebar from "../../components/Admin/Sidebar";
import Getuser from "../../components/Admin/user/Getuser";
import Getcourse from "../../components/Admin/course/Getcourse";
import { Container, Row, Col } from "react-bootstrap";
import "../../styles/Main.css";
export default function Dashboardpage_Admin() {
  return (
    <div>
      <Navber />
      <Sidebar />

      {/* Main Content */}
      <div className="main-content">
        <Container className="mt-2">
          <Row>
            <Col>
              <Routes>
                <Route path="users" element={<Getuser />} />
                <Route path="course" element={<Getcourse />} />
              </Routes>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
