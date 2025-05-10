import React, { useState } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBInput,
} from "mdb-react-ui-kit";
import { useNavigate, Link } from "react-router-dom";
import ModalComponent from "../../controls/Modal";
import { validateRegistrationForm } from "../../utils/FormValidation";
import { authAPI } from "../../services/authAPI"; // Import the authAPI

function Register() {
  const [personalNum, setPersonalNum] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      personalNum,
      firstname,
      lastname,
      email,
      username,
      password,
    };

    const { isValid, errors: validationErrors } =
      validateRegistrationForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Using authAPI for registration
      await authAPI.register({
        personal_num: personalNum,
        first_name: firstname,
        last_name: lastname,
        email,
        username,
        password,
      });

      setShowModal(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setErrorModal({ open: true, message: errorMessage });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/login");
  };

  const handleErrorModalClose = () => {
    setErrorModal({ open: false, message: "" });
  };

  return (
    <MDBContainer className="my-5">
      <MDBRow>
        <MDBCol col="6" className="mb-5">
          <div
            className="d-flex flex-column justify-content-center h-100 mb-4 position-relative"
            style={{
              backgroundImage:
                "url('https://i.pinimg.com/736x/9b/a9/27/9ba92735c098ad515bbf1198a425c754.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div
              className="text-black rounded-3 px-3 py-4 p-md-5 mx-md-4"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <h3 className="mb-4 text-center fw-bolder">
                Why <span style={{ color: "#F49427" }}>Mod</span>mark?
              </h3>
              <p className="medium mb-0 text-center">
                Modmark simplifies the process of collaborative grading and
                feedback, making evaluation more efficient and effective.
              </p>
            </div>
          </div>
        </MDBCol>

        <MDBCol col="6" className="mb-5">
          <div className="d-flex flex-column ms-5">
            <div className="text-center">
              <h3 className="fw-bolder mt-1 mb-4 pb-1">
                <span style={{ color: "#F49427" }}>Mod</span>mark
              </h3>
              <p>Please register to create your account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <MDBInput
                  wrapperClass="mb-2"
                  label="Personal Number"
                  placeholder="e.g. 234"
                  id="form1"
                  type="text"
                  value={personalNum}
                  onChange={(e) => setPersonalNum(e.target.value)}
                  invalid={!!errors.personalNum}
                  className={errors.personalNum ? "border-danger" : ""}
                />
                {errors.personalNum && (
                  <div
                    className="text-danger"
                    style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                  >
                    {errors.personalNum}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <MDBInput
                  wrapperClass="mb-2"
                  label="Firstname"
                  placeholder="Firstname must be at least 3 characters"
                  id="form2"
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  invalid={!!errors.firstname}
                  className={errors.firstname ? "border-danger" : ""}
                />
                {errors.firstname && (
                  <div
                    className="text-danger"
                    style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                  >
                    {errors.firstname}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <MDBInput
                  wrapperClass="mb-2"
                  label="Lastname"
                  placeholder="Lastname must be at least 3 characters"
                  id="form3"
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  invalid={!!errors.lastname}
                  className={errors.lastname ? "border-danger" : ""}
                />
                {errors.lastname && (
                  <div
                    className="text-danger"
                    style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                  >
                    {errors.lastname}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <MDBInput
                  wrapperClass="mb-2"
                  label="Email"
                  placeholder="e.g. exemple@exemple.com"
                  id="form4"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  invalid={!!errors.email}
                  className={errors.email ? "border-danger" : ""}
                />
                {errors.email && (
                  <div
                    className="text-danger"
                    style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                  >
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <MDBInput
                  wrapperClass="mb-2"
                  label="Username"
                  placeholder="Username must be at least 3 characters"
                  id="form5"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  invalid={!!errors.username}
                  className={errors.username ? "border-danger" : ""}
                />
                {errors.username && (
                  <div
                    className="text-danger"
                    style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                  >
                    {errors.username}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <MDBInput
                  wrapperClass="mb-2"
                  label="Password"
                  placeholder="Password must be at least 6 characters"
                  id="form6"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  invalid={!!errors.password}
                  className={errors.password ? "border-danger" : ""}
                />
                {errors.password && (
                  <div
                    className="text-danger"
                    style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                  >
                    {errors.password}
                  </div>
                )}
              </div>

              {errors.submit && (
                <div
                  className="text-danger mb-4 text-left"
                  style={{ fontSize: "0.875rem" }}
                >
                  {errors.submit}
                </div>
              )}

              <MDBBtn type="submit" className="mb-4 w-100">
                Register
              </MDBBtn>
            </form>

            <div className="d-flex flex-row align-items-center justify-content-center pb-4">
              <p className="mb-0">Already have an account?</p>
              <Link to="/login">
                <MDBBtn
                  outline
                  className="mx-2"
                  style={{
                    color: "#F49427",
                    borderColor: "#F49427",
                  }}
                >
                  Login
                </MDBBtn>
              </Link>
            </div>
          </div>
        </MDBCol>
      </MDBRow>

      <ModalComponent
        open={showModal}
        handleClose={handleModalClose}
        title="Registration Successful"
        description="Your account has been created successfully. You can now login with your credentials."
        type="success"
      />

      <ModalComponent
        open={errorModal.open}
        handleClose={handleErrorModalClose}
        title="Registration Error"
        description={errorModal.message}
        type="error"
      />
    </MDBContainer>
  );
}

export default Register;
