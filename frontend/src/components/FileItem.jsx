import React, { useState } from "react";
import "./FileItem.css";
import blank from "../assets/blank.jpg";

function FileItem({ file }) {
  const [src, setSrc] = useState(file.tlink || blank);

  const handleError = () => {
    if (src !== blank) {
      setSrc(blank);
    }
  };

  console.log(file);

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
