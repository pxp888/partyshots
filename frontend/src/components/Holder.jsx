import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { getUserData, removeTokens, isAuthenticated } from "../utils/auth";
import Topbar from "./Topbar";
import Welcomepage from "./Welcomepage";
import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";
import Userview from "./Userview";
import Albumview from "./Albumview";
import Accountpage from "./Accountpage";

function Holder() {
  const [currentUser, setCurrentUser] = useState(() => {
    // Initialize from localStorage (JWT-based)
    return isAuthenticated() ? getUserData() : null;
  });

  // Logout handler
  const handleLogout = () => {
    removeTokens();
    setCurrentUser(null);
  };

  return (
    <div className="holder">
      <Topbar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<Welcomepage />} />
        <Route
          path="/register"
          element={<RegisterPage setCurrentUser={setCurrentUser} />}
        />
        <Route
          path="/login"
          element={<LoginPage setCurrentUser={setCurrentUser} />}
        />
        <Route
          path="/user/:username"
          element={<Userview currentUser={currentUser} />}
        />
        <Route
          path="/album/:albumCode"
          element={<Albumview currentUser={currentUser} />}
        />
        <Route
          path="/account"
          element={
            <Accountpage
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default Holder;
