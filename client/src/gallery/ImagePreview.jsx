// ImagePreview.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "./ConfirmDialog";

const tableStyles = {
  wrapper: { marginTop: 4, maxHeight: 140, overflowY: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 11 },
  th: {
    textAlign: "left",
    padding: "4px 6px",
    background: "#f1f5f9",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: 700,
    color: "#1f2933",
  },
  td: { padding: "4px 6px", borderBottom: "1px solid #e5e7eb", fontSize: 11 },
  link: { textDecoration: "none", color: "#1d4ed8", fontWeight: 500 },
  deleteBtn: {
    padding: "1px 6px",
    fontSize: 11,
    borderRadius: 3,
    border: "1px solid #e53e3e",
    background: "#fff5f5",
    color: "#c53030",
    cursor: "pointer",
    fontWeight: 600,
  },
  empty: { fontSize: 11, color: "#6b7280", marginTop: 4 },
};

const ImagePreview = ({
  images,
  onDeleteImage,
  onImageClick,
  readOnly = false,
  isDsr = false,
}) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [blobUrls, setBlobUrls] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizeImages = (imgs) => {
    const arr = Array.isArray(imgs) ? imgs : imgs ? [imgs] : [];
    return arr.map((img) => {
      if (typeof img === "string") return { url: img, name: null };
      if (typeof img === "object" && img !== null)
        return {
          url: img.url,
          name: img.name || img.originalName || img.fileName,
        };
      return { url: "", name: "Unknown" };
    });
  };

  const imageDisplayArray = normalizeImages(images);

  const dataURItoBlob = (dataURI) => {
    try {
      if (!dataURI.startsWith("data:")) return null;
      const splitData = dataURI.split(",");
      if (splitData.length < 2) return null;
      const byteString = atob(splitData[1]);
      const mimeString = splitData[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const newBlobUrls = {};
    const urlsToRevoke = [];
    imageDisplayArray.forEach((img, index) => {
      if (img.url && img.url.startsWith("data:")) {
        const blob = dataURItoBlob(img.url);
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          newBlobUrls[index] = blobUrl;
          urlsToRevoke.push(blobUrl);
        }
      }
    });
    setBlobUrls((prev) => ({ ...prev, ...newBlobUrls }));
    return () => {
      urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const extractFileName = (imgObj) => {
    try {
      if (imgObj.name) return imgObj.name;
      if (!imgObj.url) return "Unknown file";
      if (imgObj.url.startsWith("data:")) return "Local File";
      const parts = imgObj.url.split("/");
      return decodeURIComponent(parts[parts.length - 1]);
    } catch (error) {
      return "File name unavailable";
    }
  };

  const handleDeleteClick = (index) => {
    setDeleteIndex(index);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (deleteIndex === null) {
      setOpenDeleteDialog(false);
      return;
    }

    const imgObj = imageDisplayArray[deleteIndex];
    const imageUrl = imgObj.url;

    if (imageUrl && imageUrl.startsWith("data:")) {
      onDeleteImage(deleteIndex);
      setOpenDeleteDialog(false);
      setDeleteIndex(null);
      return;
    }

    if (!imageUrl || (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://"))) {
      alert("Cannot delete: Invalid image URL");
      setOpenDeleteDialog(false);
      setDeleteIndex(null);
      return;
    }

    setIsDeleting(true);

    try {
      const key = new URL(imageUrl).pathname.slice(1);

      const response = await fetch(
        `${import.meta.env.VITE_API_STRING}/delete-s3-file`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key }),
        }
      );

      if (response.ok) {
        onDeleteImage(deleteIndex);
        alert("Document deleted successfully!");
      } else {
        alert("Failed to delete document from S3.");
      }
    } catch (error) {
      alert("Error deleting document.");
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false);
      setDeleteIndex(null);
    }
  };

  return (
    <div>
      {imageDisplayArray.length > 0 ? (
        <div style={tableStyles.wrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>File Name</th>
                {!readOnly && <th style={tableStyles.th}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {imageDisplayArray.map((imgObj, index) => {
                const displayUrl = blobUrls[index] || imgObj.url;
                return (
                  <tr key={index}>
                    <td style={tableStyles.td}>
                      {imgObj.url ? (
                        <a
                          href="#"
                          style={tableStyles.link}
                          onClick={(e) => {
                            e.preventDefault();
                            if (onImageClick) {
                              onImageClick(index, displayUrl);
                            }
                          }}
                        >
                          {extractFileName(imgObj)}
                        </a>
                      ) : (
                        "Invalid link"
                      )}
                    </td>
                    {!readOnly && (
                      <td style={tableStyles.td}>
                        <button
                          style={tableStyles.deleteBtn}
                          onClick={() => handleDeleteClick(index)}
                          disabled={isDeleting}
                        >
                          {isDeleting && deleteIndex === index ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={tableStyles.empty}>No document uploaded yet.</div>
      )}

      {!readOnly && (
        <ConfirmDialog
          open={openDeleteDialog}
          handleClose={() => {
            setOpenDeleteDialog(false);
            setDeleteIndex(null);
          }}
          handleConfirm={confirmDelete}
          message="Are you sure you want to delete this document?"
        />
      )}
    </div>
  );
};

export default ImagePreview;