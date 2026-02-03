import React, { useState } from "react";
import "./Registerbox.css";

function Registerbox({ setCurrentUser, setShowRegister }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1️⃣ Register the new user
      const regRes = await fetch("/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const regData = await regRes.json();

      if (!regRes.ok) {
        alert(`Registration failed: ${regData.error}`);
        return;
      }

      // 2️⃣ Immediately log them in
      const loginRes = await fetch("/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        alert(`Login failed: ${loginData.error}`);
        return;
      }

      // 3️⃣ Set the authenticated user in state
      setCurrentUser(loginData.user);
      setShowRegister(null);
    } catch (error) {
      console.error("Error during register/login:", error);
      alert("An unexpected error occurred.");
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
