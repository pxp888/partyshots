import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import "./FileItem.css";
import blank from "../assets/blank.jpg";

function FileItem({ file, index, setFocus }) {
  const [src, setSrc] = useState(file.tlink || blank);
  // const navigate = useNavigate();

  const handleError = () => {
    if (src !== blank) {
      setSrc(blank);
    }
  };

  const handleClick = () => {
    setFocus(index);
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

  console.log(file);

  return (
    <div className="file-item" onClick={handleClick}>
      <div className="thumbnail">
        <img src={src} alt={file.filename} onError={handleError} />
      </div>
      <div className="fileinfo">
        <p className="label">filename</p>
        <p className="value">{file.filename}</p>
        <p className="label">user</p>
        <p className="value">{file.user__username}</p>
        <p className="label">uploaded</p>
        <p className="value">{formatCreatedAt(file.created_at)}</p>
      </div>
    </div>
  );
}

export default FileItem;
