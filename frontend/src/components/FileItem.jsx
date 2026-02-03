import React, { useState } from "react";
import "./FileItem.css";
import blank from "../assets/blank.jpg";
import { formatCreatedAt } from "./helpers.js";

function FileItem({ file, index, setFocus }) {
  const [src, setSrc] = useState(file.tlink || blank);

  const handleError = () => {
    if (src !== blank) {
      setSrc(blank);
    }
  };

  const handleClick = () => {
    setFocus(index);
  };

  // console.log(file);

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
