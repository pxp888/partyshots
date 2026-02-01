import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Albumview.css";

function Albumview() {
  const { albumCode } = useParams(); // pulls :albumCode from the URL
  const [album, setAlbum] = useState(null);

  useEffect(() => {
    // Example: fetch album data from an endpoint
    const fetchAlbum = async () => {
      try {
        const res = await fetch(`/api/albums/${albumCode}/`);
        const data = await res.json();
        if (res.ok) {
          setAlbum(data.album);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlbum();
  }, [albumCode]);

  if (!album) {
    return <div>Loading album {albumCode}…</div>;
  }

  return (
    <div className="albumview">
      <h3>{album.name}</h3>
      <p>Code: {album.code}</p>
      {/* Add more album details here */}
    </div>
  );
}

export default Albumview;
