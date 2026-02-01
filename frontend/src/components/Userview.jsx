import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AlbumItem from "./AlbumItem";

function Userview({ currentUser }) {
  const { username } = useParams();
  const [albumName, setAlbumName] = useState("");
  const [albums, setAlbums] = useState([]);
  const navigate = useNavigate();

  // Determine whether the logged‑in user is the same as the username in the URL
  const canCreate = currentUser && username === currentUser.username;

  // Fetch albums for the current user whenever the component mounts
  // or when the username changes.
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch(
          `/api/albums/list/?username=${encodeURIComponent(username)}`,
        );
        const data = await response.json();

        if (response.ok) {
          setAlbums(data.albums || []);
        } else {
          console.error("Failed to fetch albums:", data.error);
        }
      } catch (err) {
        console.error("Error fetching albums:", err);
      }
    };

    if (username) {
      fetchAlbums();
    }
  }, [username]);

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
        navigate(`/album/${data.album.code}`);
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

      {canCreate && (
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
      )}

      <div id="albumList">
        {albums.length > 0 ? (
          albums.map((album) => <AlbumItem key={album.id} album={album} />)
        ) : (
          <p>No albums found.</p>
        )}
      </div>
    </div>
  );
}

export default Userview;
