import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/Styles/Coursepage.css";
import Ant from "../../assets/Picture/Ant.png";

export default function Getcourse() {
  const [courses, setCourses] = useState(null); // Initialize as null to differentiate between loading and empty
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Get token from localStorage
        const response = await axios.get(
          "http://localhost:5001/course/my-courses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCourses(response.data.courses || []); // Set the fetched courses or an empty array if undefined
      } catch (error) {
        console.error(
          "Error fetching courses:",
          error.response?.data || error.message
        );
        setCourses([]); // Set to an empty array if the fetch fails
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="content-box">Loading...</div>; // Display a loading state
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
      <div className="row g-4">
        {courses.map((course, index) => (
          <div className="col-md-4" key={index}>
            <div className="card border-secondary mb-3 h-90 background-card">
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
