import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { login as apiLogin, checkMobileRegistered } from '../services/api.ts';

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
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Login
        <IconButton aria-label="close" onClick={handleClose} sx={{ ml: 2 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {step === 'mobile' ? (
            <>
              <input
                type="text"
                placeholder="Mobile Number"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
                maxLength={10}
                disabled={loading}
              />
              {loading && <Box sx={{ textAlign: 'center' }}><span>Verifying...</span></Box>}
              {error && <Alert severity="error">{error}</Alert>}
              {showRegister && (
                <Button onClick={handleRegisterClick} color="secondary" variant="outlined">Register</Button>
              )}
            </>
          ) : (
            <>
              <Alert severity="info">OTP sent to {mobile}. (Use 123456 for demo)</Alert>
              <input
                type="text"
                placeholder="OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
                maxLength={6}
                ref={otpInputRef}
                disabled={loading}
              />
              {loading && <Box sx={{ textAlign: 'center' }}><span>Verifying...</span></Box>}
              {error && <Alert severity="error">{error}</Alert>}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button onClick={handleResendOtp} color="primary" variant="text" disabled={resendTimer > 0}>
                  Resend OTP{resendTimer > 0 ? ` (${resendTimer}s)` : ''}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">Cancel</Button>
        {step === 'mobile' ? (
          <Button onClick={handleSendOtp} color="primary" variant="contained" disabled={loading || !/^[1-9][0-9]{9}$/.test(mobile)}>
            {loading ? 'Verifying...' : 'Send OTP'}
          </Button>
        ) : (
          <Button onClick={handleVerify} color="primary" variant="contained" disabled={loading || !otp}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 