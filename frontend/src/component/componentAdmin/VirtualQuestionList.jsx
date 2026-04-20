import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, Typography, Chip, IconButton } from "@mui/material";
import { Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import SortableQuestionItem from "./SortableQuestionItem.jsx";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, "").trim();

export default function VirtualQuestionList({ questions, expandedSet, onToggle, onRemove, searchFilter }) {
  const parentRef = useRef(null);

  // Build filtered list with original indices
  const filteredItems = questions
    .map((q, originalIndex) => ({ q, originalIndex }))
    .filter(({ q, originalIndex }) => {
      if (expandedSet.has(originalIndex)) return false; // expanded — rendered elsewhere
      if (searchFilter) {
        const text = stripHtml(q.text).toLowerCase();
        return text.includes(searchFilter.toLowerCase());
      }
      return true;
    });

  const sortableIds = filteredItems.map(({ q, originalIndex }) =>
    q._id?.toString() || `temp-${originalIndex}`
  );

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  if (filteredItems.length === 0 && searchFilter) {
    return (
      <Box sx={{ py: 2, color: "text.secondary", fontSize: 14 }}>
        No questions match "{searchFilter}"
      </Box>
    );
  }

  return (
    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
      <Box
        ref={parentRef}
        sx={{ maxHeight: 480, overflowY: "auto", position: "relative" }}
      >
        <Box sx={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const { q, originalIndex } = filteredItems[virtualRow.index];
            const itemId = q._id?.toString() || `temp-${originalIndex}`;
            return (
              <Box
                key={itemId}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <SortableQuestionItem id={itemId}>
                  <Box
                    onClick={() => onToggle(originalIndex)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      py: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 0.5,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                      bgcolor: "background.paper",
                    }}
                  >
                    <ExpandMoreIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    <Typography variant="body2" sx={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Q{originalIndex + 1}: {stripHtml(q.text).slice(0, 80) || "Untitled"}
                    </Typography>
                    <Chip label={q.type} size="small" sx={{ mr: 0.5 }} />
                    <Chip label={`${q.marks}m`} size="small" color="primary" sx={{ mr: 0.5 }} />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => { e.stopPropagation(); onRemove(originalIndex); }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </SortableQuestionItem>
              </Box>
            );
          })}
        </Box>
      </Box>
    </SortableContext>
  );
}
