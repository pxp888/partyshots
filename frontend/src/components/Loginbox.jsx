import React, { useState } from "react";
import { setTokens, setUserData } from "../utils/auth";
import "./Loginbox.css";
import { useNavigate, useLocation } from "react-router-dom";

function Loginbox({ setCurrentUser, setShowLogin }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

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

        setShowLogin(null);

        // If we are currently on the welcome page, redirect to the user's profile
        if (location.pathname === "/") {
          navigate(`/user/${data.user.username}`);
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("An error occurred during login.");
    }
  };

  function backClicked(e) {
    e.preventDefault();
    setShowLogin(null);
  }

  return (
    <div className="loginback" onClick={backClicked}>
      <div className="loginbox" onClick={(e) => e.stopPropagation()}>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={credentials.username}
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
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className="btn" type="submit">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Loginbox;
