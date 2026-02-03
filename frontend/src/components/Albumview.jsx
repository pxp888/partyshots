import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Albumview.css";
import FileItem from "./FileItem";
import Imageview from "./Imageview";
import { formatCreatedAt } from "./helpers.js";

function Albumview({ currentUser }) {
  const { albumCode } = useParams();
  const [album, setAlbum] = useState(null);
  const [focus, setFocus] = useState(-1);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);

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

  // function uploadFiles(event) {
  //   event.preventDefault();
  //   const form = event.target;
  //   const files = form.file.files;
  //   for (let i = 0; i < files.length; i++) {
  //     uploadFile(files[i]);
  //   }
  //   form.reset();
  // }

  function downloadAll(e) {
    e.preventDefault();
    //get everything
  }

  function subscribe(e) {
    e.preventDefault();
    // todo later
  }

  async function deleteAlbum(e) {
    e.preventDefault();

    if (!album) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the album "${album.name}"?`,
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/albums/${album.code}/delete/`, {
        method: "POST", // or "DELETE"
        credentials: "include", // ensure cookies / session are sent
      });
      const data = await res.json();

      if (res.ok) {
        console.log("Deleted:", data);
        // Optionally redirect to a list page
        window.location.href = "/albums"; // adjust to your routing
      } else {
        console.error("Delete failed:", data.error);
        alert(`Delete failed: ${data.error}`);
      }
    } catch (err) {
      console.error("Network error during delete:", err);
      alert("Network error while deleting the album.");
    }
  }

  function toggleSelectMode(e) {
    e.preventDefault();
    setSelectMode(!selectMode);
  }

  function toggleSelect(fid) {
    setSelected((prev) => {
      const idx = prev.indexOf(fid);
      if (idx !== -1) {
        const newSelected = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
        console.log("Updated selection (array):", newSelected);
        return newSelected;
      }
      const newSelected = [...prev, fid];
      console.log("Updated selection (array):", newSelected);
      return newSelected;
    });
  }

  function clearSelection() {
    setSelected([]);
  }

  function selectAll() {
    if (!album?.photos) return;
    const allIds = album.photos.map((p) => p.id);
    setSelected(allIds);
  }

  function deleteSelected() {
    //todo
  }

  function downloadSelected() {
    //todo
  }

  // console.log(album);

  if (!album) return <p>Loading ...</p>;

  return (
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
        <div className="initem">
          <p className="label">open</p>
          <p className="value">{album.editable ? "yes" : "no"}</p>
        </div>
      </div>

      {currentUser && (
        <div className="controlblock">
          {!selectMode && (
            <div className="controls">
              {/* Hidden file selector */}
              <input
                type="file"
                name="file"
                multiple
                id="hiddenFileInput"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const files = e.target.files;
                  for (let i = 0; i < files.length; i++) {
                    await uploadFile(files[i]); // reuse the existing uploadFile helper
                  }
                  // reset the input so the same file can be re‑selected if needed
                  e.target.value = "";
                }}
              />
              {/* Button that opens the selector */}
              <button
                className="btn"
                onClick={() =>
                  document.getElementById("hiddenFileInput").click()
                }
              >
                add to album
              </button>
            </div>
          )}

          {!selectMode ? (
            <div className="controls">
              <button className="btn" onClick={downloadAll}>
                Download all
              </button>
              <button className="btn" onClick={subscribe}>
                Subscribe
              </button>
              <button className="btn" onClick={deleteAlbum}>
                delete album
              </button>
              <button className="btn" onClick={toggleSelectMode}>
                select Mode
              </button>
            </div>
          ) : (
            <div className="controls">
              <button className="btn" onClick={toggleSelectMode}>
                select Mode off
              </button>
              <button className="btn" onClick={clearSelection}>
                clear selection
              </button>
              <button className="btn" onClick={selectAll}>
                select all
              </button>
              <button className="btn" onClick={deleteSelected}>
                delete selected
              </button>
              <button className="btn" onClick={downloadSelected}>
                download selected
              </button>
            </div>
          )}
        </div>
      )}
      <div className="photo-list">
        {album.photos?.map((photo, index) => (
          <FileItem
            key={photo.id}
            file={photo}
            index={index}
            setFocus={setFocus}
            selectMode={selectMode}
            toggleSelect={toggleSelect}
            selected={selected}
          />
        ))}
      </div>
      {focus !== -1 && (
        <Imageview album={album} focus={focus} setFocus={setFocus} />
      )}
    </div>
  );
}

export default Albumview;
