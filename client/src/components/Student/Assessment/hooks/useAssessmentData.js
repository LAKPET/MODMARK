import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function useAssessmentData(sectionId) {
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submittedAssessments, setSubmittedAssessments] = useState({});
  const [uploadingAssessmentId, setUploadingAssessmentId] = useState(null);
  const [submissionPreviews, setSubmissionPreviews] = useState({});
  const [loadingPreview, setLoadingPreview] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const apiUrl = import.meta.env.VITE_API_URL;

  // Sort function
  const handleSort = (column) => {
    const newOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newOrder);
  };

  // Fetch submitted assessments
  const fetchSubmittedAssessments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("UserId");
      if (!token || !userId) {
        console.error("No auth token or user ID found");
        return;
      }

      const response = await axios.get(
        `${apiUrl}/submission/student/with-groups/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Process submissions and create an object with assessment_id as keys
      const submitted = {};
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((submission) => {
          if (submission && submission.assessment_id) {
            // Store submission with assessment ID as key
            const assessmentId =
              submission.assessment_id._id || submission.assessment_id;
            submitted[assessmentId] = submission;
          }
        });
      }

      setSubmittedAssessments(submitted);
    } catch (error) {
      console.error("Error fetching submitted assessments:", error);
    }
  };

  // Get preview URL on demand
  const fetchPreviewUrl = async (assessmentId) => {
    try {
      setLoadingPreview(assessmentId);
      const token = localStorage.getItem("authToken");
      const submission = submittedAssessments[assessmentId];

      if (!submission || !submission.file_url) {
        alert("No file available for preview");
        return null;
      }

      const fileResponse = await axios.post(
        `${apiUrl}/submission/pdf/file`,
        { filename: submission.file_url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (fileResponse.data && fileResponse.data.fileUrl) {
        // Store the URL in state
        setSubmissionPreviews((prev) => ({
          ...prev,
          [assessmentId]: fileResponse.data.fileUrl,
        }));
        return fileResponse.data.fileUrl;
      }
      return null;
    } catch (err) {
      console.error("Error getting preview URL:", err);
      alert("Could not load file preview");
      return null;
    } finally {
      setLoadingPreview(null);
    }
  };

  // File upload handler
  const handleFileChange = async (event, assessmentId) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      return;
    }
    setUploading(true);
    setUploadingAssessmentId(assessmentId);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token not found. Please log in again.");
        return;
      }

      const userId = localStorage.getItem("UserId");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assessment_id", assessmentId);
      formData.append("group_name", "individual");
      formData.append("members", JSON.stringify([{ user_id: userId }]));
      formData.append("file_type", "pdf");
      formData.append("section_id", sectionId);

      const uploadRes = await fetch(`${apiUrl}/submission/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await uploadRes.json();

      if (uploadRes.ok) {
        // Update local state with the new submission
        const newSubmission = {
          ...result.submission,
          assessment_id: assessmentId,
        };

        setSubmittedAssessments((prev) => ({
          ...prev,
          [assessmentId]: newSubmission,
        }));

        alert("File uploaded successfully!");
      } else {
        alert(result.message || "File upload failed.");
      }
    } catch (error) {
      console.error("File upload error:", error);
      alert("An error occurred during file upload.");
    } finally {
      setUploading(false);
      setUploadingAssessmentId(null);
    }
  };

  // Group submission handler
  const handleGroupSubmit = async (
    groupFile,
    groupName,
    selectedMembers,
    groupModalAssessment
  ) => {
    if (!groupFile || !groupModalAssessment) return;

    try {
      setUploading(true);
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("file", groupFile);
      formData.append("assessment_id", groupModalAssessment._id);
      formData.append("group_name", groupName);
      formData.append(
        "members",
        JSON.stringify(selectedMembers.map((id) => ({ user_id: id })))
      );
      formData.append("file_type", "pdf");
      formData.append("section_id", sectionId);

      const uploadRes = await fetch(`${apiUrl}/submission/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await uploadRes.json();

      if (uploadRes.ok) {
        // Update local state with the new submission
        const newSubmission = {
          ...result.submission,
          assessment_id: groupModalAssessment._id,
        };

        setSubmittedAssessments((prev) => ({
          ...prev,
          [groupModalAssessment._id]: newSubmission,
        }));

        alert("Group submission successful!");
        return true;
      } else {
        alert(result.message || "File upload failed.");
        return false;
      }
    } catch (error) {
      console.error("Group submission error:", error);
      alert("An error occurred during group submission.");
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Edit submission handler
  const handleEditSubmission = async (assessmentId) => {
    try {
      const submission = submittedAssessments[assessmentId];
      const assessment = assessments.find((a) => a._id === assessmentId);

      if (submission && assessment) {
        // Fetch the preview URL if needed for the edit modal
        let previewUrl = submissionPreviews[assessmentId];
        if (!previewUrl && submission.file_url) {
          previewUrl = await fetchPreviewUrl(assessmentId);
        }

        if (previewUrl) {
          submission.previewUrl = previewUrl;
        }

        return { submission, assessment };
      }
    } catch (err) {
      alert("ไม่สามารถโหลดข้อมูล submission ได้");
    }
    return null;
  };

  // Update submission handler
  const handleUpdateSubmission = async (submissionId, file, groupName = "") => {
    try {
      setUploading(true);
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      if (file) formData.append("file", file);
      formData.append("file_type", "pdf");
      if (groupName) formData.append("group_name", groupName);

      const res = await fetch(`${apiUrl}/submission/update/${submissionId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        // Update local state with the updated submission
        const updatedSubmission = result.submission;

        if (updatedSubmission) {
          setSubmittedAssessments((prev) => ({
            ...prev,
            [updatedSubmission.assessment_id]: updatedSubmission,
          }));

          // Clear any existing preview URL since the file has changed
          if (file) {
            setSubmissionPreviews((prev) => {
              const newPreviews = { ...prev };
              delete newPreviews[updatedSubmission.assessment_id];
              return newPreviews;
            });
          }
        }

        alert("แก้ไขงานสำเร็จ");
        return true;
      } else {
        alert(result.message || "เกิดข้อผิดพลาดขณะอัปเดตงาน");
        return false;
      }
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถอัปเดต submission ได้");
      return false;
    } finally {
      setUploading(false);
    }
  };

  // View submission handler
  const handleViewSubmission = async (assessmentId) => {
    // Check if we already have the preview URL
    let previewUrl = submissionPreviews[assessmentId];

    // If not, fetch it
    if (!previewUrl) {
      previewUrl = await fetchPreviewUrl(assessmentId);
    }

    if (previewUrl) {
      window.open(previewUrl, "_blank");
    } else {
      alert("ไม่พบไฟล์ PDF สำหรับงานนี้");
    }
  };

  // Refresh assessments data
  const refreshAssessments = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem("authToken");
      const assessmentResponse = await axios.get(
        `${apiUrl}/assessment/section/${sectionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssessments(assessmentResponse.data);

      // Also refresh submission data
      await fetchSubmittedAssessments();
    } catch (err) {
      setError("Error loading data.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (!sectionId) {
      setError("No section ID found in the URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        // Get course details and assessments
        const [courseResponse, assessmentResponse] = await Promise.all([
          axios.get(`${apiUrl}/course/details/${sectionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/assessment/section/${sectionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourseDetails(courseResponse.data);
        setAssessments(assessmentResponse.data);

        // Fetch submissions after getting assessments
        await fetchSubmittedAssessments();
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sectionId, navigate]);

  return {
    courseDetails,
    assessments,
    loading,
    error,
    uploading,
    submittedAssessments,
    uploadingAssessmentId,
    submissionPreviews,
    loadingPreview,
    sortColumn,
    sortOrder,
    handleSort,
    handleFileChange,
    handleGroupSubmit,
    handleEditSubmission,
    handleUpdateSubmission,
    handleViewSubmission,
    refreshAssessments,
    fetchPreviewUrl,
  };
}
