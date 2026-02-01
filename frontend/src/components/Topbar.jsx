import { Link } from "react-router-dom";
import "./Topbar.css";

function Topbar() {
  return (
    <div className="topbar">
      <div>
        <Link to="/" style={{ textDecoration: "none" }}>
          <h2>Logo</h2>
        </Link>
      </div>
      <div>
        <Link to="/login" style={{ marginRight: "1rem" }}>
          Login
        </Link>
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
}

export default Topbar;
