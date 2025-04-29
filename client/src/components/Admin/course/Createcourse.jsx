import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const Createcourse = ({ show, handleClose, role, onCourseCreated }) => {
  const [courseName, setCourseName] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [semesterTerm, setSemesterTerm] = useState("");
  const [semesterYear, setSemesterYear] = useState("");
  const [token] = useState(localStorage.getItem("token"));
  const [apiUrl] = useState(process.env.REACT_APP_API_URL);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${apiUrl}/section`,
        {
          course_name: courseName,
          course_number: courseNumber,
          section_name: sectionName,
          semester_term: semesterTerm,
          semester_year: semesterYear,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 201) {
        toast.success("Course created successfully!");
        handleClose();
        if (onCourseCreated) {
          onCourseCreated();
        }
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(error.response?.data?.message || "Error creating course");
    }
  };

  return <div>{/* Render your form here */}</div>;
};

export default Createcourse;
