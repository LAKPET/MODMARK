import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/Styles/Coursepage.css";
import Ant from "../../assets/Picture/Ant.png";
import { useNavigate } from "react-router-dom";

export default function Getcourse() {
  const [courses, setCourses] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${apiUrl}/course/my-courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCourses(response.data.courses || []);
      } catch (error) {
        console.error(
          "Error fetching courses:",
          error.response?.data || error.message
        );
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (sectionId) => {
    navigate(`/dashboard/${sectionId}`);
  };

  if (loading) {
    return <div className="content-box">Loading...</div>;
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="content-box">
        <p>Welcome to System</p>
        <p>for collaborative grading and delivery feedback</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row g-3">
        {courses.map((course, index) => (
          <div className="col-md-4" key={index}>
            <div
              className="card border-secondary mb-3 h-90 background-card"
              onClick={() => handleCourseClick(course.section_id)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-header bg-transparent border-secondary">
                Semester: {course.section_term}/{course.section_year}
              </div>
              <div>
                <div className="d-flex flex-row align-items-start">
                  <div className="card-body text-black">
                    <h5 className="card-title fw-bold">
                      {course.course_number}
                    </h5>
                    <p className="card-text">{course.course_name}</p>
                    <p className="card-description">
                      {course.course_description}
                    </p>
                  </div>
                  <div className="me-3">
                    <img src={Ant} alt="Ant" className="img-fluid" />
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent border-secondary">
                Section: {course.section_name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
