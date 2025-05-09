import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

/**
 * API service for course-related operations
 */
const courseAPI = {
  /**
   * Get all courses with optional filters
   * @param {Object} filters - Filters to apply (course_number, section_number, semester_term, semester_year)
   * @returns {Promise} - Promise with courses data
   */
  getAllCourses: async (filters = {}) => {
    const token = localStorage.getItem("authToken");
    return axios.post(`${apiUrl}/section/all`, filters, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Get course details by ID
   * @param {string} courseId - Course ID
   * @returns {Promise} - Promise with course details
   */
  getCourseById: async (courseId) => {
    const token = localStorage.getItem("authToken");
    return axios.get(`${apiUrl}/section/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Create a new course
   * @param {Object} courseData - Course data
   * @returns {Promise} - Promise with created course
   */
  createCourse: async (courseData) => {
    const token = localStorage.getItem("authToken");
    return axios.post(`${apiUrl}/section`, courseData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Update an existing course
   * @param {string} courseId - Course ID
   * @param {Object} courseData - Updated course data
   * @returns {Promise} - Promise with updated course
   */
  updateCourse: async (courseId, courseData) => {
    const token = localStorage.getItem("authToken");
    return axios.put(`${apiUrl}/section/update/${courseId}`, courseData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Delete a course
   * @param {string} courseId - Course ID
   * @returns {Promise} - Promise with delete result
   */
  deleteCourse: async (courseId) => {
    const token = localStorage.getItem("authToken");
    return axios.delete(`${apiUrl}/section/delete/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Enroll students in a course section
   * @param {string} sectionId - Section ID
   * @param {Array} students - Array of student objects with personal_num, first_name, last_name, email
   * @returns {Promise} - Promise with enrollment result
   */
  enrollStudents: async (sectionId, students) => {
    const token = localStorage.getItem("authToken");
    return axios.post(
      `${apiUrl}/enrollment/enroll`,
      {
        section_id: sectionId,
        students: students,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  /**
   * Register instructors (professors/TAs) for a course section
   * @param {string} sectionId - Section ID
   * @param {Array} instructors - Array of instructor objects with personal_num, first_name, last_name, email
   * @returns {Promise} - Promise with registration result
   */
  registerInstructors: async (sectionId, instructors) => {
    const token = localStorage.getItem("authToken");
    return axios.post(
      `${apiUrl}/course-instructor/register-instructor`,
      {
        section_id: sectionId,
        professors: instructors,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  /**
   * Get user details by ID
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with user details
   */
  getUserById: async (userId) => {
    const token = localStorage.getItem("authToken");
    return axios.get(`${apiUrl}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default courseAPI;
