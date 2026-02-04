import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setTokens, setUserData } from "../utils/auth";
import "./RegisterPage.css";

function RegisterPage({ setCurrentUser }) {
  const navigate = useNavigate();
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT tokens
        setTokens(data.tokens.access, data.tokens.refresh);

        // Store user data
        setUserData(data.user);
        setCurrentUser(data.user);

        // Auto-login and redirect to user page
        navigate(`/user/${data.user.username}`);
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
      console.error("Error registering:", error);
      setError("An error occurred during registration.");
    }
  };

  return (
    <section className="register-page">
      <h2>Create an Account</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">Register</button>
      </form>
    </section>
  );
}

export default RegisterPage;
