import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

/**
 * API service for course-related operations
 */
const assessmentAPI = {
  /**
   * Get assessments for a specific course section
   * @param {string} sectionId - Course section ID
   * @returns {Promise} - Promise with section assessments
   */
  getSectionAssessments: async (sectionId) => {
    const token = localStorage.getItem("authToken");
    return axios.get(`${apiUrl}/assessment/section/${sectionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Get assessment details by ID
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise} - Promise with assessment details
   */
  getAssessmentById: async (assessmentId) => {
    const token = localStorage.getItem("authToken");
    return axios.get(`${apiUrl}/assessment/${assessmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Create a new assessment
   * @param {Object} assessmentData - Assessment data
   * @returns {Promise} - Promise with created assessment
   */
  createAssessment: async (assessmentData) => {
    const token = localStorage.getItem("authToken");
    return axios.post(`${apiUrl}/assessment/create`, assessmentData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Update an existing assessment
   * @param {string} assessmentId - Assessment ID
   * @param {Object} assessmentData - Updated assessment data
   * @returns {Promise} - Promise with updated assessment
   */
  updateAssessment: async (assessmentId, assessmentData) => {
    const token = localStorage.getItem("authToken");
    return axios.put(
      `${apiUrl}/assessment/update/${assessmentId}`,
      assessmentData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  /**
   * Delete an assessment
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise} - Promise with delete confirmation
   */
  deleteAssessment: async (assessmentId) => {
    const token = localStorage.getItem("authToken");
    return axios.delete(`${apiUrl}/assessment/delete/${assessmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default assessmentAPI;
