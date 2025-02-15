import React, { useState } from "react";
import { Container } from "react-bootstrap";
import RubricMain from "./Rubriccourse";
import picturetab1 from "../../../assets/Picture/mdi_number-1-box.png";
import picturetab2 from "../../../assets/Picture/mdi_number-2-box.png";
import "../../../assets/Styles/Settingcourse/Settingcourse.css";
import { useParams } from "react-router-dom";
import DetailCourse from "./Detailcourse";

export default function SettingCourse() {
  const id = useParams();
  const [activeTab, setActiveTab] = useState("assessmentDetail");

  return (
    <Container className="mt-1">
      {/* Tab Navigation */}
      <div className="custom-tab-container">
        <button
          className={`custom-tab ${activeTab === "assessmentDetail" ? "active" : ""}`}
          onClick={() => setActiveTab("assessmentDetail")}
        >
          <img src={picturetab1} alt="Assessment Detail" className="tab-icon" />
          Course Details
        </button>

        <button
          className={`custom-tab ${activeTab === "createRubric" ? "active" : ""}`}
          onClick={() => setActiveTab("createRubric")}
        >
          <img src={picturetab2} alt="Create Rubric" className="tab-icon" />
          Rubric Details
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "assessmentDetail" && <DetailCourse id={id} />}
        {activeTab === "createRubric" && <RubricMain id={id} />}
      </div>
    </Container>
  );
}
