import "./AlbumItem.css";
import { useNavigate } from "react-router-dom";

function AlbumItem({ album }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/album/${album.code}`);
  };

  console.log(album);

  return (
    <div
      className="album-item"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <h3>{album.name}</h3>
      <p>Code: {album.code}</p>
      <p>Owner: {album.user__username}</p>
    </div>
  );
}

export default AlbumItem;
