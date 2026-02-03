import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Albumview.css";
import FileItem from "./FileItem";
import Imageview from "./Imageview";
import { formatCreatedAt } from "./helpers.js";

function Albumview({ currentUser }) {
  const { albumCode } = useParams(); // pulls :albumCode from the URL
  const [album, setAlbum] = useState(null);
  const [focus, setFocus] = useState(-1);

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

        setAlbum((prev) =>
          prev
            ? {
                ...prev,
                photos: [...(prev.photos ?? []), data.photo],
              }
            : prev,
        );
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
    for (let i = 0; i < files.length; i++) {
      uploadFile(files[i]);
    }
    form.reset();
  }

  function downloadAll(e) {
    e.preventDefault();
    //get everything
  }

  function subscribe(e) {
    e.preventDefault();
    // todo later
  }

  function deleteAlbum(e) {
    e.preventDefault();
    //todo later
  }

  return (
    <>
      {!album ? (
        <p>Loading...</p>
      ) : (
        <div className="albumview">
          <div className="albuminfo">
            <div className="initem">
              <p className="label">name</p>
              <p className="value">{album.name}</p>
            </div>
            <div className="initem">
              <p className="label">owner</p>
              <p className="value">{album.user__username}</p>
            </div>
            <div className="initem">
              <p className="label">created</p>
              <p className="value">{formatCreatedAt(album.created_at)}</p>
            </div>
            <div className="initem">
              <p className="label">code</p>
              <p className="value">{album.code}</p>
            </div>
          </div>

          <div className="controlblock">
            {currentUser && (
              <form className="controls" onSubmit={uploadFiles}>
                <input type="file" name="file" multiple />
                <button className="btn">add to album</button>
              </form>
            )}
            <div className="controls">
              <button className="btn" onClick={downloadAll}>
                Download all
              </button>
              <button className="btn" onClick={subscribe}>
                Subscribe
              </button>
              {currentUser && (
                <button className="btn" onClick={deleteAlbum}>
                  delete album
                </button>
              )}
            </div>
          </div>

          <div className="photo-list">
            {album.photos?.map((photo, index) => (
              <FileItem
                key={photo.id}
                file={photo}
                index={index}
                setFocus={setFocus}
              />
            ))}
          </div>
          {focus !== -1 && (
            <Imageview album={album} focus={focus} setFocus={setFocus} />
          )}
        </div>
      )}
    </>
  );
}

export default Albumview;
