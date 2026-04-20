import React from "react";
import { Box, Button, CircularProgress, Chip } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SyncIcon from "@mui/icons-material/Sync";
import EditIcon from "@mui/icons-material/Edit";

const STATUS_CONFIG = {
  idle: null,
  dirty: { icon: <EditIcon fontSize="small" />, label: "Unsaved changes", color: "warning" },
  saving: {
    icon: <SyncIcon fontSize="small" sx={{ animation: "spin 1s linear infinite", "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } } }} />,
    label: "Saving…", color: "default",
  },
  saved: { icon: <CheckCircleOutlineIcon fontSize="small" />, label: "Saved", color: "success" },
  error: { icon: <ErrorOutlineIcon fontSize="small" />, label: "Save failed", color: "error" },
};

export default function StickyActionBar({ loading, saveStatus = "idle", isEditing, onSubmit }) {
  const statusConfig = STATUS_CONFIG[saveStatus];

  return (
    <>
      {/* Spacer so content isn't hidden behind the bar */}
      <Box sx={{ height: 68 }} />
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          // Match Tailwind's lg breakpoint (1024px) where the sidebar appears
          "@media (min-width: 1024px)": { left: "252px" },
          bgcolor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(6px)",
          borderTop: "1px solid",
          borderColor: "divider",
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 2,
        }}
      >
        {isEditing && statusConfig && (
          <Chip
            icon={statusConfig.icon}
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
            variant="outlined"
          />
        )}
        <Button
          type="submit"
          form="exam-form"
          variant="contained"
          disabled={loading}
          onClick={onSubmit}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ minWidth: 140 }}
        >
          {loading ? "Saving…" : isEditing ? "Update Exam" : "Create Exam"}
        </Button>
      </Box>
    </>
  );
}
