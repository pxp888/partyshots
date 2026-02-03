import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Albumview.css";
import FileItem from "./FileItem";
import Imageview from "./Imageview";
import { formatCreatedAt } from "./helpers.js";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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
    if (selectMode) setSelected([]);
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

  async function deleteSelected() {
    if (selected.length === 0) return;

    const confirmDelete = window.confirm(
      `Delete ${selected.length} selected photo${selected.length > 1 ? "s" : ""}?`,
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/photos/delete/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selected }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Deleted:", data);
        // Update the album state by removing the deleted photos
        setAlbum((prev) =>
          prev
            ? {
                ...prev,
                photos: prev.photos.filter((p) => !selected.includes(p.id)),
              }
            : prev,
        );
        // Clear the selection
        setSelected([]);
      } else {
        console.error("Delete failed:", data.error);
        alert(`Delete failed: ${data.error}`);
      }
    } catch (err) {
      console.error("Network error during delete:", err);
      alert("Network error while deleting photos.");
    }
  }

  function selectAll() {
    if (!album?.photos) return;
    const allIds = album.photos.map((p) => p.id);
    setSelected(allIds);
  }

  async function downloadSelected() {
    if (selected.length === 0) return;

    // Find the full photo objects that correspond to the selected ids
    const selectedPhotos = album.photos.filter((p) => selected.includes(p.id));

    if (selectedPhotos.length === 0) {
      alert("No valid photos found for the current selection.");
      return;
    }

    const zip = new JSZip();

    // Helper to fetch a photo's binary data
    const fetchBlob = async (url, filename) => {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`Failed to fetch ${filename}`);
      return await res.blob();
    };

    try {
      // Show a simple spinner (optional)
      setSelectMode(true); // you can toggle a “busy” state instead

      // Download each file and add it to the zip
      for (const photo of selectedPhotos) {
        if (!photo.link) continue; // skip if no link present
        const blob = await fetchBlob(photo.link, photo.filename);
        zip.file(photo.filename, blob);
      }

      // Generate the zip file (as a blob)
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Trigger download – you can customise the filename
      saveAs(zipBlob, `${album.name || "album"}_${selectedPhotos.length}.zip`);
    } catch (err) {
      console.error("Error while creating zip:", err);
      alert("An error occurred while preparing the ZIP file.");
    } finally {
      // Reset any busy UI state you added
      setSelected([]);
      setSelectMode(false);
    }
  }

  function downloadAll(e) {
    e.preventDefault();
    if (!album || !album.photos || album.photos.length === 0) {
      alert("No photos available to download.");
      return;
    }

    const zip = new JSZip();

    const fetchBlob = async (url, filename) => {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`Failed to fetch ${filename}`);
      return await res.blob();
    };

    setSelectMode(true);

    (async () => {
      try {
        for (const photo of album.photos) {
          if (!photo.link) continue; // skip if the photo link is missing
          const blob = await fetchBlob(photo.link, photo.filename);
          zip.file(photo.filename, blob);
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipName = `${album.name || "album"}_${album.photos.length}.zip`;
        saveAs(zipBlob, zipName);
      } catch (err) {
        console.error("Error while creating ZIP:", err);
        alert("An error occurred while preparing the ZIP file.");
      } finally {
        setSelectMode(false);
      }
    })();
  }

  async function subscribe(e) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/albums/${albumCode}/subscribe/`, {
        method: "POST",
        credentials: "include", // ensure cookies / session are sent
      });
      const data = await res.json();
      if (res.ok) {
        alert("Subscribed successfully");
      } else {
        alert(`Subscribe failed: ${data.error || data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error while subscribing.");
    }
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
          </div>

          {!selectMode ? (
            <div className="controls">
              <button className="btn" onClick={toggleSelectMode}>
                select Mode
              </button>
              <button className="btn" onClick={downloadAll}>
                Download all
              </button>
              <button className="btn" onClick={subscribe}>
                Subscribe
              </button>
              <button className="btn" onClick={deleteAlbum}>
                delete album
              </button>
              <button
                className="btn"
                onClick={() =>
                  document.getElementById("hiddenFileInput").click()
                }
              >
                add to album
              </button>
            </div>
          ) : (
            <div className="controls">
              <button className="btn" onClick={toggleSelectMode}>
                select Mode off
              </button>
              <button className="btn" onClick={selectAll}>
                select all
              </button>
              <button className="btn" onClick={clearSelection}>
                clear selection
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
