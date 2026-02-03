import { useEffect, useRef } from "react";
import "./Imageview.css";
import blank from "../assets/blank.jpg";

function Imageview({ album, focus, setFocus }) {
  const photo = album?.photos?.[focus] ?? null;

  // Ref to the <img> element so we can manipulate its src directly
  const imgRef = useRef(null);

  // Derived source; updated whenever the focused photo changes
  const src = photo?.link ?? "";

  // Whenever src changes, update the img element’s src attribute
  useEffect(() => {
    if (imgRef.current) imgRef.current.src = src;
  }, [src]);

  /* ---------------------------------------------------------------
     Keyboard handling
  --------------------------------------------------------------- */
  useEffect(() => {
    const handler = (e) => {
      if (!album?.photos) return;

      switch (e.key) {
        case "ArrowRight":
          if (focus + 1 < album.photos.length) setFocus(focus + 1);
          break;
        case "ArrowLeft":
          if (focus > 0) setFocus(focus - 1);
          break;
        case "Escape":
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

    if (relativeX < zoneWidth) prev();
    else if (relativeX > 2 * zoneWidth) next();
    else hide();
  };

  return (
    <div className="imageview" onClick={handleZoneClick}>
      <div className="imframe">
        <img
          ref={imgRef}
          alt={photo.filename}
          onError={() => {
            if (imgRef.current) imgRef.current.src = blank;
          }}
        />
      </div>
      {/* Buttons removed – zone click handling takes over */}
    </div>
  );
}

export default Imageview;
