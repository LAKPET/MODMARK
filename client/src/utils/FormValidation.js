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
  } else if (formData.firstname.length < 2) {
    errors.firstname = "Firstname must be at least 2 characters";
  }

  // Lastname validation
  if (!formData.lastname) {
    errors.lastname = "Lastname is required";
  } else if (formData.lastname.length < 2) {
    errors.lastname = "Lastname must be at least 2 characters";
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
