import { useState, useEffect } from "react";
import "./Imageview.css";
import blank from "../assets/blank.jpg";

function Imageview({ album, focus, setFocus }) {
  const photo = album?.photos?.[focus] ?? null;

  const [imgSrc, setImgSrc] = useState("");
  useEffect(() => {
    if (photo?.link) setImgSrc(photo.link);
    else setImgSrc("");
  }, [photo]);

  /* ---------------------------------------------------------------
     Keyboard handling
  --------------------------------------------------------------- */
  useEffect(() => {
    const handler = (e) => {
      if (!album?.photos) return; // nothing to do without photos

      switch (e.key) {
        case "ArrowRight": // next
          if (focus + 1 < album.photos.length) setFocus(focus + 1);
          break;
        case "ArrowLeft": // prev
          if (focus > 0) setFocus(focus - 1);
          break;
        case "Escape": // hide
          setFocus(-1);
          break;
        default:
          return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focus, album?.photos, setFocus]);

  /* ---------------------------------------------------------------
     Zone click helpers – no longer tied to button clicks.
  --------------------------------------------------------------- */
  const next = () => {
    if (focus + 1 < album.photos.length) setFocus(focus + 1);
  };

  const prev = () => {
    if (focus > 0) setFocus(focus - 1);
  };

  const hide = () => {
    setFocus(-1);
  };

  /* ---------------------------------------------------------------
     Render
  --------------------------------------------------------------- */
  if (!album?.photos) return null;
  if (!photo) return null;
  if (focus === -1) return null;

  const handleZoneClick = (e) => {
    const { clientX } = e;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const zoneWidth = rect.width / 3;

    if (relativeX < zoneWidth) {
      prev();
    } else if (relativeX > 2 * zoneWidth) {
      next();
    } else {
      hide();
    }
  };

  return (
    <div className="imageview" onClick={handleZoneClick}>
      <div className="imframe">
        <img
          src={imgSrc}
          alt={photo.filename}
          onError={() => setImgSrc(blank)}
        />
      </div>
      {/* Buttons removed – zone click handling takes over */}
    </div>
  );
}

export default Imageview;
