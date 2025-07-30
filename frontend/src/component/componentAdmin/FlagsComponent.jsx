import React, { useEffect, useState } from "react";
import useFlagStore from "../../store/useFlagStore"; // Import the Zustand store
import {
  Button,
  CircularProgress,
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Skeleton from "react-loading-skeleton";

const FlagsComponent = () => {
  const {
    flags,
    loading,
    error,
    fetchFlags,
    createFlag,
    updateFlag,
    deleteFlag,
  } = useFlagStore();

  const [newFlagName, setNewFlagName] = useState("");
  const [updateFlagName, setUpdateFlagName] = useState("");
  const [updateIsActive, setUpdateIsActive] = useState(true);
  const [selectedFlagId, setSelectedFlagId] = useState(null);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Dialog State
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [flagToDelete, setFlagToDelete] = useState(null);

  // Fetch all flags on component mount
  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  // Handle create flag
  const handleCreateFlag = async () => {
    if (!newFlagName) return;
    try {
      await createFlag({ name: newFlagName, isActive: true });
      setNewFlagName("");
      fetchFlags(); // Re-fetch to get the latest data
      showSnackbar("Flag created successfully!", "success");
    } catch (err) {
      showSnackbar("Failed to create flag", "error");
    }
  };

  // Handle update flag
  const handleUpdateFlag = async () => {
    if (!selectedFlagId || !updateFlagName) return;
    try {
      await updateFlag(selectedFlagId, {
        name: updateFlagName,
        isActive: updateIsActive,
      });
      setUpdateFlagName("");
      setUpdateIsActive(true); // Reset isActive to true after update
      setSelectedFlagId(null); // Reset the selectedFlagId
      fetchFlags(); // Re-fetch to get the latest data
      showSnackbar("Flag updated successfully!", "success");
    } catch (err) {
      showSnackbar("Failed to update flag", "error");
    }
  };

  // Handle delete flag
  const handleDeleteFlag = async () => {
    try {
      await deleteFlag(flagToDelete);
      setOpenDeleteDialog(false); // Close dialog after deletion
      setFlagToDelete(null); // Reset the flagToDelete state
      fetchFlags(); // Re-fetch to get the latest data
      showSnackbar("Flag deleted successfully!", "success");
    } catch (err) {
      showSnackbar("Failed to delete flag", "error");
      setOpenDeleteDialog(false); // Close dialog if deletion fails
    }
  };

  // Show Snackbar function
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Open Delete Confirmation Dialog
  const openDeleteConfirmation = (id) => {
    setFlagToDelete(id);
    setOpenDeleteDialog(true);
  };

  // Close Delete Confirmation Dialog
  const closeDeleteConfirmation = () => {
    setOpenDeleteDialog(false);
    setFlagToDelete(null);
  };

  // Handle select flag for update
  const handleSelectFlagForUpdate = (id, name, isActive) => {
    setSelectedFlagId(id);
    setUpdateFlagName(name);
    setUpdateIsActive(isActive); // Set the current isActive status for the selected flag
  };

  return (
    <Box className="p-4 shadow rounded-lg">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold ">
        Flags Management
      </h1>
      {/* Loading Skeleton */}
      {loading ? (
        <>
          <div className={"grid grid-cols-2 gap-10"}>
            <Skeleton height={50} width={"100%"} />
            <Skeleton height={50} width={"100%"} />
          </div>
          <div className={"grid grid-cols-2 gap-10 mt-4 mb-4"}>
            <Skeleton height={50} width={"100%"} />
            <Skeleton height={50} width={"100%"} />
          </div>
          <Skeleton height={100} width={"100%"} className={"mb-4"} />
          <Skeleton height={100} width={"100%"} className={"mb-4"} />
          <Skeleton height={100} width={"100%"} className={"mb-4"} />
          <Skeleton height={100} width={"100%"} className={"mb-4"} />
        </>
      ) : (
        <>
          {/* Error */}
          {error && <Typography color="error">Error: {error}</Typography>}

          {/* Create Flag */}
          <Box className="my-4 grid grid-cols-2 gap-20 space-x-2">
            <TextField
              label="Enter Flag Name"
              variant="outlined"
              value={newFlagName}
              onChange={(e) => setNewFlagName(e.target.value)}
              fullWidth
              className="rounded-md"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateFlag}
              className="ml-2"
            >
              Create Flag
            </Button>
          </Box>

          {/* Update Flag */}
          {selectedFlagId && (
            <Box className="my-4">
              <TextField
                label="Update Flag Name"
                variant="outlined"
                value={updateFlagName}
                onChange={(e) => setUpdateFlagName(e.target.value)}
                fullWidth
                className="rounded-md"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={updateIsActive}
                    onChange={(e) => setUpdateIsActive(e.target.checked)}
                    color="primary"
                  />
                }
                label="Active"
                className="mt-2"
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleUpdateFlag}
                className="mt-2"
              >
                Update Flag
              </Button>
            </Box>
          )}

          {/* Flags List */}
          <Box className="space-y-4">
            {Array.isArray(flags) && flags.length > 0 ? (
              flags.map((flag) => (
                <Box
                  key={flag._id}
                  className="flex justify-between bg-gray-100 items-center p-4 rounded-md"
                >
                  <Box>
                    <Typography variant="body1" className="font-medium">
                      {flag.name} ({flag.isActive ? "Active" : "Inactive"})
                    </Typography>
                  </Box>
                  <Box className="flex items-center justify-center lg:gap-10">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() =>
                        handleSelectFlagForUpdate(
                          flag._id,
                          flag.name,
                          flag.isActive,
                        )
                      }
                      className="mr-2"
                    >
                      Update
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => openDeleteConfirmation(flag._id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography>No flags available</Typography>
            )}
          </Box>

          {/* Delete Confirmation Dialog */}
          <Dialog open={openDeleteDialog} onClose={closeDeleteConfirmation}>
            <DialogTitle>Delete Flag</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this flag?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDeleteConfirmation} color="primary">
                Cancel
              </Button>
              <Button
                onClick={handleDeleteFlag}
                color="secondary"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={() => setOpenSnackbar(false)}
            message={snackbarMessage}
            severity={snackbarSeverity}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{ zIndex: 9999 }}
          />
        </>
      )}
    </Box>
  );
};

export default FlagsComponent;
