import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, RadioGroup, FormControlLabel, Radio, Alert, Tabs, Tab, Snackbar } from '@mui/material';
import { PAST_EVENTS, UPCOMING_EVENTS } from '../config/constants.ts';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

interface EventType {
  _id: string;
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  description: string;
  venue: string;
  location: string;
  imageUrl?: string;
  eventType: string;
  registrationDeadline?: string;
}

interface RegistrationType {
  _id: string;
  eventId: EventType;
  registrationId: string;
  registeredId?: string;
  status: 'pending' | 'approved' | 'rejected';
  attended?: boolean;
  fullName: string;
  mobile: string;
  gender: string;
  age: string;
  profession?: string;
  address: string;
  sksLevel: string;
  sksMiracle: string;
  otherDetails?: string;
  forWhom: string;
}

const formatDateTime = (dateStr: string, startTime?: string, endTime?: string) => {
  const date = new Date(dateStr);
  const dateFormatted = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  if (startTime && endTime) {
    return `${dateFormatted} (${startTime} - ${endTime})`;
  } else if (startTime) {
    return `${dateFormatted} at ${startTime}`;
  }
  return dateFormatted;
};

export default function Events() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerEvent, setRegisterEvent] = useState<EventType | null>(null);
  const [registerData, setRegisterData] = useState({
    fullName: '',
    mobile: '',
    gender: '',
    age: '',
    profession: '',
    address: '',
    sksLevel: '',
    sksMiracle: '',
    otherDetails: '',
    forWhom: 'self',
  });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<RegistrationType[]>([]);
  const [tab, setTab] = useState(0);
  const [barcodeDialog, setBarcodeDialog] = useState<{ open: boolean; regId: string; qrCode: string }>({ open: false, regId: '', qrCode: '' });
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; registration: RegistrationType | null }>({ open: false, registration: null });
  const [toastOpen, setToastOpen] = useState(false);

  const SKS_LEVELS = [
    'Level-5.1', 'Level-5', 'Level-4', 'Level-3', 'Level-2', 'Level-1', 'Not done any Level'
  ];
  const SKS_MIRACLES = [
    'Yes on stage', 'Yes on video', 'Sorry not this time'
  ];

  const fetchRegisteredEvents = async (mobile: string) => {
    try {
      const res = await axios.get(`/api/event-registrations/user/${mobile}`);
      setRegisteredEvents(res.data);
    } catch (err) {
      setRegisteredEvents([]);
    }
  };

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await axios.get('/api/events');
        setEvents(res.data);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user && user.mobile) {
      fetchRegisteredEvents(user.mobile);
    }
  }, [user && user.mobile]);

  useEffect(() => {
    async function refreshUser() {
      if (user && user._id && token && user.isSelected === false) {
        try {
          const res = await fetch(`/api/user/${user._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const latest = await res.json();
            if (latest && (latest.isSelected !== user.isSelected || JSON.stringify(latest) !== JSON.stringify(user))) {
              setUser(latest);
              localStorage.setItem('user', JSON.stringify(latest));
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }
    refreshUser();
  }, [user && user._id, token, user && user.isSelected]);

  const handleRegisterClick = (event: EventType) => {
    // Check if user already registered for this event
    const alreadyRegistered = registeredEvents.some(reg => reg.eventId?._id === event._id);
    if (alreadyRegistered) {
      setToastOpen(true);
      return;
    }
    
    setRegisterEvent(event);
    setRegisterOpen(true);
    setRegisterData({
      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      mobile: user?.mobile || '',
      gender: user?.gender || '',
      age: user?.age?.toString() || '',
      profession: user?.profession || '',
      address: user?.address || user?.place || '',
      sksLevel: '',
      sksMiracle: '',
      otherDetails: '',
      forWhom: 'self',
    });
    setRegisterError('');
    setRegisterSuccess('');
  };
  const handleRegisterClose = () => {
    setRegisterOpen(false);
    setRegisterEvent(null);
  };

  const handleRegisterChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'forWhom') {
      if (value === 'self') {
        // Auto-populate with user data
        setRegisterData({
          ...registerData,
          [name]: value,
          fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
          mobile: user?.mobile || '',
          gender: user?.gender || '',
          age: user?.age?.toString() || '',
          profession: user?.profession || '',
          address: user?.address || user?.place || '',
        });
      } else {
        // Clear fields for someone else
        setRegisterData({
          ...registerData,
          [name]: value,
          fullName: '',
          mobile: '',
          gender: '',
          age: '',
          profession: '',
          address: '',
        });
      }
    } else {
      setRegisterData({ ...registerData, [name]: value });
    }
  };

  const validateRegister = () => {
    if (!registerData.fullName.trim()) return 'Full Name is required.';
    if (!/^[0-9]{10}$/.test(registerData.mobile)) return 'Enter a valid 10-digit mobile number.';
    if (!registerData.gender || !registerData.gender.trim()) return 'Gender is required.';
    if (!registerData.age || isNaN(Number(registerData.age)) || String(registerData.age).trim() === '') return 'Age is required.';
    if (!registerData.address.trim()) return 'Address is required.';
    if (!registerData.sksLevel || !registerData.sksLevel.trim()) return 'Please select SKS Level.';
    if (!registerData.sksMiracle || !registerData.sksMiracle.trim()) return 'Please select SKS Miracles sharing option.';
    if (!registerData.forWhom || !registerData.forWhom.trim()) return 'Please select for whom you are registering.';
    return '';
  };
  const handleRegisterSubmit = async () => {
    setRegisterError('');
    setRegisterSuccess('');
    const err = validateRegister();
    if (err) {
      setRegisterError(err);
      return;
    }
    setRegisterLoading(true);
    try {
      const payload = {
        ...registerData,
        eventId: registerEvent?._id,
        profession: registerData.profession && registerData.profession.trim() !== '' ? registerData.profession : null,
        otherDetails: registerData.otherDetails && registerData.otherDetails.trim() !== '' ? registerData.otherDetails : null
      };
      console.log('Submitting registration payload:', payload); // Log payload
      const res = await axios.post('/api/event-registrations', payload);
      setRegisterSuccess(`Registration successful! Your ID: ${res.data.registrationId} (Status: ${res.data.status})`);
      setRegisterOpen(false);
      if (registerData.mobile) fetchRegisteredEvents(registerData.mobile);
    } catch (err: any) {
      setRegisterError(err.response?.data?.error || err.message || 'Failed to register.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleShowBarcode = async (regId: string) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(regId);
      setBarcodeDialog({ open: true, regId, qrCode: qrCodeDataURL });
    } catch (err) {
      alert('Failed to generate barcode');
    }
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pastEvents = events.filter(e => new Date(e.date) < now);

  return (
    <main className="main-content" style={{ minHeight: 'calc(100vh - 120px)', background: '#fff7f0', padding: '2rem 0 2rem 0' }}>
      <Box sx={{ maxWidth: '100%', mx: 'auto', px: { xs: 1, md: 2 }, paddingBottom: 10 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4, justifyContent: 'flex-start' }}>
          <Tab label="Events" />
          {user && <Tab label="Registered Events" />}
        </Tabs>
        {tab === 0 && (
          <Box>
            {/* <Typography variant="h2" sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700, mb: 4, textAlign: 'center' }}>
              Events
            </Typography> */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'stretch',
                position: 'relative',
                gap: { xs: 4, md: 0 },
              }}
            >
              {/* Upcoming Events Table */}
              <Box sx={{ flex: 1, pr: { md: 2, xs: 0 }, mb: { xs: 0, md: 0 } }}>
                <Typography variant="h4" sx={{ fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 600, mb: 2, textAlign: 'center' }}>
                  Upcoming Events
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', height: '100%' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Date & Time</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Event</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Venue</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Location</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upcomingEvents.length === 0 && (
                        <TableRow><TableCell colSpan={6}>No upcoming events at this time.</TableCell></TableRow>
                      )}
                      {upcomingEvents.map((event: EventType) => (
                        <TableRow key={event._id}>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{formatDateTime(event.date, event.startTime, event.endTime)}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>{event.name}</TableCell>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{event.description}</TableCell>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{event.venue}</TableCell>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{event.location}</TableCell>
                          <TableCell>
                            {(() => {
                              const isRegistrationClosed = event.registrationDeadline && new Date() > new Date(event.registrationDeadline);
                              if (isRegistrationClosed) {
                                return (
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ color: 'red', fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>
                                      Registrations Closed
                                    </Typography>
                                    <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>
                                      For queries reach admin
                                    </Typography>
                                  </Box>
                                );
                              }
                              return (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() => {
                                    if (!user) {
                                      alert('Please log in to register for events.');
                                      return;
                                    }
                                    handleRegisterClick(event);
                                  }}
                                  sx={{ fontWeight: 700, fontFamily: 'Lora, serif', background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)', borderRadius: 2 }}
                                >
                                  Register
                                </Button>
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              {/* Vertical Divider for desktop only */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  width: '1px',
                  background: '#e0e0e0',
                  mx: 0,
                  my: 2,
                  height: 'auto',
                  minHeight: 400,
                  alignSelf: 'stretch',
                }}
              />
              {/* Past Events Table */}
              <Box sx={{ flex: 1, pl: { md: 2, xs: 0 } }}>
                <Typography variant="h4" sx={{ fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 600, mb: 2, textAlign: 'center' }}>
                  Past Events
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', height: '100%' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Date & Time</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Event</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Venue</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Location</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pastEvents.length === 0 && (
                        <TableRow><TableCell colSpan={5}>No past events to display.</TableCell></TableRow>
                      )}
                      {pastEvents.map((event: EventType) => (
                        <TableRow key={event._id}>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{event.date ? formatDateTime(event.date, event.startTime, event.endTime) : '-'}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>{event.name}</TableCell>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{event.description}</TableCell>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{event.venue}</TableCell>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{event.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Box>
        )}
        {user && tab === 1 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h4" sx={{ fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 600, mb: 2, textAlign: 'center' }}>
              Registered Events
            </Typography>
            {registeredEvents.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: '#888', fontFamily: 'Lora, serif' }}>No event registrations found.</Typography>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Event</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Venue</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Registration ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Attendance</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#b45309', fontFamily: 'Lora, serif' }}>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {registeredEvents.map((reg: RegistrationType) => (
                      <TableRow key={reg._id}>
                        <TableCell sx={{ fontWeight: 600, color: '#de6b2f', fontFamily: 'Lora, serif' }}>{reg.eventId?.name}</TableCell>
                        <TableCell sx={{ fontFamily: 'Lora, serif' }}>{reg.eventId?.date ? formatDateTime(reg.eventId.date, reg.eventId.startTime, reg.eventId.endTime) : '-'}</TableCell>
                        <TableCell sx={{ fontFamily: 'Lora, serif' }}>{reg.eventId?.venue}</TableCell>
                        <TableCell sx={{ fontFamily: 'Lora, serif' }}>{reg.eventId?.location}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                              {reg.registrationId || reg.registeredId || '-'}
                            </Typography>
                            {reg.status === 'approved' && reg.registrationId && (
                              <Button 
                                size="small" 
                                variant="outlined" 
                                onClick={() => handleShowBarcode(reg.registrationId)}
                                sx={{ fontSize: '0.7rem', py: 0.5, alignSelf: 'flex-start' }}
                              >
                                Show QR Code
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: reg.status === 'approved' ? 'green' : reg.status === 'pending' ? '#b45309' : 'red', fontWeight: 700, fontFamily: 'Lora, serif' }}>
                          {reg.status === 'approved' ? 'Approved' : reg.status === 'pending' ? 'Pending' : 'Rejected'}
                        </TableCell>
                        <TableCell sx={{ color: reg.attended ? 'green' : '#888', fontWeight: 700, fontFamily: 'Lora, serif' }}>
                          {reg.attended ? '✓ Attended' : 'Not Attended'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setDetailsDialog({ open: true, registration: reg })}
                            sx={{ 
                              fontSize: '0.8rem',
                              fontFamily: 'Lora, serif',
                              borderColor: '#de6b2f',
                              color: '#de6b2f',
                              '&:hover': {
                                borderColor: '#b45309',
                                backgroundColor: '#fff3e0'
                              }
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
        <Dialog open={registerOpen} onClose={handleRegisterClose} maxWidth="sm" fullWidth>
          <DialogTitle>Event Registration</DialogTitle>
          <DialogContent>
            {registerError && <Alert severity="error" sx={{ mb: 2 }}>{registerError}</Alert>}
            <RadioGroup row name="forWhom" value={registerData.forWhom} onChange={handleRegisterChange} sx={{ mb: 3, justifyContent: 'center' }}>
              <FormControlLabel value="self" control={<Radio />} label="Registering for Myself" />
              <FormControlLabel value="other" control={<Radio />} label="Registering for Someone Else" />
            </RadioGroup>
            <TextField label="Full Name" name="fullName" value={registerData.fullName} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required disabled={registerData.forWhom === 'self'} />
            <TextField label="Mobile" name="mobile" value={registerData.mobile} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required inputProps={{ maxLength: 10 }} disabled={registerData.forWhom === 'self'} />
            <TextField label="Gender" name="gender" value={registerData.gender} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required select disabled={registerData.forWhom === 'self'}>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField label="Age" name="age" value={registerData.age} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required type="number" inputProps={{ min: 1, max: 120 }} disabled={registerData.forWhom === 'self'} />
            <TextField label="Profession (optional)" name="profession" value={registerData.profession} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} disabled={registerData.forWhom === 'self'} />
            <TextField label="Address" name="address" value={registerData.address} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required disabled={registerData.forWhom === 'self'} />
            <TextField label="Which level have you completed in SKS" name="sksLevel" value={registerData.sksLevel} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required select>
              {SKS_LEVELS.map(level => <MenuItem key={level} value={level}>{level}</MenuItem>)}
            </TextField>
            <TextField label="Would you like to share your SKS Miracles" name="sksMiracle" value={registerData.sksMiracle} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required select>
              {SKS_MIRACLES.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField label="Any other details" name="otherDetails" value={registerData.otherDetails} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} multiline minRows={2} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRegisterClose} color="inherit">Cancel</Button>
            <Button onClick={handleRegisterSubmit} color="primary" variant="contained" disabled={registerLoading}>{registerLoading ? 'Registering...' : 'Submit'}</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={barcodeDialog.open} onClose={() => setBarcodeDialog({ open: false, regId: '', qrCode: '' })} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', fontFamily: 'Lora, serif', color: '#de6b2f' }}>
            Registration QR Code
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Inter, sans-serif' }}>
              Registration ID: {barcodeDialog.regId}
            </Typography>
            {barcodeDialog.qrCode && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <img 
                  src={barcodeDialog.qrCode} 
                  alt="Registration QR Code" 
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              onClick={() => setBarcodeDialog({ open: false, regId: '', qrCode: '' })}
              variant="contained"
              sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)' }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, registration: null })} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontFamily: 'Lora, serif', color: '#de6b2f' }}>
            Registration Details
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            {detailsDialog.registration && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box><strong>Full Name:</strong> {detailsDialog.registration.fullName}</Box>
                <Box><strong>Mobile:</strong> {detailsDialog.registration.mobile}</Box>
                <Box><strong>Gender:</strong> {detailsDialog.registration.gender}</Box>
                <Box><strong>Age:</strong> {detailsDialog.registration.age}</Box>
                <Box><strong>Profession:</strong> {detailsDialog.registration.profession || '-'}</Box>
                <Box><strong>Address:</strong> {detailsDialog.registration.address}</Box>
                <Box><strong>SKS Level:</strong> {detailsDialog.registration.sksLevel}</Box>
                <Box><strong>SKS Miracles:</strong> {detailsDialog.registration.sksMiracle}</Box>
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}><strong>Other Details:</strong> {detailsDialog.registration.otherDetails || '-'}</Box>
                <Box><strong>Registering For:</strong> {detailsDialog.registration.forWhom === 'self' ? 'Myself' : 'Someone Else'}</Box>
                <Box><strong>Registration ID:</strong> {detailsDialog.registration.registrationId || detailsDialog.registration.registeredId || '-'}</Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDetailsDialog({ open: false, registration: null })}
              variant="contained"
              sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)' }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toastOpen}
          autoHideDuration={4000}
          onClose={() => setToastOpen(false)}
          message="You have already registered for this event"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              backgroundColor: '#de6b2f',
              color: 'white',
              fontFamily: 'Lora, serif',
              fontWeight: 600,
              borderRadius: 2
            }
          }}
        />
      </Box>
    </main>
  );
} 