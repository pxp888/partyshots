import { useState } from "react";
import api from "../utils/api";

function Mergebar({ albumCode }) {
  const [value, setValue] = useState("");

  const handleChange = (e) => setValue(e.target.value);

  const handleClick = async () => {
    try {
      const { data } = await api.post("/mergeAlbums/", {
        source: value,
        destination: albumCode,
      });

      // After a successful merge, refresh the page so the UI reflects the updated album.
      window.location.reload();
    } catch (err) {
      // err is an AxiosError – its message already contains the status
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="mergebar">
      <input
        id="mergeline"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type merge code..."
      />
      <button className="btn" onClick={handleClick}>
        Merge
      </button>
    </div>
  );
}

export default Mergebar;
