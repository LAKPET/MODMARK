import React, { useState } from "react";
import { MDBContainer, MDBBtn, MDBInput, MDBCheckbox } from "mdb-react-ui-kit";
import { Link } from "react-router-dom";
import axios from "axios";
export default function Register() {
  const [fristname, setFristname] = useState();
  const [lastname, setLastname] = useState();
  const [email, setEmail] = useState();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [checkbox, setCheckbox] = useState(false);

  const handlesubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/auth/register", { fristname, lastname, email, username, password, checkbox })
      .then((result = console.log(result)))
      .catch((err) => console.log(err));
  };
  return (
    <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
      <div className="text-center mb-3">Register</div>

      <from onSubmit={handlesubmit}>
        <MDBInput
          wrapperClass="mb-4"
          label="Fristname"
          id="form1"
          type="text"
          onChange={(e) => setFristname(e.target.value)}
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
          id="form4"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="d-flex justify-content-center mb-4">
          <MDBCheckbox
            name="flexCheck"
            id="flexCheckDefault"
            label="I have read and agree to the terms"
            onChange={(e) => setCheckbox(e.target.value)}
          />
        </div>

        <Link to="/login">
          <MDBBtn className="mb-4 w-100">Register</MDBBtn>
        </Link>
      </from>
    </MDBContainer>
  );
}
