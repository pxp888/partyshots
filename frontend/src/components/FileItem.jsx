import React, { useState } from "react";
import "./FileItem.css";
import blank from "../assets/blank.jpg";

function FileItem({ file }) {
  // Use the thumbnail link if available, otherwise the placeholder
  const [src, setSrc] = useState(file.tlink || blank);

  // If the thumbnail fails to load, switch to the placeholder
  const handleError = () => {
    if (src !== blank) {
      setSrc(blank);
    }
  };

  return (
    <div className="file-item">
      <div className="thumbnail">
        <img src={src} alt={file.filename} onError={handleError} />
      </div>
      <p>{file.filename}</p>
    </div>
  );
}

export default FileItem;
