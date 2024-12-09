import React, { useState } from "react";
import { MDBContainer, MDBBtn, MDBInput } from "mdb-react-ui-kit";
import { Link } from "react-router-dom";
import axios from "axios";
import { Navigate } from "react-router-dom";
export default function Register() {
  const [fristname, setFristname] = useState();
  const [lastname, setLastname] = useState();
  const [email, setEmail] = useState();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  const handlesubmit = (e) => {
    e.preventDefault();
    axios
      .post("", { fristname, lastname, email, username, password })
      .then((result = console.log(result)))
      .catch((err) => console.log(err));
    Navigate("/login");
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
          id="form5"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Link to="/login">
          <MDBBtn className="mb-4 w-100">Register</MDBBtn>
        </Link>
      </from>
    </MDBContainer>
  );
}
