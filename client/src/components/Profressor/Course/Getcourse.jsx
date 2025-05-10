import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import "../../../assets/Styles/Course/Getcourse.css";
import Ant from "../../../assets/Picture/Ant.png";
import { useNavigate } from "react-router-dom";
import courseAPI from "../../../services/courseAPI"; // Import courseAPI

const Getcourse = forwardRef((props, ref) => {
  const [courses, setCourses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      // Use courseAPI instead of direct axios call
      const response = await courseAPI.getMyCourses();
      setCourses(response.data.courses || []);
      console.log(response.data.courses);
      setError(null);
    } catch (err) {
      setError("Failed to fetch courses");
      console.error("Error fetching courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchCourses,
  }));

  useEffect(() => {
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
                Section: {course.section_number}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default Getcourse;
