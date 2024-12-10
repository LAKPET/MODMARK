import React, { useState } from "react";
import Logo from "../assets/Picture/Logo.png";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
} from "mdb-react-ui-kit";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "mdb-react-ui-kit/dist/css/mdb.min.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // To show error messages
  const [loading, setLoading] = useState(false); // To handle loading state
  const navigate = useNavigate(); // To navigate after successful login
  const location = useLocation(); // To get current route

  const handlesubmit = (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setErrorMessage(""); // Clear any previous error

    axios
      .post("http://localhost:5001/auth/login", { email, password }) // Use correct API endpoint
      .then((result) => {
        setLoading(false); // Stop loading
        const { token, user } = result.data;
        localStorage.setItem("authToken", token); // Store the token in localStorage
        localStorage.setItem("Username", user.username);

        // Redirect to the dashboard or home page
        navigate("/course");
      })
      .catch((err) => {
        setLoading(false); // Stop loading
        setErrorMessage("Invalid credentials, please try again."); // Set error message
        console.error(err);
      });
  };

  return (
    <MDBContainer className="my-5">
      <MDBRow>
        <MDBCol col="6" className="mb-5">
          <div className="d-flex flex-column ms-5">
            <div className="text-center">
              <img src={Logo} style={{ width: "185px" }} alt="Logo" />
              <h3 className="fw-bolder mt-1 mb-5 pb-1">
                <span style={{ color: "#F49427" }}>Mod</span>mark
              </h3>
            </div>

            <p>Please login to your account</p>
            <form onSubmit={handlesubmit}>
              <MDBInput
                wrapperClass="mb-4"
                label="Email address"
                id="form1"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Password"
                id="form2"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />

              {/* Display error message if login fails */}
              {errorMessage && (
                <div className="text-danger mb-4">{errorMessage}</div>
              )}

              <div className="text-center pt-1 mb-5 pb-1">
                <MDBBtn
                  className="mb-4 w-100 gradient-custom-2"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? "Loading..." : "Sign in"}
                </MDBBtn>
                <a className="text-muted" href="#!">
                  Forgot password?
                </a>
              </div>
            </form>

            <div className="d-flex flex-row align-items-center justify-content-center pb-4 mb-4">
              <p className="mb-0">Don't have an account?</p>
              <Link to="/register">
                <MDBBtn
                  outline
                  className="mx-2"
                  style={{
                    color: "#F49427",
                    borderColor: "#F49427",
                  }}
                >
                  Register
                </MDBBtn>
              </Link>
            </div>
          </div>
        </MDBCol>

        <MDBCol col="6" className="mb-5">
          <div
            className="d-flex flex-column justify-content-center h-100 mb-4 position-relative"
            style={{
              backgroundImage:
                "url('https://i.pinimg.com/736x/39/49/7c/39497cb1f8f65726085e229ef09840e4.jpg')",
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
                What is the <span style={{ color: "#F49427" }}>Mod</span>mark?
              </h3>
              <p className="medium mb-0 text-center">
                Modmark is a platform designed to facilitate the collaborative
                evaluation of student work. It makes it easier and more
                convenient for multiple instructors to review and assess
                assignments together, whether through co-grading or offering
                feedback.
              </p>
            </div>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Login;
