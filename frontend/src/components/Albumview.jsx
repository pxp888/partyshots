import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
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
        const res = await api.get(`/albums/${albumCode}/`);
        setAlbum(res.data.album);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlbum();
  }, [albumCode]);

  async function uploadFile(file, username = null) {
    const form = new FormData();
    form.append("file", file);
    // use the albumCode from the surrounding component
    form.append("album", albumCode);

    if (username) {
      form.append("username", username);
    }

    try {
      const response = await api.post("/photos/upload/", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // The server returns a JSON payload with a `photo` field and a
      // `status` string. Update the album state so the UI shows the
      // new photo immediately after a successful upload.
      const newPhoto = response.data?.photo;
      if (newPhoto) {
        setAlbum((prev) => {
          if (!prev) return prev;
          return { ...prev, photos: [...prev.photos, newPhoto] };
        });
      }

      // Forward the whole body to the caller.
      return response.data;
    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg =
        err.response?.data?.error || "Network error while uploading the file.";
      alert(`Upload failed: ${errorMsg}`);
      throw err;
    }
  }

  async function deleteAlbum(e) {
    e.preventDefault();

    if (!album) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the album "${album.name}"?`,
    );
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/albums/${album.code}/delete/`);

      console.log("Deleted:", res.data);
      window.location.href = "/albums";
    } catch (err) {
      console.error("Network error during delete:", err);
      const errorMsg =
        err.response?.data?.error || "Network error while deleting the album.";
      alert(`Delete failed: ${errorMsg}`);
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
      const res = await api.delete("/photos/delete/", {
        data: { ids: selected },
      });

      console.log("Deleted:", res.data);
      // Update the album state by removing the photos whose ids were reported
      const deletedIds = res.data.deleted_ids || [];
      setAlbum((prev) =>
        prev
          ? {
              ...prev,
              photos: prev.photos.filter((p) => !deletedIds.includes(p.id)),
            }
          : prev,
      );
      // Keep only those selections that were not deleted
      setSelected((prev) => prev.filter((id) => !deletedIds.includes(id)));
    } catch (err) {
      console.error("Network error during delete:", err);
      const errorMsg =
        err.response?.data?.error || "Network error while deleting photos.";
      alert(`Delete failed: ${errorMsg}`);
    }
  }

  function selectAll() {
    if (!album?.photos) return;
    const allIds = album.photos.map((p) => p.id);
    setSelected(allIds);
  }

  async function downloadSelected() {
    if (selected.length === 0) return;

    const selectedPhotos = album.photos.filter((p) => selected.includes(p.id));

    if (selectedPhotos.length === 0) {
      alert("No valid photos found for the current selection.");
      return;
    }

    const zip = new JSZip();

    const fetchBlob = async (url, filename) => {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`Failed to fetch ${filename}`);
      return await res.blob();
    };

    try {
      setSelectMode(true);

      for (const photo of selectedPhotos) {
        if (!photo.link) continue;
        const blob = await fetchBlob(photo.link, photo.filename);
        zip.file(photo.filename, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${album.name || "album"}_${selectedPhotos.length}.zip`);
    } catch (err) {
      console.error("Error while creating zip:", err);
      alert("An error occurred while preparing the ZIP file.");
    } finally {
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
          if (!photo.link) continue;
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
      const res = await api.post(`/albums/${albumCode}/subscribe/`);
      alert("Subscribed successfully");
      album.is_subscribed = true;
      setAlbum({ ...album });
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Network error while subscribing.";
      alert(`Subscribe failed: ${errorMsg}`);
    }
  }

  async function unsubscribe(e) {
    e.preventDefault();
    if (!album || !album.code) {
      alert("Album information is missing.");
      return;
    }

    try {
      const res = await api.post(`/albums/${album.code}/unsubscribe/`);
      alert("Unsubscribed successfully");
      album.is_subscribed = false;
      setAlbum({ ...album });
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Network error while unsubscribing.";
      alert(`Unsubscribe failed: ${errorMsg}`);
    }
  }

  console.log(currentUser);
  console.log(album);

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
        <div className="initem">
          <p className="label">subscribed</p>
          <p className="value">{album.is_subscribed ? "yes" : "no"}</p>
        </div>
      </div>

      {currentUser && (
        <div className="controlblock">
          <div className="controls">
            <input
              type="file"
              name="file"
              multiple
              id="hiddenFileInput"
              style={{ display: "none" }}
              onChange={async (e) => {
                const files = e.target.files;
                for (let i = 0; i < files.length; i++) {
                  await uploadFile(files[i]);
                }
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
              {currentUser.username === album.user__username && (
                <button className="btn" onClick={deleteAlbum}>
                  delete album
                </button>
              )}
              {!album.is_subscribed &&
                currentUser.username !== album.user__username && (
                  <button className="btn" onClick={subscribe}>
                    Subscribe
                  </button>
                )}
              {album.is_subscribed && (
                <button className="btn" onClick={unsubscribe}>
                  Unsubscribe
                </button>
              )}
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
