import { Link } from "react-router-dom";
import "./Topbar.css";

function Topbar({ currentUser, setCurrentUser }) {
  function logoutPressed(e) {
    setCurrentUser(null);
    e.preventDefault();
  }

  return (
    <div className="topbar">
      <div>
        <Link to="/" className="logo-link">
          <h2>Logo</h2>
        </Link>
      </div>
      <div>
        {currentUser ? (
          <>
            <p onClick={logoutPressed}>Logout</p>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Topbar;
