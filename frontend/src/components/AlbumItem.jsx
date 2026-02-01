import "./AlbumItem.css";
import { useNavigate } from "react-router-dom";

function AlbumItem({ album }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to the album view using the album code in the URL
    navigate(`/album/${album.code}`);
  };

  return (
    <div
      className="album-item"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <h3>{album.name}</h3>
      <p>Code: {album.code}</p>
    </div>
  );
}

export default AlbumItem;
