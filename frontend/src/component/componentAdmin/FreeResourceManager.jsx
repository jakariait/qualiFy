import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

const API_BASE = `${import.meta.env.VITE_API_URL}/resources`;
const UPLOADS_BASE = `${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads`;

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const FreeResourceManager = ({
  token,
  resources,
  loading,
  refreshResources,
}) => {
  const [message, setMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [editResource, setEditResource] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const showMessage = (msg, severity = "info") => {
    setMessage(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?"))
      return;
    try {
      await axios.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage("Resource deleted successfully!", "success");
      refreshResources();
    } catch (err) {
      console.error(err);
      showMessage("Failed to delete resource", "error");
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setEditResource({ ...editResource, resourceThumbnailImage: file });
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleEditSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editResource.name);
      formData.append("universityName", editResource.universityName);
      if (editResource.resourcePdf instanceof File) {
        formData.append("resourcePdf", editResource.resourcePdf);
      }
      if (editResource.resourceThumbnailImage instanceof File) {
        formData.append(
          "resourceThumbnailImage",
          editResource.resourceThumbnailImage,
        );
      }

      await axios.put(`${API_BASE}/${editResource._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showMessage("Resource updated successfully!", "success");
      setIsDialogOpen(false);
      setThumbnailPreview(null);
      refreshResources();
    } catch (err) {
      console.error(err);
      showMessage("Failed to update resource", "error");
    }
  };

  useEffect(() => {
    if (!isDialogOpen) {
      setEditResource(null);
      setThumbnailPreview(null);
    }
  }, [isDialogOpen]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const universities = ["NSU", "BRAC", "IUB", "AIUB", "EWU"];

  return (
    <div className="p-6 relative">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
        Manage Free Resources
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {resources.map((res) => (
            <div key={res._id} className="rounded-lg shadow p-4 flex flex-col">
              <img
                src={`${UPLOADS_BASE}/${res.resourceThumbnailImage}`}
                alt="Thumbnail"
                className="w-full object-cover rounded mb-3"
              />
              <h2 className="text-lg font-semibold mb-1">{res.name}</h2>
              <p className="mb-2 text-gray-600">
                University: {res.universityName}
              </p>

              <div className="flex justify-between items-center">
                <a
                  href={`${UPLOADS_BASE}/${res.resourcePdf}`}
                  target="_blank"
                  rel="noreferrer"
                  className="primaryTextColor"
                >
                  View PDF
                </a>
                <div className="flex gap-3">
                  <button
                    aria-label="Edit resource"
                    onClick={() => {
                      setEditResource(res);
                      setIsDialogOpen(true);
                      setThumbnailPreview(null);
                    }}
                    className="text-yellow-500 cursor-pointer hover:text-yellow-600"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    aria-label="Delete resource"
                    onClick={() => handleDelete(res._id)}
                    className="text-red-500 cursor-pointer hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Resource</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={editResource?.name || ""}
            onChange={(e) =>
              setEditResource({ ...editResource, name: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="university-label">University</InputLabel>
            <Select
              labelId="university-label"
              value={editResource?.universityName || ""}
              label="University"
              onChange={(e) =>
                setEditResource({
                  ...editResource,
                  universityName: e.target.value,
                })
              }
            >
              <MenuItem value="">
                <em>Select University</em>
              </MenuItem>
              {universities.map((uni) => (
                <MenuItem key={uni} value={uni}>
                  {uni}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="mt-3">
            <InputLabel>Replace PDF (optional)</InputLabel>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setEditResource({
                  ...editResource,
                  resourcePdf: e.target.files[0],
                })
              }
              style={{ marginTop: 8 }}
            />
          </div>

          <div className="mt-3">
            <InputLabel>Replace Thumbnail (optional)</InputLabel>
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                className="w-32 h-32 object-cover rounded mb-2"
              />
            ) : editResource?.resourceThumbnailImage ? (
              <img
                src={`${UPLOADS_BASE}/${editResource.resourceThumbnailImage}`}
                alt="Thumbnail"
                className="w-32 h-32 object-cover rounded mb-2"
              />
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              style={{ marginTop: 8 }}
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FreeResourceManager;
