import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const submissionAPI = {
  // Get submissions for a specific assessment
  getSubmissionsByAssessment: async (assessmentId) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${apiUrl}/submission/assessment/${assessmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching submissions:", error);
      throw error;
    }
  },

  // Get PDF file URL for a specific submission
  getPdfFileUrl: async (filename) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        `${apiUrl}/submission/pdf/file`,
        { filename },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching PDF file URL:", error);
      throw error;
    }
  },

  // Additional submission-related API methods can be added here
};

export default submissionAPI;
