import React from "react";
import Navber from "../../components/Admin/Navbar";
import Sidebar from "../../components/Admin/Sidebar";
import Getuser from "../../components/Admin/Getuser";
import { Container, Row, Col } from "react-bootstrap";
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
              <Getuser />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
