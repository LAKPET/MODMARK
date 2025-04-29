/**
 * Utility function to sort submissions based on specified column and order
 * @param {Array} submissions - Array of submission objects
 * @param {string} column - Column to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @param {Object} submittedAssessments - Object mapping assessment IDs to submission status
 * @returns {Array} - Sorted array of submissions
 */
export const sortSubmissions = (
  submissions,
  column,
  order,
  submittedAssessments = {}
) => {
  if (!column) return submissions;

  return [...submissions].sort((a, b) => {
    let valueA, valueB;

    switch (column) {
      case "personal_num":
        valueA = a.student_id?.personal_num || "";
        valueB = b.student_id?.personal_num || "";
        break;
      case "first_name":
        valueA = a.student_id?.first_name || "";
        valueB = b.student_id?.first_name || "";
        break;
      case "last_name":
        valueA = a.student_id?.last_name || "";
        valueB = b.student_id?.last_name || "";
        break;
      case "email":
        valueA = a.student_id?.email || "";
        valueB = b.student_id?.email || "";
        break;
      case "submitted_at":
        valueA = new Date(a.submitted_at);
        valueB = new Date(b.submitted_at);
        break;
      case "grading_status":
        valueA = a.grading_status || "pending";
        valueB = b.grading_status || "pending";
        break;
      case "group_name":
        valueA = a.group_id?.group_name || "";
        valueB = b.group_id?.group_name || "";
        break;
      case "status":
        valueA = submittedAssessments[a.assessment_id]
          ? "Submitted"
          : "Not Submitted";
        valueB = submittedAssessments[b.assessment_id]
          ? "Submitted"
          : "Not Submitted";
        break;
      default:
        return 0;
    }

    if (valueA < valueB) return order === "asc" ? -1 : 1;
    if (valueA > valueB) return order === "asc" ? 1 : -1;
    return 0;
  });
};
