import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

function Userview({ currentUser }) {
  const { username } = useParams();
  const [albumName, setAlbumName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(`Album name submitted: ${albumName}`);
    // navigate(`/albums?name=${encodeURIComponent(albumName)}`);
  };

  return (
    <div className="userview">
      <h2>User View</h2>
      <p>User: {username}</p>

      <form onSubmit={handleSubmit}>
        <label>
          Album Name:
          <input
            type="text"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            required
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Userview;
