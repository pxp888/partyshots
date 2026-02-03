import React, { useState, useEffect } from "react";
import "./FileItem.css";
import blank from "../assets/blank.jpg";
import { formatCreatedAt } from "./helpers.js";

function FileItem({
  file,
  index,
  setFocus,
  selectMode,
  toggleSelect,
  selected,
}) {
  const [src, setSrc] = useState(file.tlink || blank);

  const isSelected = selected.includes(file.id);

  const [handup, sethandup] = useState(false);

  useEffect(() => {
    sethandup(isSelected);
  }, [selected, isSelected]);

  const handleError = () => {
    if (src !== blank) {
      setSrc(blank);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();

    if (!selectMode) {
      setFocus(index);
    } else {
      toggleSelect(file.id);
    }
  };

  return (
    <div className="file-item" onClick={handleClick}>
      <div className="thumbnail">
        <img src={src} alt={file.filename} onError={handleError} />
      </div>
      <div className="fileinfo">
        <p className="label">user</p>
        <p className="value">{file.user__username}</p>
        <p className="label">filename</p>
        <p className="value">{file.filename}</p>
        <p className="label">uploaded</p>
        <p className="value">{formatCreatedAt(file.created_at)}</p>
      </div>
      {handup && <div className="selected"></div>}
    </div>
  );
}

export default FileItem;
