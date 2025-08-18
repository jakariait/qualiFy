import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Info, Warning, CheckCircle } from "@mui/icons-material";
import DOMPurify from "dompurify";

const ExamStartDialog = ({ open, onClose, onConfirm, exam }) => {
  if (!exam) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="exam-start-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="exam-start-dialog-title">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Info color="primary" />
          Confirm Exam Start
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="h5" component="h2" gutterBottom>
          {exam.title}
        </Typography>
        <DialogContentText
          component="div"
          sx={{ mb: 2 }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(exam.description),
          }}
        />

        <Box
          sx={{
            p: 2,
            backgroundColor: "warning.light",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "warning.main",
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
          >
            <Warning color="warning" />
            Please Note
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="You only have one attempt for this exam." />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="The exam will start immediately after you click the 'Start Exam' button." />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Do not close your browser or navigate away while the exam is in progress." />
            </ListItem>
          </List>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          autoFocus
        >
          Start Exam
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExamStartDialog;
