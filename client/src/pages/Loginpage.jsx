import React, { useState } from "react";
import Logo from "../assets/Picture/Logo.png";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBValidation,
  MDBValidationItem,
} from "mdb-react-ui-kit";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import { useAuth } from "../routes/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";

function Loginpage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // To show error messages
  const [loading, setLoading] = useState(false); // To handle loading state
  const navigate = useNavigate(); // To navigate after successful login
  const { setUser } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handlesubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    axios
      .post(`${apiUrl}/auth/login`, { email, password })
      .then((result) => {
        setLoading(false);
        const { token, user } = result.data;
        localStorage.setItem("authToken", token);
        localStorage.setItem("Username", user.username);
        localStorage.setItem("UserRole", user.role);
        localStorage.setItem("UserId", user.id);
        setUser(user);

        if (user.role === "admin") {
          navigate("/dashboard/admin/users");
        } else if (user.role === "professor" || user.role === "ta") {
          navigate("/professor/course");
        } else if (user.role === "student") {
          navigate("/student/course");
        }
      })
      .catch((err) => {
        setLoading(false);
        setErrorMessage("Invalid credentials, please try again.");
        console.error(err);
      });
  };

  if (loading) {
    return (
      <Backdrop
        sx={(theme) => ({ color: "#8B5F34", zIndex: theme.zIndex.drawer + 1 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

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

            <MDBValidation className="row g-3" onSubmit={handlesubmit}>
              <MDBValidationItem
                className="col-12"
                feedback="Please enter a valid email."
                invalid
              >
                <MDBInput
                  wrapperClass="mb-2"
                  label="Email address"
                  id="form1"
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </MDBValidationItem>

              <MDBValidationItem
                className="col-12"
                feedback="Password is required."
                invalid
              >
                <MDBInput
                  wrapperClass="mb-2"
                  label="Password"
                  id="form2"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                />
              </MDBValidationItem>

              {errorMessage && (
                <div className="text-danger mb-4">{errorMessage}</div>
              )}

              <div className="text-center pt-1 mb-5 pb-1">
                <MDBBtn
                  className="mb-4 w-100 gradient-custom-2 mb-4"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? "Loading..." : "Sign in"}
                </MDBBtn>
                <a className="text-muted" href="#!">
                  Forgot password?
                </a>
              </div>
            </MDBValidation>

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

export default Loginpage;
