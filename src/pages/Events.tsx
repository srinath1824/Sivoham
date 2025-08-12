import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, RadioGroup, FormControlLabel, Radio, Alert, Tabs, Tab } from '@mui/material';
import { PAST_EVENTS, UPCOMING_EVENTS } from '../config/constants.ts';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Barcode from 'react-barcode';

interface EventType {
  _id: string;
  name: string;
  date: string;
  description: string;
  venue: string;
  location: string;
  imageUrl?: string;
  eventType: string;
}

interface RegistrationType {
  _id: string;
  eventId: EventType;
  registrationId: string;
  registeredId?: string;
  status: 'pending' | 'approved' | 'rejected';
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

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }) +
    ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
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
    setRegisterEvent(event);
    setRegisterOpen(true);
    setRegisterData({
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
    setRegisterError('');
    setRegisterSuccess('');
  };
  const handleRegisterClose = () => {
    setRegisterOpen(false);
    setRegisterEvent(null);
  };

  const handleRegisterChange = (e: any) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
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
                        <TableRow><TableCell colSpan={4}>No upcoming events at this time.</TableCell></TableRow>
                      )}
                      {upcomingEvents.map((event: EventType) => (
                        <TableRow key={event._id}>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{formatDateTime(event.date)}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>{event.name}</TableCell>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{event.description}</TableCell>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{event.venue}</TableCell>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{event.location}</TableCell>
                          <TableCell>
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
                        <TableRow><TableCell colSpan={3}>No past events to display.</TableCell></TableRow>
                      )}
                      {pastEvents.map((event: EventType) => (
                        <TableRow key={event._id}>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>{event.date ? formatDateTime(event.date) : '-'}</TableCell>
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
                      <TableCell>Event</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Venue</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Registration ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {registeredEvents.map((reg: RegistrationType) => (
                      <TableRow key={reg._id}>
                        <TableCell>{reg.eventId?.name}</TableCell>
                        <TableCell>{reg.eventId?.date ? formatDateTime(reg.eventId.date) : '-'}</TableCell>
                        <TableCell>{reg.eventId?.venue}</TableCell>
                        <TableCell>{reg.eventId?.location}</TableCell>
                        <TableCell style={{ fontWeight: 700 }}>
                          {reg.registrationId || reg.registeredId || '-'}
                          {reg.registrationId && (
                            <div style={{ marginTop: 8 }}>
                              <Barcode value={reg.registrationId} width={1.5} height={40} fontSize={12} displayValue={false} />
                            </div>
                          )}
                        </TableCell>
                        <TableCell style={{ color: reg.status === 'approved' ? 'green' : reg.status === 'pending' ? '#b45309' : 'red', fontWeight: 700 }}>
                          {reg.status === 'approved' ? 'Approved' : reg.status === 'pending' ? 'Pending' : 'Rejected'}
                        </TableCell>
                        <TableCell>
                          <div style={{ fontSize: 13 }}>
                            <div><b>Name:</b> {reg.fullName}</div>
                            <div><b>Mobile:</b> {reg.mobile}</div>
                            <div><b>Gender:</b> {reg.gender}</div>
                            <div><b>Age:</b> {reg.age}</div>
                            <div><b>Profession:</b> {reg.profession || '-'}</div>
                            <div><b>Address:</b> {reg.address}</div>
                            <div><b>SKS Level:</b> {reg.sksLevel}</div>
                            <div><b>Miracles:</b> {reg.sksMiracle}</div>
                            <div><b>Other:</b> {reg.otherDetails || '-'}</div>
                            <div><b>For:</b> {reg.forWhom === 'self' ? 'Myself' : 'Someone Else'}</div>
                          </div>
                          {(['fullName','mobile','gender','age','address','sksLevel','sksMiracle','forWhom'].some(f => !reg[f] || reg[f] === '-')) &&
                            <div style={{ color: 'red', fontSize: 11 }}>Warning: Some required fields are missing in this registration.</div>
                          }
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
            <TextField label="Full Name" name="fullName" value={registerData.fullName} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required />
            <TextField label="Mobile" name="mobile" value={registerData.mobile} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required inputProps={{ maxLength: 10 }} />
            <TextField label="Gender" name="gender" value={registerData.gender} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required select>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField label="Age" name="age" value={registerData.age} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required type="number" inputProps={{ min: 1, max: 120 }} />
            <TextField label="Profession (optional)" name="profession" value={registerData.profession} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} />
            <TextField label="Address" name="address" value={registerData.address} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required />
            <TextField label="Which level have you completed in SKS" name="sksLevel" value={registerData.sksLevel} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required select>
              {SKS_LEVELS.map(level => <MenuItem key={level} value={level}>{level}</MenuItem>)}
            </TextField>
            <TextField label="Would you like to share your SKS Miracles" name="sksMiracle" value={registerData.sksMiracle} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} required select>
              {SKS_MIRACLES.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField label="Any other details" name="otherDetails" value={registerData.otherDetails} onChange={handleRegisterChange} fullWidth sx={{ mb: 2 }} multiline minRows={2} />
            <RadioGroup row name="forWhom" value={registerData.forWhom} onChange={handleRegisterChange} sx={{ mb: 2 }}>
              <FormControlLabel value="self" control={<Radio />} label="Registering for Myself" />
              <FormControlLabel value="other" control={<Radio />} label="Registering for Someone Else" />
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRegisterClose} color="inherit">Cancel</Button>
            <Button onClick={handleRegisterSubmit} color="primary" variant="contained" disabled={registerLoading}>{registerLoading ? 'Registering...' : 'Submit'}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </main>
  );
} 