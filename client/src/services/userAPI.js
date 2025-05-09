import axios from "axios";

// Get API URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL;

// Helper function to get authentication token
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Helper function to create authorized request headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    Authorization: `Bearer ${token}`,
  };
};

// User Management API Functions
export const userApi = {
  // Get all users with optional filtering parameters
  getAllUsers: async (params = {}) => {
    try {
      const response = await axios.post(`${apiUrl}/users/all`, params, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific user's profile
  getUserProfile: async (userId) => {
    try {
      const response = await axios.get(`${apiUrl}/users/profile/${userId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData) => {
    try {
      const response = await axios.post(
        `${apiUrl}/users/create`,
        {
          personal_num: parseInt(userData.personalNum, 10),
          first_name: userData.firstname,
          last_name: userData.lastname,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role,
        },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update an existing user
  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(
        `${apiUrl}/users/update/${userId}`,
        {
          first_name: userData.firstname,
          last_name: userData.lastname,
          email: userData.email,
          username: userData.username,
          role: userData.role,
        },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${apiUrl}/users/delete/${userId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Course Enrollment API Functions
export const enrollmentApi = {
  // Enroll students in a course section
  enrollStudents: async (sectionId, students) => {
    try {
      const response = await axios.post(
        `${apiUrl}/enrollment/enroll`,
        {
          section_id: sectionId,
          students: students,
        },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Course Instructor API Functions
export const instructorApi = {
  // Register professors/TAs to a course section
  registerInstructors: async (sectionId, professors) => {
    try {
      const response = await axios.post(
        `${apiUrl}/course-instructor/register-instructor`,
        {
          section_id: sectionId,
          professors: professors,
        },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
