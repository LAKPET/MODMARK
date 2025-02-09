import React from "react";
import Sidebar from "../../components/Profressor/Dashboard/Sidebar";
import Navber from "../../components/Profressor/Dashboard/Navbar";
import Settingcourse from "../../components/Profressor/Settingcourse/Settingcourse";
import { Container } from "react-bootstrap";
export default function Settingcoursepage() {
  return (
    <div>
      <Sidebar />
      <Navber />

      <div className="main-content">
        <Container className="mt-2">
          <Settingcourse />
        </Container>
      </div>
    </div>
  );
}
