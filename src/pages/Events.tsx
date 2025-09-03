import { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, RadioGroup, FormControlLabel, Radio, Alert, Tabs, Tab, Snackbar, Card, CardContent, Chip, Pagination, FormControl, InputLabel, Select } from '@mui/material';
import { CalendarToday, LocationOn } from '@mui/icons-material';
import axios from 'axios';
import QRCode from 'qrcode';
import { API_URL } from '../services/api';
import { isFeatureEnabled } from '../config/features';
import JaiGurudevLoader from '../components/JaiGurudevLoader';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

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
  const { t } = useTranslation();
  const { user } = useAuth();
  const { eventFilters, updateEventFilters } = useApp();
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

  const [registerLoading, setRegisterLoading] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<RegistrationType[]>([]);
  const [tab, setTab] = useState(0);
  const [barcodeDialog, setBarcodeDialog] = useState<{ open: boolean; regId: string; qrCode: string }>({ open: false, regId: '', qrCode: '' });
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; registration: RegistrationType | null }>({ open: false, registration: null });
  const [toastOpen, setToastOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState<number>(eventFilters.year);
  const [currentPage, setCurrentPage] = useState(1);

  const [registrationsPerPage] = useState(10);

  const SKS_LEVELS = [
    'Level-5.1', 'Level-5', 'Level-4', 'Level-3', 'Level-2', 'Level-1', 'Not done any Level'
  ];
  const SKS_MIRACLES = [
    'Yes on stage', 'Yes on video', 'Sorry not this time'
  ];

  const fetchRegisteredEvents = async (mobile: string) => {
    try {
      const res = await axios.get(`${API_URL}/event-registrations/user/${mobile}`);
      setRegisteredEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setRegisteredEvents([]);
    }
  };

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/events`);
        setEvents(Array.isArray(res.data) ? res.data : []);
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

  const now = new Date();
  
  // Filter events by year and type
  const { upcomingEvents, pastEvents, availableYears } = useMemo(() => {
    const allEvents = Array.isArray(events) ? events : [];
    const years = [...new Set(allEvents.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a);
    
    const filteredEvents = allEvents.filter(e => new Date(e.date).getFullYear() === yearFilter);
    const upcoming = filteredEvents.filter(e => new Date(e.date) >= now);
    const past = filteredEvents.filter(e => new Date(e.date) < now).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return { upcomingEvents: upcoming, pastEvents: past, availableYears: years };
  }, [events, yearFilter, now]);
  
  // Pagination for registered events
  const paginatedRegisteredEvents = useMemo(() => {
    const sortedEvents = [...registeredEvents].sort((a, b) => new Date(b.eventId?.date || 0).getTime() - new Date(a.eventId?.date || 0).getTime());
    const startIndex = (currentPage - 1) * registrationsPerPage;
    return sortedEvents.slice(startIndex, startIndex + registrationsPerPage);
  }, [registeredEvents, currentPage, registrationsPerPage]);

  const handleRegisterClick = (event: EventType) => {
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
      gender: (user as any)?.gender || '',
      age: (user as any)?.age?.toString() || '',
      profession: (user as any)?.profession || '',
      address: (user as any)?.address || (user as any)?.place || '',
      sksLevel: '',
      sksMiracle: '',
      otherDetails: '',
      forWhom: 'self',
    });
    setRegisterError('');
    
  };

  const handleRegisterClose = () => {
    setRegisterOpen(false);
    setRegisterEvent(null);
  };

  const handleRegisterChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'forWhom') {
      if (value === 'self') {
        setRegisterData({
          ...registerData,
          [name]: value,
          fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
          mobile: user?.mobile || '',
          gender: (user as any)?.gender || '',
          age: (user as any)?.age?.toString() || '',
          profession: (user as any)?.profession || '',
          address: (user as any)?.address || (user as any)?.place || '',
        });
      } else {
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
      const res = await axios.post(`${API_URL}/event-registrations`, payload);
      
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

  return (
    <main className="main-content" style={{ minHeight: 'calc(100vh - 120px)', background: 'linear-gradient(135deg, #fff7f0 0%, #ffeee0 100%)', padding: '2rem 0' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
        {/* Header with Tabs and Filter */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: { xs: 'stretch', md: 'center' }, 
          justifyContent: 'space-between', 
          mb: 4,
          gap: { xs: 2, md: 3 }
        }}>
          {/* Title */}
          <Typography variant="h3" sx={{ 
            fontFamily: 'Lora, serif', 
            color: '#de6b2f', 
            fontWeight: 700, 
            fontSize: { xs: '1.8rem', md: '2.2rem' },
            textAlign: { xs: 'center', md: 'left' },
            flexShrink: 0
          }}>
            🎪 {t('events.title')}
          </Typography>
          
          {/* Tabs */}
          <Tabs 
            value={tab} 
            onChange={(_, v) => setTab(v)} 
            sx={{ 
              '& .MuiTab-root': {
                fontFamily: 'Lora, serif',
                fontWeight: 600,
                fontSize: { xs: '1rem', md: '1.1rem' },
                minWidth: { xs: 'auto', md: 120 }
              },
              '& .MuiTabs-flexContainer': {
                justifyContent: { xs: 'center', md: 'flex-start' }
              },
              flexGrow: 1,
              maxWidth: { xs: '100%', md: 'auto' }
            }}
            centered={false}
          >
            <Tab label={`📅 ${t('events.allEvents')}`} />
            {user && <Tab label={`🎫 ${t('events.myRegistrations')}`} />}
          </Tabs>
          
          {/* Year Filter */}
          <FormControl sx={{ minWidth: 120, flexShrink: 0 }}>
            <InputLabel>{t('events.filterByYear')}</InputLabel>
            <Select
              value={yearFilter}
              label="Filter by Year"
              onChange={(e) => {
                const year = Number(e.target.value);
                setYearFilter(year);
                updateEventFilters({ year });
              }}
              sx={{ borderRadius: 2 }}
            >
              {availableYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {tab === 0 && (
          loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 300px)' }}>
              <JaiGurudevLoader size="medium" />
            </Box>
          ) : (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, minHeight: { md: 'calc(100vh - 300px)' } }}>
            {/* Upcoming Events */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" sx={{ 
                fontFamily: 'Lora, serif', 
                color: '#b45309', 
                fontWeight: 600, 
                mb: 2, 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}>
                <CalendarToday /> {t('events.upcomingEvents')}
              </Typography>
              
              <Box sx={{ flex: 1, overflow: { xs: 'visible', md: 'hidden' } }}>
                {upcomingEvents.length === 0 ? (
                  <Card sx={{ textAlign: 'center', py: 4, background: 'rgba(255,255,255,0.8)', borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#666', fontFamily: 'Lora, serif', fontSize: '1rem' }}>
                      {t('events.noUpcomingEvents')} {yearFilter}
                    </Typography>
                  </Card>
                ) : (
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, 
                    gap: 2,
                    height: '100%',
                    overflowY: 'auto',
                    pr: 1
                  }}>
                    {upcomingEvents.map((event: EventType) => (
                      <Card key={event._id} sx={{ 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(222,107,47,0.15)',
                        background: 'linear-gradient(135deg, #fff 0%, #fff7f0 100%)',
                        border: '1px solid rgba(222,107,47,0.2)',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 20px rgba(222,107,47,0.25)'
                        },
                        height: 'fit-content'
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" sx={{ 
                            fontFamily: 'Lora, serif', 
                            fontWeight: 700, 
                            color: '#de6b2f', 
                            mb: 1.5,
                            fontSize: '1rem'
                          }}>
                            {event.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, color: '#666' }}>
                            <CalendarToday sx={{ fontSize: 14 }} />
                            <Typography sx={{ fontFamily: 'Lora, serif', fontSize: '0.85rem' }}>
                              {formatDateTime(event.date, event.startTime, event.endTime)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, color: '#666' }}>
                            <LocationOn sx={{ fontSize: 14 }} />
                            <Typography sx={{ fontFamily: 'Lora, serif', fontSize: '0.85rem' }}>
                              {event.venue}, {event.location}
                            </Typography>
                          </Box>
                          
                          <Typography sx={{ 
                            fontFamily: 'Lora, serif', 
                            color: '#555', 
                            mb: 2,
                            fontSize: '0.8rem',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {event.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                              label={event.eventType} 
                              size="small"
                              sx={{ 
                                background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
                                color: 'white',
                                fontFamily: 'Lora, serif',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }} 
                            />
                            
                            {(() => {
                              const isRegistrationClosed = event.registrationDeadline && new Date() > new Date(event.registrationDeadline);
                              if (isRegistrationClosed) {
                                return (
                                  <Typography sx={{ color: 'red', fontWeight: 600, fontSize: '0.75rem' }}>
                                    {t('events.closed')}
                                  </Typography>
                                );
                              }
                              return (
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => {
                                    if (!isFeatureEnabled('login')) {
                                      alert(t('events.contactAdmin'));
                                      return;
                                    }
                                    if (!user) {
                                      alert(t('events.loginRequired'));
                                      return;
                                    }
                                    handleRegisterClick(event);
                                  }}
                                  sx={{ 
                                    background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
                                    fontFamily: 'Lora, serif',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    px: 2
                                  }}
                                >
                                  {t('events.register')}
                                </Button>
                              );
                            })()} 
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Divider */}
            <Box sx={{ 
              width: { xs: '100%', md: '1px' }, 
              height: { xs: '1px', md: '100%' }, 
              background: 'linear-gradient(90deg, transparent, #de6b2f, transparent)',
              my: { xs: 2, md: 0 },
              mx: { xs: 0, md: 1 }
            }} />

            {/* Past Events */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" sx={{ 
                fontFamily: 'Lora, serif', 
                color: '#b45309', 
                fontWeight: 600, 
                mb: 2, 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}>
                📚 {t('events.pastEvents')}
              </Typography>
              
              <Box sx={{ flex: 1, overflow: { xs: 'visible', md: 'hidden' } }}>
                {pastEvents.length === 0 ? (
                  <Card sx={{ textAlign: 'center', py: 4, background: 'rgba(255,255,255,0.8)', borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#666', fontFamily: 'Lora, serif', fontSize: '1rem' }}>
                      {t('events.noPastEvents')} {yearFilter}
                    </Typography>
                  </Card>
                ) : (
                  <TableContainer component={Paper} sx={{ 
                    borderRadius: 3, 
                    boxShadow: '0 2px 12px rgba(222,107,47,0.15)',
                    background: 'rgba(255,255,255,0.95)',
                    height: { xs: 'auto', md: '100%' },
                    overflow: 'auto'
                  }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: 'white', fontFamily: 'Lora, serif', background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)', fontSize: '0.85rem' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'white', fontFamily: 'Lora, serif', background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)', fontSize: '0.85rem' }}>Event</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'white', fontFamily: 'Lora, serif', background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)', fontSize: '0.85rem', display: { xs: 'none', md: 'table-cell' } }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'white', fontFamily: 'Lora, serif', background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)', fontSize: '0.85rem' }}>Venue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pastEvents.map((event: EventType) => (
                          <TableRow key={event._id} sx={{ '&:hover': { backgroundColor: '#fff7f0' } }}>
                            <TableCell sx={{ fontFamily: 'Lora, serif', fontSize: '0.8rem', py: 1 }}>
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '0.85rem', py: 1 }}>
                              {event.name}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'Lora, serif', fontSize: '0.8rem', py: 1, display: { xs: 'none', md: 'table-cell' } }}>
                              {event.description.length > 50 ? `${event.description.substring(0, 50)}...` : event.description}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'Lora, serif', fontSize: '0.8rem', py: 1 }}>
                              {event.venue}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Box>
          </Box>
          )
        )}

        {user && tab === 1 && (
          <Box>
            {registeredEvents.length === 0 ? (
              <Card sx={{ textAlign: 'center', py: 6, background: 'rgba(255,255,255,0.8)', borderRadius: 3 }}>
                <Typography sx={{ color: '#666', fontFamily: 'Lora, serif', fontSize: '1.1rem' }}>
                  No event registrations found
                </Typography>
              </Card>
            ) : (
              <>
                <TableContainer component={Paper} sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 4px 20px rgba(222,107,47,0.15)',
                  background: 'rgba(255,255,255,0.95)',
                  mb: 3
                }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)' }}>
                        <TableCell sx={{ fontWeight: 700, color: 'white', fontFamily: 'Lora, serif' }}>Event</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'white', fontFamily: 'Lora, serif' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'white', fontFamily: 'Lora, serif' }}>Venue</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'white', fontFamily: 'Lora, serif' }}>Registration ID</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'white', fontFamily: 'Lora, serif' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'white', fontFamily: 'Lora, serif' }}>Attendance</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'white', fontFamily: 'Lora, serif' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRegisteredEvents.map((reg: RegistrationType) => (
                        <TableRow key={reg._id} sx={{ '&:hover': { backgroundColor: '#fff7f0' } }}>
                          <TableCell sx={{ fontWeight: 600, color: '#de6b2f', fontFamily: 'Lora, serif' }}>
                            {reg.eventId?.name}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>
                            {reg.eventId?.date ? formatDateTime(reg.eventId.date, reg.eventId.startTime, reg.eventId.endTime) : '-'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Lora, serif' }}>
                            {reg.eventId?.venue}, {reg.eventId?.location}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Chip 
                                label={reg.registrationId || reg.registeredId || '-'}
                                size="small"
                                sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                              />
                              {reg.status === 'approved' && reg.registrationId && (
                                <Button 
                                  size="small" 
                                  variant="outlined" 
                                  onClick={() => handleShowBarcode(reg.registrationId)}
                                  sx={{ 
                                    fontSize: '0.7rem', 
                                    py: 0.5, 
                                    borderColor: '#de6b2f',
                                    color: '#de6b2f'
                                  }}
                                >
                                  📱 QR Code
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={reg.status === 'approved' ? '✅ Approved' : reg.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                              color={reg.status === 'approved' ? 'success' : reg.status === 'pending' ? 'warning' : 'error'}
                              size="small"
                              sx={{ fontFamily: 'Lora, serif', fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={reg.attended ? '✅ Attended' : '⏸️ Not Attended'}
                              color={reg.attended ? 'success' : 'default'}
                              size="small"
                              sx={{ fontFamily: 'Lora, serif', fontWeight: 600 }}
                            />
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
                              👁️ Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Pagination */}
                {registeredEvents.length > registrationsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination 
                      count={Math.ceil(registeredEvents.length / registrationsPerPage)}
                      page={currentPage}
                      onChange={(_, page) => setCurrentPage(page)}
                      color="primary"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontFamily: 'Lora, serif',
                          fontWeight: 600
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        )}

        {/* Registration Dialog */}
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

        {/* QR Code Dialog */}
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

        {/* Details Dialog */}
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

        {/* Toast */}
        <Snackbar
          open={toastOpen}
          autoHideDuration={4000}
          onClose={() => setToastOpen(false)}
          message={t('events.alreadyRegistered')}
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

