import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

/**
 * Get authentication token from localStorage
 * @returns {string} The authentication token
 */
const getToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * Get all rubrics for a section
 * @param {string} sectionId - ID of the section
 * @returns {Promise<Array>} Promise resolving to array of rubrics
 */
export const fetchRubricsBySection = async (sectionId) => {
  const token = getToken();
  try {
    const response = await axios.get(`${apiUrl}/rubric/section/${sectionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching rubrics:", error);
    throw error;
  }
};

/**
 * Get a specific rubric by ID
 * @param {string} rubricId - ID of the rubric
 * @returns {Promise<Object>} Promise resolving to rubric data
 */
export const fetchRubricById = async (rubricId) => {
  const token = getToken();
  try {
    const response = await axios.get(`${apiUrl}/rubric/${rubricId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching rubric:", error);
    throw error;
  }
};

/**
 * Create a new rubric
 * @param {Object} rubricData - The rubric data to create
 * @returns {Promise<Object>} Promise resolving to created rubric
 */
export const createRubric = async (rubricData) => {
  const token = localStorage.getItem("authToken");
  const apiUrl = import.meta.env.VITE_API_URL;

  const response = await fetch(`${apiUrl}/rubric/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(rubricData),
  });

  // Return the response object directly instead of checking ok status here
  // This allows the calling function to handle the response appropriately
  return response;
};

/**
 * Update an existing rubric
 * @param {string} rubricId - ID of the rubric to update
 * @param {Object} rubricData - The updated rubric data
 * @returns {Promise<Object>} Promise resolving to updated rubric
 */
export const updateRubric = async (rubricId, rubricData) => {
  const token = getToken();
  try {
    const response = await axios.put(
      `${apiUrl}/rubric/update/${rubricId}`,
      rubricData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating rubric:", error);
    throw error;
  }
};

/**
 * Delete a rubric
 * @param {string} rubricId - ID of the rubric to delete
 * @returns {Promise<Object>} Promise resolving to deletion result
 */
export const deleteRubric = async (rubricId) => {
  const token = getToken();
  try {
    const response = await axios.delete(`${apiUrl}/rubric/delete/${rubricId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting rubric:", error);
    throw error;
  }
};

/**
 * Get a specific rubric by ID
 * @param {string} rubricId - ID of the rubric
 * @returns {Promise<Object>} Promise resolving to rubric data
 */
export const fetchRubricBysectionId = async (sectionId) => {
  const token = getToken();
  try {
    const response = await axios.get(`${apiUrl}/rubric/section/${sectionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    console.error("Error fetching rubric:", error);
    throw error;
  }
};
