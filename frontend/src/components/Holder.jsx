import React from "react";
import "./Holder.css";

const Holder = ({ children, className = "" }) => {
  return (
    <div className={`holder ${className}`}>
      <h2>I am inside a Holder!</h2>
      <p>This is some content in the Holder component.</p>
      {children}
    </div>
  );
};

export default Holder;
