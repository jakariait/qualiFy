import React, { useState, lazy, Suspense } from "react";
import { Box, TextField, ToggleButton, ToggleButtonGroup, Tooltip, CircularProgress } from "@mui/material";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import CodeIcon from "@mui/icons-material/Code";
import { Editor } from "primereact/editor";

const QuestionEditorWithLatex = lazy(() => import("../QuestionEditorWithLatex.jsx"));

const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

const STORAGE_PREFIX = "editorPref_";

function getSavedMode(storageKey) {
  if (!storageKey) return "plain";
  return localStorage.getItem(STORAGE_PREFIX + storageKey) || "plain";
}

function saveMode(storageKey, mode) {
  if (!storageKey) return;
  localStorage.setItem(STORAGE_PREFIX + storageKey, mode);
}

export default function SwitchableEditor({
  value,
  onChange,
  placeholder,
  height = 160,
  useLatex = false,
  minRows = 4,
  storageKey,   // e.g. "examDescription", "questionText", "questionOption", "questionSolution"
}) {
  const [mode, setMode] = useState(() => getSavedMode(storageKey));

  const handleModeChange = (_, newMode) => {
    if (!newMode) return;
    if (newMode === "plain") {
      onChange(stripHtml(value));
    }
    setMode(newMode);
    saveMode(storageKey, newMode);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.5 }}>
        <ToggleButtonGroup value={mode} exclusive onChange={handleModeChange} size="small">
          <Tooltip title="Plain text">
            <ToggleButton value="plain">
              <TextFieldsIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Rich text editor">
            <ToggleButton value="rich">
              <CodeIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>

      {mode === "plain" ? (
        <TextField
          multiline
          fullWidth
          minRows={minRows}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          variant="outlined"
          sx={{ "& .MuiInputBase-root": { alignItems: "flex-start" } }}
        />
      ) : useLatex ? (
        <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", p: 2 }}><CircularProgress size={24} /></Box>}>
          <QuestionEditorWithLatex
            value={value || ""}
            onTextChange={(e) => onChange(e.htmlValue || "")}
          />
        </Suspense>
      ) : (
        <Editor
          value={value || ""}
          onTextChange={(e) => onChange(e.htmlValue || "")}
          style={{ height }}
        />
      )}
    </Box>
  );
}
