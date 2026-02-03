import { Link } from "react-router-dom";
import { useState } from "react";
import "./Topbar.css";
import Loginbox from "./Loginbox";

function Topbar({ currentUser, setCurrentUser }) {
  const [showLogin, setShowLogin] = useState(null);

  function logoutPressed(e) {
    e.preventDefault();
    setCurrentUser(null);
  }

  function loginPressed(e) {
    e.preventDefault();
    setShowLogin(1);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <Link to="/" className="logo-link">
            <h1>partyShots</h1>
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
              {/* <Link to="/login">Login</Link>*/}
              <p onClick={loginPressed}>Login</p>
              <Link to="/register">Register</Link>
            </nav>
          )}
        </div>
      </div>
      <div className="spacer"></div>
      {showLogin && (
        <Loginbox
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          setShowLogin={setShowLogin}
        ></Loginbox>
      )}
    </>
  );
}

export default Topbar;
