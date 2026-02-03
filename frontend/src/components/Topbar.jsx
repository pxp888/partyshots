import { Link } from "react-router-dom";
import { useState } from "react";
import "./Topbar.css";
import Loginbox from "./Loginbox";
import Registerbox from "./Registerbox";
import Searchbar from "./Searchbar";

function Topbar({ currentUser, setCurrentUser }) {
  const [showLogin, setShowLogin] = useState(null);
  const [showRegister, setShowRegister] = useState(null); // NEW state

  function logoutPressed(e) {
    e.preventDefault();
    setCurrentUser(null);
  }

  function loginPressed(e) {
    e.preventDefault();
    setShowLogin(1);
  }

  function registerPressed(e) {
    e.preventDefault();
    setShowRegister(1);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <Link to="/" className="logo-link">
            <h1>partyShots</h1>
          </Link>
        </div>
        <Searchbar />
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
              <p onClick={registerPressed}>Register</p> {/* replaced Link */}
            </nav>
          )}
        </div>
      </div>
      <div className="spacer"></div>
      {showLogin && (
        <Loginbox
          setCurrentUser={setCurrentUser}
          setShowLogin={setShowLogin}
        ></Loginbox>
      )}
      {showRegister && ( // NEW overlay
        <Registerbox
          setCurrentUser={setCurrentUser}
          setShowRegister={setShowRegister}
        ></Registerbox>
      )}
    </>
  );
}

export default Topbar;
