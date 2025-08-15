import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Alert, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, TablePagination, Select, MenuItem, FormControl, InputLabel, TextField, Snackbar } from '@mui/material';
import { Person, Phone, Wc, Cake, Work, LocationOn, School, Star, Info, Group, Badge, Event } from '@mui/icons-material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AdminFilters from './AdminFilters.tsx';
import JaiGurudevLoader from '../JaiGurudevLoader.tsx';
import QRCode from 'qrcode';

export default function EventRegistrationsApproval() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editingRegId, setEditingRegId] = useState<string | null>(null);
  const [selectedRegs, setSelectedRegs] = useState<string[]>([]);
  const [barcodeDialog, setBarcodeDialog] = useState<{ open: boolean; regId: string; qrCode: string; registration?: any }>({ open: false, regId: '', qrCode: '' });
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; registration: any | null }>({ open: false, registration: null });
  const [events, setEvents] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedEventTemplate, setSelectedEventTemplate] = useState('');
  const [templateDialog, setTemplateDialog] = useState<{ open: boolean; eventId: string; template: string }>({ open: false, eventId: '', template: '' });
  const [editableTemplate, setEditableTemplate] = useState('');
  const [showToast, setShowToast] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [page, rowsPerPage, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchEvents() {
    try {
      const res = await axios.get('/api/events');
      setEvents(res.data.filter((event: any) => event.eventType === 'limited'));
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
    }
  }

  async function fetchRegistrations() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: rowsPerPage.toString(),
        ...filters
      });
      const res = await axios.get(`/api/event-registrations?${params}`, config);
      setRegistrations(res.data.registrations || res.data);
      setTotalCount(res.data.total || res.data.length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch event registrations');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(regId: string) {
    try {
      await axios.put(`/api/event-registrations/${regId}/approve`, {}, config);
      setEditingRegId(null);
      fetchRegistrations();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to approve registration');
    }
  }

  async function handleReject(regId: string) {
    try {
      await axios.put(`/api/event-registrations/${regId}/reject`, {}, config);
      setEditingRegId(null);
      fetchRegistrations();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to reject registration');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleBulkApprove() {
    if (selectedRegs.length === 0) return;
    if (!window.confirm(`Approve ${selectedRegs.length} selected registrations?`)) return;
    try {
      await axios.post('/api/event-registrations/bulk-approve', { registrationIds: selectedRegs }, config);
      setSelectedRegs([]);
      fetchRegistrations();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to bulk approve registrations');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleBulkReject() {
    if (selectedRegs.length === 0) return;
    if (!window.confirm(`Reject ${selectedRegs.length} selected registrations?`)) return;
    try {
      await axios.post('/api/event-registrations/bulk-reject', { registrationIds: selectedRegs }, config);
      setSelectedRegs([]);
      fetchRegistrations();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to bulk reject registrations');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectReg = (regId: string) => {
    setSelectedRegs(prev => 
      prev.includes(regId) 
        ? prev.filter(id => id !== regId)
        : [...prev, regId]
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectAll = () => {
    const pendingRegs = registrations.filter(reg => reg.status === 'pending');
    setSelectedRegs(
      selectedRegs.length === pendingRegs.length 
        ? [] 
        : pendingRegs.map(reg => reg.registrationId)
    );
  };

  const handleShowBarcode = async (regId: string) => {
    try {
      const registration = registrations.find(reg => reg.registrationId === regId);
      const qrCodeDataURL = await QRCode.toDataURL(regId);
      setBarcodeDialog({ open: true, regId, qrCode: qrCodeDataURL, registration });
    } catch (err) {
      alert('Failed to generate barcode');
    }
  };

  const handleCopyImage = async () => {
    try {
      // Create canvas to combine QR code with user details
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        canvas.width = 400;
        canvas.height = 400;
        
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        
        // Load and draw logo in center of QR code
        const logo = new Image();
        logo.onload = () => {
          // Add event name
          ctx.fillStyle = '#333333';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(barcodeDialog.registration?.eventId?.name || 'N/A', centerX, 30);
          
          // Add event date
          ctx.font = '14px Arial';
          const eventDate = barcodeDialog.registration?.eventId?.date ? 
            new Date(barcodeDialog.registration.eventId.date).toLocaleDateString('en-GB', { 
              day: 'numeric', month: 'short', year: 'numeric' 
            }).replace(/,/g, '') : 'TBD';
          ctx.fillText(eventDate, centerX, 50);
          
          // Draw QR code centered
          const qrSize = 180;
          const qrX = (canvas.width - qrSize) / 2;
          ctx.drawImage(img, qrX, 70, qrSize, qrSize);
          
          // Draw small logo in center of QR code with white background
          const logoSize = 20;
          const logoX = centerX - logoSize/2;
          const logoY = 70 + qrSize/2 - logoSize/2;
          
          // White circular background for logo
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(centerX, 70 + qrSize/2, 15, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          
          // Add user details below QR code
          ctx.fillStyle = '#333333';
          ctx.font = 'bold 16px Arial';
          let y = 280;
          
          ctx.fillText(barcodeDialog.registration?.fullName || 'N/A', centerX, y);
          y += 22;
          ctx.fillText(`📱 ${barcodeDialog.registration?.mobile || 'N/A'}`, centerX, y);
          y += 22;
          ctx.fillText(`🆔 ${barcodeDialog.regId}`, centerX, y);
          
          // Convert to blob and copy
          canvas.toBlob(async (blob) => {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setShowToast(true);
          });
        };
        logo.src = '/images/SKS_Logo_4K-1.png';
      };
      
      img.src = barcodeDialog.qrCode;
    } catch (err) {
      alert('Failed to copy image to clipboard');
    }
  };

  const getWhatsAppMessage = (reg: any) => {
    const eventDate = reg.eventId?.date ? new Date(reg.eventId.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/,/g, '') : 'TBD';
    const selectedEvent = events.find(e => e._id === selectedEventTemplate);
    const template = selectedEvent?.messageTemplate || `*Sivoham* {name} garu🙏,

*Congratulations!*
*Your are selected for "{eventName}" on {eventDate}.*
Your Entry ID: *{registrationId}*
Registrations will start by 8am

{qrCode}*Jai Gurudev* 🙏`;
    
    return template
      .replace(/{name}/g, reg.fullName || 'there')
      .replace(/{eventName}/g, reg.eventId?.name || 'Event')
      .replace(/{eventDate}/g, eventDate)
      .replace(/{registrationId}/g, reg.registrationId)
      .replace(/{qrCode}/g, reg.status === 'approved' ? '📱 Show this QR code at the event for entry.\n\n' : '');
  };

  const handleEditTemplate = (eventId: string) => {
    const event = events.find(e => e._id === eventId);
    const template = event?.messageTemplate || `*Sivoham* {name} garu🙏,

*Congratulations!*
*Your are selected for "{eventName}" on {eventDate}.*
Your Entry ID: *{registrationId}*
Registrations will start by 8am

{qrCode}*Jai Gurudev* 🙏`;
    setEditableTemplate(template);
    setTemplateDialog({ open: true, eventId, template });
  };

  const handleSaveTemplate = async () => {
    try {
      await axios.put(`/api/events/${templateDialog.eventId}`, {
        messageTemplate: editableTemplate
      }, config);
      setEvents(prev => prev.map(e => 
        e._id === templateDialog.eventId 
          ? { ...e, messageTemplate: editableTemplate }
          : e
      ));
      setTemplateDialog({ open: false, eventId: '', template: '' });
      alert('Template saved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save template');
    }
  };

  async function handleToggleWhatsappSent(regId: string) {
    try {
      const response = await axios.put(`/api/event-registrations/${regId}/toggle-whatsapp`, {}, config);
      // Update local state immediately
      setRegistrations(prev => prev.map(reg => 
        reg.registrationId === regId 
          ? { ...reg, whatsappSent: response.data.whatsappSent }
          : reg
      ));
      // Also refresh data from server to ensure consistency
      fetchRegistrations();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to update WhatsApp status');
    }
  }



  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page when filtering
  };

  const filterOptions = [
    { key: 'event', label: 'Event', type: 'select' as const, options: [
      ...events.map(event => ({ value: event._id, label: event.name }))
    ]},
    { key: 'name', label: 'Registrant Name', type: 'text' as const },
    { key: 'mobile', label: 'Mobile', type: 'text' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ]},
    { key: 'whatsappSent', label: 'WhatsApp Sent', type: 'select' as const, options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]}
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>
        Event Registrations (Approval Required) ({totalCount})
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <JaiGurudevLoader />
        </Box>
      ) : (
        <>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <AdminFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                filterOptions={filterOptions}
              />
            </Box>
            <Paper sx={{ 
              p: 2, 
              background: 'linear-gradient(135deg, #fff7f0 0%, #ffeee0 100%)', 
              minWidth: { xs: '100%', lg: 340 },
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(222,107,47,0.15)',
              border: '1px solid rgba(222,107,47,0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Box sx={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #de6b2f 0%, #b45309 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.8rem'
                }}>
                  💬
                </Box>
                <Typography variant="body1" sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                  WhatsApp Template
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Event Template</InputLabel>
                  <Select
                    value={selectedEventTemplate}
                    onChange={(e) => setSelectedEventTemplate(e.target.value)}
                    label="Event Template"
                    sx={{ 
                      fontSize: '0.8rem',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(222,107,47,0.3)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(222,107,47,0.5)'
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.8rem' }}>Default Template</MenuItem>
                    {events.map((event) => (
                      <MenuItem key={event._id} value={event._id} sx={{ fontSize: '0.8rem' }}>
                        🎉 {event.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedEventTemplate && (
                  <Button 
                    size="small"
                    variant="contained" 
                    onClick={() => handleEditTemplate(selectedEventTemplate)}
                    sx={{ 
                      background: 'linear-gradient(135deg, #de6b2f 0%, #b45309 100%)',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      boxShadow: '0 2px 8px rgba(222,107,47,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #b45309 0%, #de6b2f 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(222,107,47,0.4)'
                      }
                    }}
                  >
                    ✏️ Edit Template
                  </Button>
                )}
              </Box>
              <Typography variant="caption" sx={{ 
                display: 'block', 
                mt: 1, 
                color: '#8b5a2b', 
                fontSize: '0.7rem',
                fontStyle: 'italic',
                opacity: 0.8,
                lineHeight: 1.3
              }}>
                📝 Placeholders: {'{name}'}, {'{eventName}'}, {'{eventDate}'}, {'{registrationId}'}, {'{qrCode}'}
              </Typography>
            </Paper>
          </Box>



      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#fff7f0' }}>

              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Event</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Registrant</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>WhatsApp</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Message Sent</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Details</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.length === 0 && (
              <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', py: 3, color: '#666', fontStyle: 'italic' }}>No registrations found.</TableCell></TableRow>
            )}
            {registrations.map((reg, idx) => (
              <TableRow key={reg._id} hover sx={{ background: idx % 2 === 0 ? '#fff' : '#f9f4ee', '&:hover': { background: '#fff3e0' } }}>

                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333', fontWeight: 600 }}>{reg.eventId?.name}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{reg.fullName || '-'}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{reg.mobile || '-'}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ color: reg.status === 'approved' ? '#2e7d32' : reg.status === 'rejected' ? '#d32f2f' : '#ed6c02', fontWeight: 600, fontSize: '0.9rem' }}>
                      {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                    </Typography>
                    {reg.status === 'approved' && (
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => handleShowBarcode(reg.registrationId)}
                        sx={{ fontSize: '0.7rem', py: 0.5 }}
                      >
                        Show Barcode
                      </Button>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    {reg.status === 'approved' && (
                      <IconButton
                        onClick={async () => {
                          try {
                            const qrCodeDataURL = await QRCode.toDataURL(reg.registrationId);
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const qrImg = new Image();
                            
                            qrImg.onload = async () => {
                              canvas.width = 400;
                              canvas.height = 400;
                              
                              ctx.fillStyle = '#ffffff';
                              ctx.fillRect(0, 0, canvas.width, canvas.height);
                              
                              const centerX = canvas.width / 2;
                              
                              const logo = new Image();
                              logo.onload = () => {
                                ctx.fillStyle = '#333333';
                                ctx.font = 'bold 16px Arial';
                                ctx.textAlign = 'center';
                                ctx.fillText(reg.eventId?.name || 'N/A', centerX, 30);
                                
                                ctx.font = '14px Arial';
                                const eventDate = reg.eventId?.date ? 
                                  new Date(reg.eventId.date).toLocaleDateString('en-GB', { 
                                    day: 'numeric', month: 'short', year: 'numeric' 
                                  }).replace(/,/g, '') : 'TBD';
                                ctx.fillText(eventDate, centerX, 50);
                                
                                const qrSize = 180;
                                const qrX = (canvas.width - qrSize) / 2;
                                ctx.drawImage(qrImg, qrX, 70, qrSize, qrSize);
                                
                                const logoSize = 20;
                                const logoX = centerX - logoSize/2;
                                const logoY = 70 + qrSize/2 - logoSize/2;
                                
                                ctx.fillStyle = '#ffffff';
                                ctx.beginPath();
                                ctx.arc(centerX, 70 + qrSize/2, 15, 0, 2 * Math.PI);
                                ctx.fill();
                                
                                ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
                                
                                ctx.fillStyle = '#333333';
                                ctx.font = 'bold 16px Arial';
                                let y = 280;
                                
                                ctx.fillText(reg.fullName || 'N/A', centerX, y);
                                y += 22;
                                ctx.fillText(`📱 ${reg.mobile || 'N/A'}`, centerX, y);
                                y += 22;
                                ctx.fillText(`🆔 ${reg.registrationId}`, centerX, y);
                                
                                canvas.toBlob(async (blob) => {
                                  await navigator.clipboard.write([
                                    new ClipboardItem({ 'image/png': blob })
                                  ]);
                                  setShowToast(true);
                                });
                              };
                              logo.src = '/images/SKS_Logo_4K-1.png';
                            };
                            
                            qrImg.src = qrCodeDataURL;
                          } catch (err) {
                            alert('Failed to copy barcode');
                          }
                        }}
                        sx={{ 
                          color: '#de6b2f',
                          '&:hover': { 
                            backgroundColor: 'rgba(222, 107, 47, 0.1)' 
                          }
                        }}
                        title="Copy QR code"
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    )}
                    {reg.mobile && (
                      <IconButton
                        onClick={() => {
                          const message = getWhatsAppMessage(reg);
                          const whatsappUrl = `https://web.whatsapp.com/send?phone=${reg.mobile}&text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        sx={{ 
                          color: '#25D366',
                          '&:hover': { 
                            backgroundColor: 'rgba(37, 211, 102, 0.1)' 
                          }
                        }}
                        title="Send WhatsApp message"
                      >
                        <WhatsAppIcon />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', textAlign: 'center' }}>
                  <Checkbox
                    checked={reg.whatsappSent || false}
                    onChange={() => handleToggleWhatsappSent(reg.registrationId)}
                    sx={{ color: '#25D366' }}
                    title="Mark as WhatsApp message sent"
                  />
                </TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
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
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                  {reg.status === 'pending' || editingRegId === reg.registrationId ? (
                    <>
                      <Button size="small" color="success" variant="contained" onClick={() => handleApprove(reg.registrationId)} sx={{ mr: 1, fontSize: '0.8rem' }}>
                        Approve
                      </Button>
                      <Button size="small" color="error" variant="contained" onClick={() => handleReject(reg.registrationId)} sx={{ mr: 1, fontSize: '0.8rem' }}>
                        Reject
                      </Button>
                      {editingRegId === reg.registrationId && (
                        <Button size="small" variant="outlined" onClick={() => setEditingRegId(null)} sx={{ fontSize: '0.8rem' }}>
                          Cancel
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button size="small" variant="outlined" onClick={() => setEditingRegId(reg.registrationId)} sx={{ fontSize: '0.8rem' }}>
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>


        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ borderTop: '1px solid #e0e0e0' }}
        />
      </TableContainer>

      <Dialog open={barcodeDialog.open} onClose={() => setBarcodeDialog({ open: false, regId: '', qrCode: '' })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          fontFamily: 'Lora, serif', 
          color: 'white', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #de6b2f 0%, #b45309 100%)',
          py: 1.5
        }}>
          📱 Registration Barcode
        </DialogTitle>
        <DialogContent sx={{ py: 2, background: 'linear-gradient(135deg, #fff7f0 0%, #fff3e0 100%)' }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#b45309', mb: 0.5 }}>
              {barcodeDialog.registration?.eventId?.name || 'N/A'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
              {barcodeDialog.registration?.eventId?.date ? 
                new Date(barcodeDialog.registration.eventId.date).toLocaleDateString('en-GB', { 
                  day: 'numeric', month: 'short', year: 'numeric' 
                }).replace(/,/g, '') : 'TBD'}
            </Typography>
          </Box>
          
          {barcodeDialog.qrCode && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ 
                p: 2,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '2px solid #de6b2f',
                position: 'relative'
              }}>
                <img 
                  src={barcodeDialog.qrCode} 
                  alt="Registration QR Code" 
                  style={{ width: '160px', height: '160px', borderRadius: '4px' }}
                />
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: 'white',
                  borderRadius: '50%',
                  p: 0.5,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  <img 
                    src="/images/SKS_Logo_4K-1.png" 
                    alt="SKS Logo" 
                    style={{ width: '20px', height: '20px' }}
                  />
                </Box>
              </Box>
            </Box>
          )}
          
          <Box sx={{ 
            bgcolor: 'white', 
            p: 2, 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
              <Typography variant="h6" sx={{ 
                fontFamily: 'Lora, serif', 
                color: '#b45309', 
                fontWeight: 700
              }}>
                {barcodeDialog.registration?.fullName || 'N/A'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.5, sm: 2 }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ bgcolor: '#25D366', borderRadius: '50%', p: 0.3, display: 'flex' }}>
                    <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>📱</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#25D366', fontWeight: 600 }}>
                    {barcodeDialog.registration?.mobile || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ bgcolor: '#de6b2f', borderRadius: '50%', p: 0.3, display: 'flex' }}>
                    <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>🆔</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#de6b2f', fontWeight: 600, fontFamily: 'monospace' }}>
                    {barcodeDialog.regId}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button 
            onClick={handleCopyImage}
            variant="outlined"
            sx={{ borderColor: '#de6b2f', color: '#de6b2f' }}
          >
            Copy Image
          </Button>
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
        <DialogTitle sx={{ 
          fontFamily: 'Lora, serif', 
          color: 'white', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #de6b2f 0%, #b45309 100%)',
          py: 1.5
        }}>
          📋 Registration Details
        </DialogTitle>
        <DialogContent sx={{ py: 2, background: 'linear-gradient(135deg, #fff7f0 0%, #fff3e0 100%)' }}>
          {detailsDialog.registration && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#b45309', mb: 0.5 }}>
                  {detailsDialog.registration.fullName || 'N/A'}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: { xs: 0.5, sm: 3 }, alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ color: '#25D366', fontWeight: 600 }}>
                    📱 {detailsDialog.registration.mobile || 'N/A'}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#de6b2f', fontWeight: 600, fontFamily: 'monospace' }}>
                    🆔 {detailsDialog.registration.registrationId || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Event sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '50px', color: '#666' }}>Event:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{detailsDialog.registration.eventId?.name || 'N/A'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Wc sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '50px', color: '#666' }}>Gender:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{detailsDialog.registration.gender || 'N/A'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Cake sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '50px', color: '#666' }}>Age:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{detailsDialog.registration.age || 'N/A'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Work sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '50px', color: '#666' }}>Job:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{detailsDialog.registration.profession || 'N/A'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '50px', color: '#666' }}>SKS:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{detailsDialog.registration.sksLevel || 'N/A'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Star sx={{ color: '#de6b2f', fontSize: '1rem', mt: 0.1 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '50px', color: '#666' }}>Miracle:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', lineHeight: 1.2 }}>{detailsDialog.registration.sksMiracle || 'N/A'}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationOn sx={{ color: '#de6b2f', fontSize: '1rem', mt: 0.1 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '50px', color: '#666' }}>Address:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', lineHeight: 1.2 }}>{detailsDialog.registration.address || 'N/A'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Group sx={{ color: '#de6b2f', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '50px', color: '#666' }}>For:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{detailsDialog.registration.forWhom === 'self' ? 'Self' : 'Others'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Info sx={{ color: '#de6b2f', fontSize: '1rem', mt: 0.1 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '50px', color: '#666' }}>Other:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', lineHeight: 1.2 }}>{detailsDialog.registration.otherDetails || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
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

      <Dialog open={templateDialog.open} onClose={() => setTemplateDialog({ open: false, eventId: '', template: '' })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Lora, serif', color: '#de6b2f' }}>
          Edit WhatsApp Message Template
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Available placeholders: {'{name}'}, {'{eventName}'}, {'{eventDate}'}, {'{registrationId}'}, {'{qrCode}'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            value={editableTemplate}
            onChange={(e) => setEditableTemplate(e.target.value)}
            placeholder="Enter your WhatsApp message template..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setTemplateDialog({ open: false, eventId: '', template: '' })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTemplate}
            variant="contained"
            sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)' }}
          >
            Save Template
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showToast}
        autoHideDuration={2000}
        onClose={() => setShowToast(false)}
        message="QR code copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
        </>
      )}
    </Box>
  );
}