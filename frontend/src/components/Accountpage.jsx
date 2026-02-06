import api from "../utils/api";
import "./Accountpage.css";

function Accountpage() {
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
      const res = await api.post("/account/", {
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

  return (
    <div className="account-page">
      <h1>Account Page</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" name="email" />
        </label>
        <label>
          Password:
          <input type="password" name="password" />
        </label>
        <label>
          Confirm Password:
          <input type="password" name="confirmPassword" />
        </label>
        <button type="submit">Update Account</button>
      </form>
    </div>
  );
}

export default Accountpage;
