import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

export default function SortableSubjectItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: "relative",
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          position: "absolute",
          left: -28,
          top: 16,
          cursor: "grab",
          color: "text.disabled",
          "&:active": { cursor: "grabbing" },
          zIndex: 1,
          touchAction: "none",
        }}
      >
        <DragIndicatorIcon />
      </Box>
      {children}
    </Box>
  );
}
