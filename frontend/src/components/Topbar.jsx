import { Link } from "react-router-dom";
import "./Topbar.css";

function Topbar({ currentUser, setCurrentUser }) {
  function logoutPressed(e) {
    e.preventDefault();
    setCurrentUser(null);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <Link to="/" className="logo-link">
            <h1>Partyshots</h1>
          </Link>
        </div>
        <div>
          {currentUser ? (
            <nav>
              <Link to={`/user/${currentUser.username}`}>
                home {currentUser.username}{" "}
              </Link>
              <p onClick={logoutPressed}>Logout</p>
            </nav>
          ) : (
            <nav>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </nav>
          )}
        </div>
      </div>
      <div className="spacer"></div>
    </>
  );
}

export default Topbar;
