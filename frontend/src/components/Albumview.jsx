import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Albumview.css";

function Albumview({ currentUser }) {
  const { albumCode } = useParams(); // pulls :albumCode from the URL
  const [album, setAlbum] = useState(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await fetch(`/api/albums/${albumCode}/`);
        const data = await res.json();
        if (res.ok) {
          setAlbum(data.album);
          console.log(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlbum();
  }, [albumCode]);

  return (
    <>
      {!album ? (
        <p>Loading...</p>
      ) : (
        <div className="albumview">
          <h3>{album.name}</h3>
          <p>Code: {album.code}</p>
          {album.user__username && <p>Owner: {album.user__username}</p>}
          {/* Add more album details here */}
        </div>
      )}
    </>
  );
}

export default Albumview;
