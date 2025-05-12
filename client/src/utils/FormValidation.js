export const validateRegistrationForm = (formData) => {
  const errors = {};

  // Personal Number validation
  if (!formData.personalNum) {
    errors.personalNum = "Personal Number is required";
  } else if (!/^\d+$/.test(formData.personalNum)) {
    errors.personalNum = "Personal Number must contain only digits";
  }

  // Firstname validation
  if (!formData.firstname) {
    errors.firstname = "Firstname is required";
  } else if (formData.firstname.length < 3) {
    errors.firstname = "Firstname must be at least 3 characters";
  }

  // Lastname validation
  if (!formData.lastname) {
    errors.lastname = "Lastname is required";
  } else if (formData.lastname.length < 3) {
    errors.lastname = "Lastname must be at least 3 characters";
  }

  // Email validation
  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Please enter a valid email address Example: a@a.com";
  }

  // Username validation
  if (!formData.username) {
    errors.username = "Username is required";
  } else if (formData.username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  }

  // Password validation
  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLoginForm = (formData) => {
  const errors = {};

  // Email validation
  if (!formData.email) {
    errors.email = "Email is required";
  }

  // Password validation
  if (!formData.password) {
    errors.password = "Password is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCreateCourseForm = (formData) => {
  const errors = {};

  // Course Number validation
  if (!formData.courseNumber) {
    errors.courseNumber = "Course Number is required";
  } else if (!/^[A-Za-z]{2,4}\s\d{3}$/.test(formData.courseNumber)) {
    errors.courseNumber = "Course Number must be in format: ABC 123";
  }

  // Course Name validation
  if (!formData.courseName) {
    errors.courseName = "Course Name is required";
  } else if (formData.courseName.length < 3) {
    errors.courseName = "Course Name must be at least 3 characters";
  }

  // Course Description validation
  if (!formData.courseDescription) {
    errors.courseDescription = "Course Description is required";
  } else if (formData.courseDescription.length < 10) {
    errors.courseDescription =
      "Course Description must be at least 10 characters";
  }

  // Section validation
  if (!formData.section) {
    errors.section = "Section is required";
  } else if (!/^\d+$/.test(formData.section)) {
    errors.section = "Section must be a number";
  }

  // Term validation
  if (!formData.term) {
    errors.term = "Term is required";
  } else if (![1, 2].includes(Number(formData.term))) {
    errors.term = "Term must be either 1 or 2";
  }

  // Year validation
  if (!formData.year) {
    errors.year = "Year is required";
  } else if (!/^\d{4}$/.test(formData.year)) {
    errors.year = "Year must be a valid 4-digit year";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCreateUserForm = (formData) => {
  const errors = {};

  // Personal Number validation
  if (!formData.personalNum) {
    errors.personalNum = "Personal Number is required";
  } else if (!/^\d+$/.test(formData.personalNum)) {
    errors.personalNum = "Personal Number must contain only digits";
  }

  // Firstname validation
  if (!formData.firstname) {
    errors.firstname = "Firstname is required";
  } else if (formData.firstname.length < 3) {
    errors.firstname = "Firstname must be at least 3 characters";
  }

  // Lastname validation
  if (!formData.lastname) {
    errors.lastname = "Lastname is required";
  } else if (formData.lastname.length < 3) {
    errors.lastname = "Lastname must be at least 3 characters";
  }

  // Email validation
  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Username validation
  if (!formData.username) {
    errors.username = "Username is required";
  } else if (formData.username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  }

  // Password validation
  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  // Role validation
  if (!formData.role) {
    errors.role = "Role is required";
  } else if (!["student", "professor", "admin"].includes(formData.role)) {
    errors.role = "Invalid role selected";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateAddUserCourseForm = (formData) => {
  const errors = {};

  // Role validation
  if (!formData.role) {
    errors.role = "Role is required";
  } else if (!["student", "professor", "ta", "admin"].includes(formData.role)) {
    errors.role = "Invalid role selected";
  }

  // If manual entry is used, validate the fields
  if (
    formData.personalNum ||
    formData.firstname ||
    formData.lastname ||
    formData.email
  ) {
    // Personal Number validation
    if (!formData.personalNum) {
      errors.personalNum = "Personal Number is required";
    } else if (!/^\d+$/.test(formData.personalNum)) {
      errors.personalNum = "Personal Number must contain only digits";
    }

    // Firstname validation
    if (!formData.firstname) {
      errors.firstname = "Firstname is required";
    } else if (formData.firstname.length < 3) {
      errors.firstname = "Firstname must be at least 3 characters";
    }

    // Lastname validation
    if (!formData.lastname) {
      errors.lastname = "Lastname is required";
    } else if (formData.lastname.length < 3) {
      errors.lastname = "Lastname must be at least 3 characters";
    }

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateEditCourseForm = (formData) => {
  const errors = {};

  // Course Number validation
  if (!formData.courseNumber) {
    errors.courseNumber = "Course Number is required";
  } else if (!/^[A-Za-z]{2,4}\s\d{3}$/.test(formData.courseNumber)) {
    errors.courseNumber = "Course Number must be in format: ABC 123";
  }

  // Section Name validation
  if (!formData.sectionName) {
    errors.sectionName = "Section Name is required";
  } else if (!/^\d+$/.test(formData.sectionName)) {
    errors.sectionName = "Section Name must be a number";
  }

  // Semester Term validation
  if (!formData.semesterTerm) {
    errors.semesterTerm = "Semester Term is required";
  } else if (![1, 2].includes(Number(formData.semesterTerm))) {
    errors.semesterTerm = "Semester Term must be either 1 or 2";
  }

  // Semester Year validation
  if (!formData.semesterYear) {
    errors.semesterYear = "Semester Year is required";
  } else if (!/^\d{4}$/.test(formData.semesterYear)) {
    errors.semesterYear = "Semester Year must be a valid 4-digit year";
  }

  // Course Name validation
  if (!formData.courseName) {
    errors.courseName = "Course Name is required";
  } else if (formData.courseName.length < 3) {
    errors.courseName = "Course Name must be at least 3 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCreateAssessmentForm = (formData) => {
  const errors = {};

  // Assessment Name validation
  if (!formData.assessmentName) {
    errors.assessmentName = "Assessment Name is required";
  } else if (formData.assessmentName.length < 3) {
    errors.assessmentName = "Assessment Name must be at least 3 characters";
  }

  // Assessment Description validation
  if (!formData.assessmentDescription) {
    errors.assessmentDescription = "Assessment Description is required";
  } else if (formData.assessmentDescription.length < 10) {
    errors.assessmentDescription =
      "Assessment Description must be at least 10 characters";
  }

  // Assessment Type validation
  if (!formData.assessmentType) {
    errors.assessmentType = "Assessment Type is required";
  } else if (!["individual", "group"].includes(formData.assessmentType)) {
    errors.assessmentType = "Invalid assessment type selected";
  }

  // Grading Type validation
  if (formData.gradingType === undefined || formData.gradingType === null) {
    errors.gradingType = "Grading Type is required";
  }

  // Publish Date validation
  if (!formData.publishDate) {
    errors.publishDate = "Publish Date is required";
  } else {
    const publishDate = new Date(formData.publishDate);
    const now = new Date();
    now.setSeconds(now.getSeconds() - 30); // เพิ่ม delay 30 วินาที
    if (publishDate < now) {
      errors.publishDate = "Publish Date cannot be in the past";
    }
  }

  // Due Date validation
  if (!formData.dueDate) {
    errors.dueDate = "Due Date is required";
  } else {
    const dueDate = new Date(formData.dueDate);
    const publishDate = new Date(formData.publishDate);
    if (dueDate <= publishDate) {
      errors.dueDate = "Due Date must be after Publish Date";
    }
  }

  // Rubric validation
  if (!formData.rubric) {
    errors.rubric = "Rubric is required";
  }

  // Weight validation for team grading
  if (formData.gradingType && formData.weights) {
    const totalWeight = Object.values(formData.weights).reduce(
      (sum, weight) => sum + (Number(weight) || 0),
      0
    );
    if (totalWeight !== 100) {
      errors.weights = "Total weight must equal 100%";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRubricForm = (formData) => {
  const errors = {};

  // Rubric Name validation
  if (!formData.name) {
    errors.name = "Rubric Name is required";
  } else if (formData.name.length < 3) {
    errors.name = "Rubric Name must be at least 3 characters";
  }

  // Rubric Description validation
  if (!formData.description) {
    errors.description = "Rubric Description is required";
  } else if (formData.description.length < 10) {
    errors.description = "Rubric Description must be at least 10 characters";
  }

  // Score validation
  if (!formData.score) {
    errors.score = "Score is required";
  } else if (isNaN(formData.score) || Number(formData.score) <= 0) {
    errors.score = "Score must be a positive number";
  }

  // Criteria validation
  if (!formData.rows || formData.rows.length === 0) {
    errors.rows = "At least one criterion is required";
  } else {
    formData.rows.forEach((row, index) => {
      // Criteria name validation
      if (!row.criteria) {
        errors[`criteria_${index}`] = "Criterion name is required";
      } else if (row.criteria.length < 3) {
        errors[`criteria_${index}`] =
          "Criterion name must be at least 3 characters";
      }

      // Criteria weight validation
      if (!row.criteria_weight) {
        errors[`weight_${index}`] = "Criterion weight is required";
      } else if (
        isNaN(row.criteria_weight) ||
        Number(row.criteria_weight) <= 0
      ) {
        errors[`weight_${index}`] =
          "Criterion weight must be a positive number";
      }

      // Validate each level in the criterion
      row.details.forEach((detail, detailIndex) => {
        // Description validation
        if (!detail.description) {
          errors[`detail_${index}_${detailIndex}`] = "Description is required";
        } else if (detail.description.length < 3) {
          errors[`detail_${index}_${detailIndex}`] =
            "Description must be at least 3 characters";
        }

        // Score validation
        if (!detail.score) {
          errors[`score_${index}_${detailIndex}`] = "Score is required";
        } else if (isNaN(detail.score) || Number(detail.score) < 0) {
          errors[`score_${index}_${detailIndex}`] =
            "Score must be a non-negative number";
        }
      });

      // Validate score consistency
      const scores = row.details.map((detail) => Number(detail.score));
      if (scores.length > 1) {
        // Check if scores are in descending order
        for (let i = 0; i < scores.length - 1; i++) {
          if (scores[i] <= scores[i + 1]) {
            errors[`score_order_${index}`] =
              "Scores must be in descending order";
            break;
          }
        }
      }
    });

    // Validate total weight equals 100% of max score
    const maxScore = Number(formData.score) || 0;
    if (maxScore > 0) {
      const totalWeight = formData.rows.reduce(
        (sum, row) => sum + (Number(row.criteria_weight) || 0),
        0
      );

      // Check if total weight equals max score
      if (totalWeight !== maxScore) {
        errors.total_weight = `Total weight of all criteria must equal max score (${maxScore})`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateDetailCourseForm = (formData) => {
  const errors = {};

  // Course Number validation
  if (!formData.course_number) {
    errors.course_number = "Course Number is required";
  } else if (!/^[A-Za-z]{2,4}\s\d{3}$/.test(formData.course_number)) {
    errors.course_number = "Course Number must be in format: ABC 123";
  }

  // Course Name validation
  if (!formData.course_name) {
    errors.course_name = "Course Name is required";
  } else if (formData.course_name.length < 3) {
    errors.course_name = "Course Name must be at least 3 characters";
  }

  // Course Description validation
  if (!formData.course_description) {
    errors.course_description = "Course Description is required";
  } else if (formData.course_description.length < 10) {
    errors.course_description =
      "Course Description must be at least 10 characters";
  }

  // Section Number validation
  if (!formData.section_number) {
    errors.section_number = "Section Number is required";
  } else if (!/^\d+$/.test(formData.section_number)) {
    errors.section_number = "Section Number must be a number";
  }

  // Semester Term validation
  if (!formData.semester_term) {
    errors.semester_term = "Semester Term is required";
  } else if (![1, 2].includes(Number(formData.semester_term))) {
    errors.semester_term = "Semester Term must be either 1 or 2";
  }

  // Semester Year validation
  if (!formData.semester_year) {
    errors.semester_year = "Semester Year is required";
  } else if (!/^\d{4}$/.test(formData.semester_year)) {
    errors.semester_year = "Semester Year must be a valid 4-digit year";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
