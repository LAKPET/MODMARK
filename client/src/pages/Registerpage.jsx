import React, { useState } from "react";
import { MDBContainer, MDBBtn, MDBInput } from "mdb-react-ui-kit";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstname || !lastname) {
      alert("Firstname and Lastname are required!");
      return;
    }

    axios
      .post("http://localhost:5001/auth/register", {
        first_name: firstname, // change to `first_name`
        last_name: lastname, // change to `last_name`
        email,
        username,
        password,
      })
      .then((result) => {
        navigate("/login");
      })
      .catch((err) => console.log(err));
  };

  return (
    <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
      <div className="text-center mb-3">Register</div>
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
    </MDBContainer>
  );
}
