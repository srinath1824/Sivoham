import { Box, Typography, TextField, Button } from '@mui/material';

interface FeedbackSectionProps {
  feedback: string;
  setFeedback: (feedback: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  completed: boolean;
  feedbackSubmitted: boolean;
  sx?: any;
}

export default function FeedbackSection({
  feedback,
  setFeedback,
  submitting,
  onSubmit,
  completed,
  feedbackSubmitted,
  sx
}: FeedbackSectionProps) {
  return (
    <Box sx={{ mt: 3, ...sx }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#b45309', fontWeight: 600 }}>
        Share Your Experience
      </Typography>
      <TextField
        multiline
        rows={4}
        fullWidth
        placeholder="How was your meditation experience today? Share your thoughts..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={onSubmit}
        disabled={submitting || !feedback.trim()}
        sx={{
          background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
          fontWeight: 600
        }}
      >
        {submitting ? 'Submitting...' : feedbackSubmitted ? 'Update Feedback' : 'Submit Feedback'}
      </Button>
    </Box>
  );
}