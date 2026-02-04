import React, { useState } from "react";
import { setTokens, setUserData } from "../utils/auth";
import "./Registerbox.css";

function Registerbox({ setCurrentUser, setShowRegister }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT tokens (registration now returns tokens)
        setTokens(data.tokens.access, data.tokens.refresh);

        // Store user data
        setUserData(data.user);
        setCurrentUser(data.user);

        setShowRegister(null);
      } else {
        // Handle validation errors from Django REST framework
        let errorMessage = "Registration failed";

        if (data.username) {
          errorMessage = Array.isArray(data.username) ? data.username[0] : data.username;
        } else if (data.password) {
          errorMessage = Array.isArray(data.password) ? data.password[0] : data.password;
        } else if (data.email) {
          errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        }

        setError(errorMessage);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError("An unexpected error occurred.");
    }
  };

  function backClicked(e) {
    e.preventDefault();
    setShowRegister(null);
  }

  return (
    <div className="registerback" onClick={backClicked}>
      <div className="registerbox" onClick={(e) => e.stopPropagation()}>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className="btn" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Registerbox;
