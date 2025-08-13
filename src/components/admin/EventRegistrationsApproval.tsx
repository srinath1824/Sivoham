import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Alert, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, TablePagination, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AdminFilters from './AdminFilters.tsx';
import QRCode from 'qrcode';

export default function EventRegistrationsApproval() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editingRegId, setEditingRegId] = useState<string | null>(null);
  const [selectedRegs, setSelectedRegs] = useState<string[]>([]);
  const [barcodeDialog, setBarcodeDialog] = useState<{ open: boolean; regId: string; qrCode: string }>({ open: false, regId: '', qrCode: '' });
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; registration: any | null }>({ open: false, registration: null });
  const [events, setEvents] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedEventTemplate, setSelectedEventTemplate] = useState('');
  const [templateDialog, setTemplateDialog] = useState<{ open: boolean; eventId: string; template: string }>({ open: false, eventId: '', template: '' });
  const [editableTemplate, setEditableTemplate] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [page, rowsPerPage, filters]);

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

  const handleSelectReg = (regId: string) => {
    setSelectedRegs(prev => 
      prev.includes(regId) 
        ? prev.filter(id => id !== regId)
        : [...prev, regId]
    );
  };

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
      const qrCodeDataURL = await QRCode.toDataURL(regId);
      setBarcodeDialog({ open: true, regId, qrCode: qrCodeDataURL });
    } catch (err) {
      alert('Failed to generate barcode');
    }
  };

  const handleCopyImage = async () => {
    try {
      const response = await fetch(barcodeDialog.qrCode);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('QR code copied to clipboard!');
    } catch (err) {
      alert('Failed to copy image to clipboard');
    }
  };

  const getWhatsAppMessage = (reg: any) => {
    const eventDate = reg.eventId?.date ? new Date(reg.eventId.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/,/g, '') : 'TBD';
    const selectedEvent = events.find(e => e._id === selectedEventTemplate);
    const template = selectedEvent?.messageTemplate || `*Sivoham* {name} garu🙏,\n\n*Congratulations!*\n*Your are selected for "{eventName}" on {eventDate}.*\n\Your Entry ID: *{registrationId}*\nRegistrations will start by 8am\n\n{qrCode}*Jai Gurudev* 🙏`;
    
    return template
      .replace(/{name}/g, reg.fullName || 'there')
      .replace(/{eventName}/g, reg.eventId?.name || 'Event')
      .replace(/{eventDate}/g, eventDate)
      .replace(/{registrationId}/g, reg.registrationId)
      .replace(/{qrCode}/g, reg.status === 'approved' ? '📱 Show this QR code at the event for entry.\n\n' : '');
  };

  const handleEditTemplate = (eventId: string) => {
    const event = events.find(e => e._id === eventId);
    const template = event?.messageTemplate || `*Sivoham* {name} garu🙏,\n\n*Congratulations!*\n*Your are selected for "{eventName}" on {eventDate}.*\n\Your Entry ID: *{registrationId}*\nRegistrations will start by 8am\n\n{qrCode}*Jai Gurudev* 🙏`;
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <AdminFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
      />

      <Paper sx={{ p: 2, mb: 3, bgcolor: '#fff7f0' }}>
        <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#de6b2f' }}>
          WhatsApp Message Template
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Event Template</InputLabel>
            <Select
              value={selectedEventTemplate}
              onChange={(e) => setSelectedEventTemplate(e.target.value)}
              label="Select Event Template"
            >
              <MenuItem value="">Default Template</MenuItem>
              {events.map((event) => (
                <MenuItem key={event._id} value={event._id}>
                  {event.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedEventTemplate && (
            <Button 
              variant="outlined" 
              onClick={() => handleEditTemplate(selectedEventTemplate)}
              sx={{ borderColor: '#de6b2f', color: '#de6b2f' }}
            >
              Edit Template
            </Button>
          )}
        </Box>
        <Typography variant="body2" sx={{ mt: 1, color: '#666', fontStyle: 'italic' }}>
          Available placeholders: {'{name}'}, {'{eventName}'}, {'{eventDate}'}, {'{registrationId}'}, {'{qrCode}'}
        </Typography>
      </Paper>



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
      </TableContainer>

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
        sx={{ mb: 4 }}
      />

      <Dialog open={barcodeDialog.open} onClose={() => setBarcodeDialog({ open: false, regId: '', qrCode: '' })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontFamily: 'Lora, serif', color: '#de6b2f' }}>
          Registration Barcode
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
        <DialogTitle sx={{ fontFamily: 'Lora, serif', color: '#de6b2f' }}>
          Registration Details
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {detailsDialog.registration && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box><strong>Full Name:</strong> {detailsDialog.registration.fullName || '-'}</Box>
              <Box><strong>Mobile:</strong> {detailsDialog.registration.mobile || '-'}</Box>
              <Box><strong>Gender:</strong> {detailsDialog.registration.gender || '-'}</Box>
              <Box><strong>Age:</strong> {detailsDialog.registration.age || '-'}</Box>
              <Box><strong>Profession:</strong> {detailsDialog.registration.profession || '-'}</Box>
              <Box><strong>Address:</strong> {detailsDialog.registration.address || '-'}</Box>
              <Box><strong>SKS Level:</strong> {detailsDialog.registration.sksLevel || '-'}</Box>
              <Box><strong>SKS Miracles:</strong> {detailsDialog.registration.sksMiracle || '-'}</Box>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}><strong>Other Details:</strong> {detailsDialog.registration.otherDetails || '-'}</Box>
              <Box><strong>Registering For:</strong> {detailsDialog.registration.forWhom === 'self' ? 'Myself' : 'Someone Else'}</Box>
              <Box><strong>Registration ID:</strong> {detailsDialog.registration.registrationId || '-'}</Box>
              <Box><strong>Event:</strong> {detailsDialog.registration.eventId?.name || '-'}</Box>
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
    </Box>
  );
}