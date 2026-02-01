import React from "react";
import { useState } from "react";
import "./Holder.css";
import Topbar from "./Topbar";
import Welcomepage from "./Welcomepage";

function Holder({ children, className = "" }) {
  const [User, setUser] = useState(null);
  const [current, setCurrent] = useState("welcome");

  return (
    <div className={`holder ${className}`}>
      {/* Pass the User state down to Topbar */}
      <Topbar user={User} />
      {current === "welcome" && <Welcomepage />}
    </div>
  );
}

export default Holder;
