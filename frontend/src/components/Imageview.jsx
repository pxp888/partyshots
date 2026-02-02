import React from "react";
import "./Imageview.css";

function Imageview({ album, focus, setFocus }) {
  if (!album || !album.photos) return null;

  const photo = album.photos[focus];
  if (!photo) return null;

  function next(e) {
    e.preventDefault();
    // Only advance if we’re not already at the last photo
    if (focus + 1 < album.photos.length) {
      setFocus(focus + 1);
    }
  }

  function prev(e) {
    e.preventDefault();
    // Only retreat if we’re not already at the first photo
    if (focus > 0) {
      setFocus(focus - 1);
    }
  }

  function hide(e) {
    e.preventDefault();
    setFocus(-1);
  }

  return (
    <div className="imageview">
      <h4>{photo.filename}</h4>
      {/* <img
        src={photo.tlink || photo.thumbnail || photo.url}
        alt={photo.filename}
        className="imageview-img"
      />*/}
      <button onClick={next}>next</button>
      <button onClick={prev}>prev</button>
      <button onClick={hide}>done</button>
    </div>
  );
}

export default Imageview;
