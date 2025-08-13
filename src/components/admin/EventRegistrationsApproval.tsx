import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Alert, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
  }, []);

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
      const res = await axios.get('/api/event-registrations', config);
      setRegistrations(res.data.filter((reg: any) => reg.eventId && reg.eventId.eventType === 'limited'));
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
    const pendingRegs = filteredRegistrations.filter(reg => reg.status === 'pending');
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

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const eventId = reg.eventId?._id || '';
      const userName = reg.fullName?.toLowerCase() || '';
      const mobile = reg.mobile?.toLowerCase() || '';
      const status = reg.status?.toLowerCase() || '';
      
      return (!filters.event || eventId === filters.event) &&
             (!filters.name || userName.includes(filters.name.toLowerCase())) &&
             (!filters.mobile || mobile.includes(filters.mobile.toLowerCase())) &&
             (!filters.status || status === filters.status);
    });
  }, [registrations, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filterOptions = [
    { key: 'event', label: 'Event', type: 'select' as const, options: [
      { value: '', label: 'All Events' },
      ...events.map(event => ({ value: event._id, label: event.name }))
    ]},
    { key: 'name', label: 'Registrant Name', type: 'text' as const },
    { key: 'mobile', label: 'Mobile', type: 'text' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ]}
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>
        Event Registrations (Approval Required)
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <AdminFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
      />

      {selectedRegs.length > 0 && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ alignSelf: 'center', fontWeight: 600 }}>
            {selectedRegs.length} registrations selected
          </Typography>
          <Button size="small" color="success" variant="contained" onClick={handleBulkApprove}>
            Bulk Approve
          </Button>
          <Button size="small" color="error" variant="contained" onClick={handleBulkReject}>
            Bulk Reject
          </Button>
          <Button size="small" variant="outlined" onClick={() => setSelectedRegs([])}>
            Clear Selection
          </Button>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#fff7f0' }}>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem', width: 50 }}>
                <Checkbox 
                  checked={selectedRegs.length > 0 && selectedRegs.length === filteredRegistrations.filter(r => r.status === 'pending').length}
                  indeterminate={selectedRegs.length > 0 && selectedRegs.length < filteredRegistrations.filter(r => r.status === 'pending').length}
                  onChange={handleSelectAll}
                  sx={{ color: '#de6b2f' }}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Event</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Registrant</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Details</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRegistrations.length === 0 && (
              <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 3, color: '#666', fontStyle: 'italic' }}>No registrations found.</TableCell></TableRow>
            )}
            {filteredRegistrations.map((reg, idx) => (
              <TableRow key={reg._id} hover sx={{ background: idx % 2 === 0 ? '#fff' : '#f9f4ee', '&:hover': { background: '#fff3e0' } }}>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                  {reg.status === 'pending' && (
                    <Checkbox 
                      checked={selectedRegs.includes(reg.registrationId)}
                      onChange={() => handleSelectReg(reg.registrationId)}
                      sx={{ color: '#de6b2f' }}
                    />
                  )}
                </TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333', fontWeight: 600 }}>{reg.eventId?.name}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{reg.fullName || '-'}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{reg.mobile || '-'}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ color: reg.status === 'approved' ? '#2e7d32' : reg.status === 'rejected' ? '#d32f2f' : '#ed6c02', fontWeight: 600, fontSize: '0.9rem' }}>
                      {reg.status}
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
    </Box>
  );
}