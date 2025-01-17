import React, { useState } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBInput,
} from "mdb-react-ui-kit";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstname || !lastname) {
      alert("Firstname and Lastname are required!");
      return;
    }

    axios
      .post(`${apiUrl}/auth/register`, {
        first_name: firstname,
        last_name: lastname,
        email,
        username,
        password,
      })
      .then(() => {
        navigate("/login");
      })
      .catch((err) => console.error(err));
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
              <h3 className="fw-bolder mt-1 mb-5 pb-1">
                <span style={{ color: "#F49427" }}>Mod</span>mark
              </h3>
              <p>Please register to create your account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <MDBInput
                wrapperClass="mb-4"
                label="Firstname"
                id="form1"
                type="text"
                onChange={(e) => setFirstname(e.target.value)}
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Lastname"
                id="form2"
                type="text"
                onChange={(e) => setLastname(e.target.value)}
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Email"
                id="form3"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Username"
                id="form4"
                type="text"
                onChange={(e) => setUsername(e.target.value)}
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Password"
                id="form5"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />

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
    </MDBContainer>
  );
}

export default Register;
