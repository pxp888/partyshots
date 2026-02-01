import React from "react";
import "./Topbar.css";

function Topbar({ user }) {
  return (
    <div className="topbar">
      {user ? (
        <p>
          Welcome, <strong>{user}</strong>!
        </p>
      ) : (
        <p>No user logged in.</p>
      )}
    </div>
  );
}

export default Topbar;
