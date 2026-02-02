import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "./AlbumItem.css";
import blank from "../assets/blank.jpg";

function AlbumItem({ album }) {
  const navigate = useNavigate();
  const [src, setSrc] = useState(album.thumbnail || blank);

  const handleError = () => {
    if (src !== blank) {
      setSrc(blank);
    }
  };

  const handleClick = () => {
    navigate(`/album/${album.code}`);
  };

  const formatCreatedAt = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    // You can customize the options below if you want a different format
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // console.log(album);

  return (
    <div
      className="album-item"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="thumbnail">
        <img src={src} alt={album.name} onError={handleError} />
      </div>
      <div className="alabel">
        <h3>{album.name}</h3>
        <p className="label">owner</p>
        <p className="value">{album.user__username}</p>
        <p className="label">created</p>
        <p className="value">{formatCreatedAt(album.created_at)}</p>
      </div>
    </div>
  );
}

export default AlbumItem;
