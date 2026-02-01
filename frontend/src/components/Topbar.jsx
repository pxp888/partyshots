import { Link } from "react-router-dom";
import "./Topbar.css";

function Topbar({ currentUser, setCurrentUser }) {
  function logoutPressed(e) {
    e.preventDefault();
    setCurrentUser(null);
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
            <p>logged in as : {currentUser.username}</p>
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
