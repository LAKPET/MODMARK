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
