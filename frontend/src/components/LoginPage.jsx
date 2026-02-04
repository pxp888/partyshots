import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setTokens, setUserData } from "../utils/auth";
import "./LoginPage.css";

function LoginPage({ setCurrentUser }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT tokens
        setTokens(data.tokens.access, data.tokens.refresh);

        // Store user data
        setUserData(data.user);
        setCurrentUser(data.user);

        navigate(`/user/${data.user.username}`);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("An error occurred during login.");
    }
  };

  return (
    <section className="login-page">
      <h2>Sign In</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            type="text"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">Log In</button>
      </form>
    </section>
  );
}

export default LoginPage;
