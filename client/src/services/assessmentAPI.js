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
};

export default assessmentAPI;
