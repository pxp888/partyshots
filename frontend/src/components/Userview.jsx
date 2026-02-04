import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";
import "./Userview.css";
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
        const response = await api.get(
          `/albums/list/?username=${encodeURIComponent(username)}`
        );

        setAlbums(response.data.albums || []);
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
      const response = await api.post("/albums/create/", { name: albumName });

      alert(`Album "${response.data.album.name}" created!`);
      console.log(response.data);
      navigate(`/album/${response.data.album.code}`);
    } catch (error) {
      console.error("Error creating album:", error);
      const errorMsg = error.response?.data?.error || "An error occurred while creating the album.";
      alert(`Error creating album: ${errorMsg}`);
    }
  };

  return (
    <div className="userview">
      {canCreate && (
        <div className="albumtools">
          <form onSubmit={handleSubmit}>
            <label>
              New Album Name:
              <input
                id="newalbumline"
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                required
              />
            </label>
            <button className="btn" type="submit">
              Create Album
            </button>
          </form>
        </div>
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
