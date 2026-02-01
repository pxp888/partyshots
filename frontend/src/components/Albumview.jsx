import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Albumview.css";

function Albumview({ currentUser }) {
  const { albumCode } = useParams(); // pulls :albumCode from the URL
  const [album, setAlbum] = useState(null);
  const [togo, setTogo] = useState(0);

  useEffect(() => {
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

  async function uploadFile(file) {
    const description =
      document.querySelector(".formdiv.upform input[type='text']")?.value || "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("album", album?.code || "");

    try {
      const res = await fetch("/api/photos/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Uploaded:", data);
      } else {
        console.error("Upload failed:", data.error);
      }
    } catch (err) {
      console.error("Network error during upload:", err);
    }
  }

  function uploadFiles(event) {
    event.preventDefault();
    const form = event.target;
    const files = form.file.files;
    setTogo(files.length);
    for (let i = 0; i < files.length; i++) {
      uploadFile(files[i]);
    }
  }

  return (
    <>
      {!album ? (
        <p>Loading...</p>
      ) : (
        <div className="albumview">
          <h3>{album.name}</h3>
          <p>Code: {album.code}</p>
          {album.user__username && <p>Owner: {album.user__username}</p>}

          <form className="formdiv upform" onSubmit={uploadFiles}>
            <input type="file" name="file" multiple />
            {/* <input type="text" placeholder="description (optional)" />*/}
            <button>add to album</button>
          </form>
        </div>
      )}
    </>
  );
}

export default Albumview;
