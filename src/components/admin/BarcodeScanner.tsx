import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Alert, Paper, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Event, Person, Cake, Work, School, CheckCircle, LocationOn, Group, CalendarToday } from '@mui/icons-material';
import { markAttendance, API_URL } from '../../services/api';
import JaiGurudevLoader from '../JaiGurudevLoader';
import axios from 'axios';
import jsQR from 'jsqr';

export default function BarcodeScanner() {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [userDetailsDialog, setUserDetailsDialog] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

  const playSound = (type: 'success' | 'error') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'success') {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else {
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const startScanning = () => {
    setShowCameraDialog(true);
    setScanning(true);
    setIsVideoReady(false);
    setTimeout(() => initializeCamera(), 500);
  };

  const initializeCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      streamRef.current = stream;
      
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(err => {
            setMessage('Video playback failed');
            setMessageType('error');
          });
        }
      }, 100);
      
    } catch (error) {
      setMessage(`Camera error: ${(error as Error).message}`);
      setMessageType('error');
    }
  };

  const startQRScanning = () => {
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && scanning) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');
        
        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            handleMarkAttendance(code.data);
            stopScanning();
          }
        }
      }
    }, 100);
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setScanning(false);
    setShowCameraDialog(false);
    setIsVideoReady(false);
  };

  const handleMarkAttendance = async (registrationId: string) => {
    if (!selectedEvent) {
      setMessage('Please select an event first');
      setMessageType('error');
      return;
    }

    if (!registrationId || typeof registrationId !== 'string' || registrationId.trim().length === 0) {
      setMessage('Invalid registration ID');
      setMessageType('error');
      return;
    }

    try {
      const trimmedId = registrationId.trim();
      const registration = Array.isArray(eventRegistrations) ? eventRegistrations.find(reg => reg.registrationId === trimmedId) : null;
      
      if (!registration) {
        setMessage('❌ Unauthorized: User not registered or approved for this event');
        setMessageType('error');
        setManualCode('');
        playSound('error');
        return;
      }

      // Stop camera when showing user details
      if (scanning) {
        stopScanning();
      }
      
      // Show user details popup
      setUserDetailsDialog({ open: true, user: registration });
      setManualCode('');
      
    } catch (error: any) {
      console.error('Error finding registration:', error);
      setMessage(`❌ Error processing registration`);
      setMessageType('error');
      setManualCode('');
      playSound('error');
    }
  };

  const confirmMarkAttendance = async () => {
    if (!userDetailsDialog.user) return;
    
    try {
      setMessage('Processing...');
      setMessageType('info');
      
      if (userDetailsDialog.user.attended) {
        setMessage('⚠️ User already marked as attended');
        setMessageType('info');
        playSound('error');
        setUserDetailsDialog({ open: false, user: null });
        return;
      }
      
      const response = await markAttendance(userDetailsDialog.user.registrationId);
      
      // Update local state immediately
      setEventRegistrations(prev => 
        prev.map(reg => 
          reg.registrationId === userDetailsDialog.user.registrationId 
            ? { ...reg, attended: true, attendedAt: (response as any).attendedAt || new Date() }
            : reg
        )
      );
      
      setMessage(`✓ ${(response as any).message || 'Attendance marked successfully'}`);
      setMessageType('success');
      playSound('success');
      setUserDetailsDialog({ open: false, user: null });
    } catch (error: any) {
      console.error('Mark attendance error:', error);
      const errorMessage = (error as Error).message || 'Failed to mark attendance';
      setMessage(`❌ ${errorMessage}`);
      setMessageType('error');
      playSound('error');
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      handleMarkAttendance(manualCode);
    }
  };

  useEffect(() => {
    fetchEvents();
    return () => {
      stopScanning();
    };
  }, []);

  // Restore selected event after events are loaded
  useEffect(() => {
    if (events.length > 0) {
      const savedEvent = localStorage.getItem('selectedEvent');
      if (savedEvent && events.find(e => e._id === savedEvent)) {
        setSelectedEvent(savedEvent);
      }
    }
  }, [events]);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventRegistrations();
    }
  }, [selectedEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/events`);
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setMessage('Failed to fetch events');
      setMessageType('error');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEventRegistrations() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/event-registrations/all?limit=1000`, config);
      const registrations = Array.isArray(res.data.registrations) ? res.data.registrations : Array.isArray(res.data) ? res.data : [];
      const filtered = registrations.filter((reg: any) => 
        reg.eventId?._id === selectedEvent && reg.status === 'approved'
      );
      setEventRegistrations(filtered);
    } catch (err) {
      setMessage('Failed to fetch event registrations');
      setMessageType('error');
      setEventRegistrations([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 3, 
          fontFamily: 'Lora, serif', 
          color: '#b45309',
          fontSize: { xs: '1.5rem', md: '2rem' },
          textAlign: { xs: 'center', md: 'left' },
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        Barcode Scanner
      </Typography>

      {message && (
        <Alert severity={messageType} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <JaiGurudevLoader />
        </Box>
      ) : (
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          Event Selection & Scanner
        </Typography>
        
        <TextField
          select
          fullWidth
          label="Select Event"
          value={selectedEvent}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedEvent(value);
            // Persist selected event in localStorage
            if (value) {
              localStorage.setItem('selectedEvent', value);
            } else {
              localStorage.removeItem('selectedEvent');
            }
          }}
          sx={{ mb: 3 }}
        >
          <MenuItem value="">Select an event</MenuItem>
          {Array.isArray(events) && events.map((event) => (
            <MenuItem key={event._id} value={event._id}>
              {event.name} - {event.date ? new Date(event.date).toLocaleDateString() : ''}
            </MenuItem>
          ))}
        </TextField>

        {selectedEvent && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Approved Registrations: {Array.isArray(eventRegistrations) ? eventRegistrations.length : 0}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Attended: {Array.isArray(eventRegistrations) ? eventRegistrations.filter(r => r.attended === true).length : 0}
            </Typography>
          </Box>
        )}
        <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          Camera Scanner
        </Typography>
        
        {!scanning ? (
          <Button 
            variant="contained" 
            onClick={startScanning}
            disabled={!selectedEvent}
            sx={{ 
              mb: 2,
              width: { xs: '100%', sm: 'auto' },
              py: { xs: 1.5, md: 1 }
            }}
          >
            {selectedEvent ? 'Start Camera Scanner' : 'Select Event First'}
          </Button>
        ) : (
          <Button 
            variant="outlined" 
            onClick={stopScanning}
            sx={{ 
              mb: 2,
              width: { xs: '100%', sm: 'auto' },
              py: { xs: 1.5, md: 1 }
            }}
          >
            Stop Scanner
          </Button>
        )}

        <Dialog 
          open={showCameraDialog} 
          onClose={stopScanning}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { minHeight: '500px' }
          }}

        >
          <DialogTitle>QR Code Scanner</DialogTitle>
          <DialogContent>
            <Box sx={{ 
              position: 'relative', 
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              mb: 2
            }}>
              <Box sx={{
                position: 'relative',
                border: '2px solid #de6b2f',
                borderRadius: 2,
                overflow: 'hidden',
                maxWidth: 500
              }}>
                <video
                  ref={videoRef as React.RefObject<HTMLVideoElement>}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => {
                    setIsVideoReady(true);
                    startQRScanning();
                  }}
                  onError={() => {
                    setMessage('Video playback error');
                    setMessageType('error');
                  }}
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    display: 'block',
                    backgroundColor: '#000'
                  }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  height: '60%',
                  border: `2px solid ${isVideoReady ? 'rgba(222, 107, 47, 0.8)' : 'rgba(255, 255, 255, 0.5)'}`,
                  borderRadius: 1,
                  pointerEvents: 'none',
                  animation: isVideoReady ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { borderColor: 'rgba(222, 107, 47, 0.8)' },
                    '50%': { borderColor: 'rgba(222, 107, 47, 0.4)' },
                    '100%': { borderColor: 'rgba(222, 107, 47, 0.8)' }
                  }
                }} />
              </Box>
            </Box>
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#666' }}>
              {isVideoReady ? 'Position the QR code within the frame to scan' : 'Loading camera...'}
            </Typography>
            {isVideoReady && (
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#de6b2f', fontWeight: 600, mt: 1 }}>
                🔍 Scanning for QR codes...
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={stopScanning} variant="outlined">
              Close Scanner
            </Button>
          </DialogActions>
        </Dialog>

        <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          Manual Entry
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2, 
          alignItems: { xs: 'stretch', sm: 'center' }
        }}>
          <TextField
            label="Registration ID"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter registration ID"
            disabled={!selectedEvent}
            sx={{ flex: 1 }}
            fullWidth
          />
          <Button 
            variant="contained" 
            onClick={handleManualSubmit}
            disabled={!manualCode.trim() || !selectedEvent}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              py: { xs: 1.5, md: 1 }
            }}
          >
            Mark Attendance
          </Button>
        </Box>
      </Paper>
      )}

      <Dialog open={userDetailsDialog.open} onClose={() => setUserDetailsDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          fontFamily: 'Lora, serif', 
          color: 'white', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #de6b2f 0%, #b45309 100%)',
          py: 1.5
        }}>
          👤 User Details
        </DialogTitle>
        <DialogContent sx={{ py: 2, background: 'linear-gradient(135deg, #fff7f0 0%, #fff3e0 100%)' }}>
          {userDetailsDialog.user && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#b45309', mb: 1 }}>
                  {userDetailsDialog.user.fullName || 'N/A'}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: { xs: 0.5, sm: 3 }, alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ color: '#25D366', fontWeight: 600 }}>
                    📱 {userDetailsDialog.user.mobile || 'N/A'}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#de6b2f', fontWeight: 600, fontFamily: 'monospace' }}>
                    🆔 {userDetailsDialog.user.registrationId}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Event sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '60px', color: '#666' }}>Event:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{userDetailsDialog.user.eventId?.name || 'N/A'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '60px', color: '#666' }}>Gender:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{userDetailsDialog.user.gender || 'N/A'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Cake sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '60px', color: '#666' }}>Age:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{userDetailsDialog.user.age || 'N/A'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Work sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '60px', color: '#666' }}>Job:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{userDetailsDialog.user.profession || 'N/A'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '60px', color: '#666' }}>SKS:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{userDetailsDialog.user.sksLevel || 'N/A'}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: userDetailsDialog.user.status === 'approved' ? '#2e7d32' : '#ed6c02', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '60px', color: '#666' }}>Status:</Typography>
                      <Typography variant="body2" sx={{ color: userDetailsDialog.user.status === 'approved' ? '#2e7d32' : '#ed6c02', fontWeight: 600, fontSize: '0.85rem' }}>
                        {userDetailsDialog.user.status?.charAt(0).toUpperCase() + userDetailsDialog.user.status?.slice(1)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: userDetailsDialog.user.attended ? '#2e7d32' : '#d32f2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '60px', color: '#666' }}>Attended:</Typography>
                      <Typography variant="body2" sx={{ color: userDetailsDialog.user.attended ? '#2e7d32' : '#d32f2f', fontWeight: 600, fontSize: '0.85rem' }}>
                        {userDetailsDialog.user.attended ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationOn sx={{ color: '#de6b2f', fontSize: '1rem', mt: 0.1 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '60px', color: '#666' }}>Address:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2, fontWeight: 500 }}>{userDetailsDialog.user.address || 'N/A'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Group sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '60px', color: '#666' }}>For:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{userDetailsDialog.user.forWhom === 'self' ? 'Self' : 'Others'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '60px', color: '#666' }}>Date:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        {userDetailsDialog.user.registeredAt ? new Date(userDetailsDialog.user.registeredAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button 
            onClick={() => setUserDetailsDialog({ open: false, user: null })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmMarkAttendance}
            variant="contained"
            disabled={userDetailsDialog.user?.attended}
            sx={{ 
              background: userDetailsDialog.user?.attended 
                ? '#ccc' 
                : 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
              '&:disabled': { color: '#666' }
            }}
          >
            {userDetailsDialog.user?.attended ? 'Already Attended' : 'Mark Attendance'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

