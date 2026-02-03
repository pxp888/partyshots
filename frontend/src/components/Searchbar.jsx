import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Searchbar.css";

function Searchbar() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setValue(e.target.value);

  const handleClick = async () => {
    try {
      const resp = await fetch(
        `/api/searchbar_lookup/?q=${encodeURIComponent(value)}`,
      );

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();

      if (data.status === "user") {
        navigate(`/user/${encodeURIComponent(value)}`);
      } else if (data.status === "album") {
        navigate(`/album/${encodeURIComponent(value)}`);
      } else {
        alert(`{data.status}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  return (
    <div className="searchbar">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type username or album code..."
      />
      <button className="btn" onClick={handleClick}>
        Go
      </button>
    </div>
  );
}

export default Searchbar;
