import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

interface FeedbackSectionProps {
  feedback: string;
  setFeedback: (val: string) => void;
  submitting: boolean;
  completed: boolean;
  onSubmit: () => void;
  feedbackSubmitted: boolean;
  sx?: any;
}

/**
 *
 * @param root0
 * @param root0.feedback
 * @param root0.setFeedback
 * @param root0.submitting
 * @param root0.completed
 * @param root0.onSubmit
 * @param root0.feedbackSubmitted
 * @param root0.sx
 */
const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  feedback,
  setFeedback,
  submitting,
  completed,
  onSubmit,
  feedbackSubmitted,
  sx,
}) => (
  <Box sx={{ mt: 4, ...sx }}>
    <Typography
      variant="h4"
      sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 600, mb: 2 }}
    >
      Feedback (Optional)
    </Typography>
    <TextField
      label="Share your thoughts or questions..."
      value={feedback}
      onChange={(e) => setFeedback(e.target.value)}
      fullWidth
      multiline
      minRows={2}
      variant="outlined"
      sx={{ fontFamily: 'Lora, serif', mb: 2 }}
      InputLabelProps={{ style: { fontFamily: 'Lora, serif' } }}
      InputProps={{ style: { fontFamily: 'Lora, serif' } }}
    />
    {completed && (
      <Typography color="success.main" sx={{ fontWeight: 600, mb: 2, mt: 1 }}>
        Class completed!{' '}
        {feedbackSubmitted ? 'Feedback submitted.' : 'You can submit feedback anytime.'}
      </Typography>
    )}
    <Button
      variant="contained"
      onClick={onSubmit}
      disabled={submitting || !completed || !feedback.trim()}
      sx={{
        background: '#de6b2f',
        fontFamily: 'Lora, serif',
        fontWeight: 600,
        fontSize: '1rem',
        borderRadius: 2,
        boxShadow: 'none',
        '&:hover': { background: '#b45309' },
      }}
    >
      Submit Feedback
    </Button>
  </Box>
);

export default FeedbackSection;
