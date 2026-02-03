import React, { useState } from "react";
import "./Loginbox.css";
import { useNavigate, useLocation } from "react-router-dom";

function Loginbox({ setCurrentUser, setShowLogin }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setCurrentUser(data.user);
        setShowLogin(null);
        // If we are currently on the welcome page, redirect to the user's profile
        if (location.pathname === "/") {
          navigate(`/user/${data.user.username}`);
        }
      } else {
        alert(`Login failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred during login.");
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
