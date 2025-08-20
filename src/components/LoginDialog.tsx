import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Alert, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { login as apiLogin, checkMobileRegistered } from '../services/api.ts';

// Custom theme to match application styling
const theme = createTheme({
  palette: {
    primary: {
      main: '#de6b2f',
      dark: '#b45309',
    },
    secondary: {
      main: '#b794f4',
    },
    background: {
      default: '#fff7f0',
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#7a7a7a',
    },
  },
  typography: {
    fontFamily: 'Lora, serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.7rem',
            backgroundColor: '#fff',
            fontFamily: 'Lora, serif',
            '& fieldset': {
              borderColor: '#f3e5d8',
            },
            '&:hover fieldset': {
              borderColor: '#de6b2f',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#de6b2f',
            },
          },
          '& .MuiInputLabel-root': {
            fontFamily: 'Lora, serif',
            color: '#7a7a7a',
            '&.Mui-focused': {
              color: '#de6b2f',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Lora, serif',
          fontWeight: 600,
          borderRadius: '0.7rem',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 0 16px rgba(222, 107, 47, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #b45309 0%, #de6b2f 100%)',
          },
        },
        outlined: {
          borderColor: '#de6b2f',
          color: '#de6b2f',
          '&:hover': {
            borderColor: '#b45309',
            backgroundColor: 'rgba(222, 107, 47, 0.04)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '1.5rem',
          boxShadow: '0 8px 32px rgba(222, 107, 47, 0.12)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: 'Lora, serif',
          fontWeight: 700,
          color: '#de6b2f',
          fontSize: '1.5rem',
        },
      },
    },
  },
});

export default function LoginDialog({ open, onClose, onLoginSuccess, onRegisterClick }: { open: boolean, onClose: () => void, onLoginSuccess: (user: any, token: string) => void, onRegisterClick?: () => void }) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  React.useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const handleSendOtp = async () => {
    setError('');
    setShowRegister(false);
    if (!/^[1-9][0-9]{9}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number (not starting with 0).');
      return;
    }
    setLoading(true);
    try {
      const res = await checkMobileRegistered(mobile);
      if (!res.exists) {
        setError('Mobile number not found. Please register to continue.');
        setShowRegister(true);
        setLoading(false);
        return;
      }
      if (res.isRejected) {
        setError('Your registration was rejected. Please contact support or try registering again.');
        setShowRegister(true);
        setLoading(false);
        return;
      }
      setStep('otp');
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || 'Failed to verify mobile number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    if (otp !== '123456') {
      setError('Invalid OTP. Please enter 123456 for demo.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiLogin(mobile, otp);
      onLoginSuccess(res.user, res.token);
      setMobile('');
      setOtp('');
      setStep('mobile');
      setShowRegister(false);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp('');
    setResendTimer(30);
    // In real app, trigger OTP resend API here
  };

  const handleRegisterClick = () => {
    if (onRegisterClick) onRegisterClick();
    else window.location.href = '/join';
  };

  const handleClose = () => {
    setMobile('');
    setOtp('');
    setStep('mobile');
    setError('');
    setShowRegister(false);
    setResendTimer(0);
    onClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="xs" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            background: '#fff',
            padding: '1rem',
            maxWidth: '400px',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1,
          px: 0
        }}>
          Login
          <IconButton 
            aria-label="close" 
            onClick={handleClose} 
            sx={{ 
              ml: 2,
              color: '#de6b2f',
              '&:hover': {
                backgroundColor: 'rgba(222, 107, 47, 0.04)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, px: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {step === 'mobile' ? (
              <>
                <TextField
                  label="Mobile Number"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  fullWidth
                  inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
                  disabled={loading}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'Lora, serif',
                      fontSize: '1.05rem'
                    }
                  }}
                />
                {loading && (
                  <Box sx={{ 
                    textAlign: 'center',
                    color: '#7a7a7a',
                    fontFamily: 'Lora, serif',
                    fontStyle: 'italic'
                  }}>
                    Verifying...
                  </Box>
                )}
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      borderRadius: '0.7rem',
                      fontFamily: 'Lora, serif'
                    }}
                  >
                    {error}
                  </Alert>
                )}
                {showRegister && (
                  <Button 
                    onClick={handleRegisterClick} 
                    color="secondary" 
                    variant="outlined"
                    sx={{
                      py: 1.5,
                      fontSize: '1.05rem',
                      fontFamily: 'Lora, serif',
                      fontWeight: 600,
                      letterSpacing: '0.5px'
                    }}
                  >
                    Register
                  </Button>
                )}
              </>
            ) : (
              <>
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: '0.7rem',
                    fontFamily: 'Lora, serif'
                  }}
                >
                  OTP sent to {mobile}. (Use 123456 for demo)
                </Alert>
                <TextField
                  label="OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  fullWidth
                  inputProps={{ maxLength: 6 }}
                  inputRef={otpInputRef}
                  disabled={loading}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'Lora, serif',
                      fontSize: '1.05rem',
                      textAlign: 'center',
                      letterSpacing: '0.5rem'
                    }
                  }}
                />
                {loading && (
                  <Box sx={{ 
                    textAlign: 'center',
                    color: '#7a7a7a',
                    fontFamily: 'Lora, serif',
                    fontStyle: 'italic'
                  }}>
                    Verifying...
                  </Box>
                )}
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      borderRadius: '0.7rem',
                      fontFamily: 'Lora, serif'
                    }}
                  >
                    {error}
                  </Alert>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    onClick={handleResendOtp} 
                    color="primary" 
                    variant="text" 
                    disabled={resendTimer > 0}
                    sx={{
                      fontFamily: 'Lora, serif',
                      fontWeight: 500,
                      textDecoration: 'underline'
                    }}
                  >
                    Resend OTP{resendTimer > 0 ? ` (${resendTimer}s)` : ''}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 0, pb: 0, gap: 2 }}>
          <Button 
            onClick={handleClose} 
            color="inherit"
            variant="outlined"
            sx={{
              flex: 1,
              py: 1.5,
              fontSize: '1.05rem',
              fontFamily: 'Lora, serif',
              fontWeight: 600,
              color: '#7a7a7a',
              borderColor: '#f3e5d8',
              '&:hover': {
                borderColor: '#de6b2f',
                backgroundColor: 'rgba(222, 107, 47, 0.04)',
              }
            }}
          >
            Cancel
          </Button>
          {step === 'mobile' ? (
            <Button 
              onClick={handleSendOtp} 
              color="primary" 
              variant="contained" 
              disabled={loading || !/^[1-9][0-9]{9}$/.test(mobile)}
              sx={{
                flex: 1,
                py: 1.5,
                fontSize: '1.05rem',
                fontFamily: 'Lora, serif',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              {loading ? 'Verifying...' : 'Send OTP'}
            </Button>
          ) : (
            <Button 
              onClick={handleVerify} 
              color="primary" 
              variant="contained" 
              disabled={loading || !otp}
              sx={{
                flex: 1,
                py: 1.5,
                fontSize: '1.05rem',
                fontFamily: 'Lora, serif',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
} 