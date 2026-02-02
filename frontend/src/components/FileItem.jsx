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

  console.log(file);

  return (
    <div className="file-item" onClick={handleClick}>
      <div className="thumbnail">
        <img src={src} alt={file.filename} onError={handleError} />
      </div>
      <div className="fileinfo">
        <p>{file.user__username}</p>
        <p>{file.filename}</p>
      </div>
    </div>
  );
}

export default FileItem;
