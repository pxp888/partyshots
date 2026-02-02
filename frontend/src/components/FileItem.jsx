import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FileItem.css";
import blank from "../assets/blank.jpg";

function FileItem({ file }) {
  const [src, setSrc] = useState(file.tlink || blank);
  const navigate = useNavigate();

  const handleError = () => {
    if (src !== blank) {
      setSrc(blank);
    }
  };

  const handleClick = () => {
    // navigate(`/view/${file.id}`);
  };

  // console.log(file);

  return (
    <div className="file-item" onClick={handleClick}>
      <div className="thumbnail">
        <img src={src} alt={file.filename} onError={handleError} />
      </div>
      <p>{file.filename}</p>
    </div>
  );
}

export default FileItem;
