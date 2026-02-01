import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";



function albumItem(album) {
  return (
    <div>
      <h2>{album.name}</h2>
      <p>{album.code}</p>
    </div>
  );
}




function Userview({ currentUser }) {
  const { username } = useParams();
  const [albumName, setAlbumName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/albums/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: albumName }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Album "${data.album.name}" created!`);
        console.log(data);
        // navigate(`/albums/${data.album.code}`);
      } else {
        alert(`Error creating album: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating album:", error);
      alert("An error occurred while creating the album.");
    }
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

      <div albumList>

      </div>
    </div>
  );
}

export default Userview;
