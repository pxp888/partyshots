import { useEffect } from "react";
import api from "../utils/api";
import "./Accountpage.css";

function Accountpage({ currentUser, setCurrentUser }) {
  // fill in the form with current user data on load
  useEffect(() => {
    if (currentUser) {
      const emailInput = document.querySelector('input[name="email"]');
      if (emailInput) {
        emailInput.value = currentUser.email || "";
      }
    }
  }, [currentUser]);

  async function handleSubmit(event) {
    event.preventDefault();
    // check if password and confirm password match
    const password = event.target.password.value;
    const confirmPassword = event.target.confirmPassword.value;
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // check if email is valid
    const email = event.target.email.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const res = await api.post("/account/update/", {
        password: password,
        email: email,
      });

      alert(res.data.message || "Account updated successfully");
    } catch (err) {
      console.error("Failed to update: ", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Network error";
      alert(`update failed: ${msg}`);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const res = await api.post("/account/delete/", {});
      alert(res.data.message || "Account deleted successfully");
      setCurrentUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Failed to update: ", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Network error";
      alert(`delete failed: ${msg}`);
    }
  }

  return (
    <section>
      <div className="account-page">
        <h1>Account Page</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Email:
            <input type="email" name="email" />
          </label>
          <label>
            New Password:
            <input type="password" name="password" />
          </label>
          <label>
            Confirm New Password:
            <input type="password" name="confirmPassword" />
          </label>
          <button type="submit">Update Account</button>
        </form>
      </div>
      <div className="account-page">
        <h2>Delete Account</h2>
        <p>
          Warning: This action cannot be undone. All your albums and photos will
          be permanently deleted.
        </p>
        <button id="delete_button" className="btn" onClick={handleDelete}>
          Delete Account
        </button>
      </div>
    </section>
  );
}

export default Accountpage;
