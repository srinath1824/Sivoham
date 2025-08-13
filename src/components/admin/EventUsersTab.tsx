import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button, Checkbox } from '@mui/material';
import AdminFilters from './AdminFilters.tsx';

export default function EventUsersTab() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editingRegId, setEditingRegId] = useState<string | null>(null);
  const [selectedRegs, setSelectedRegs] = useState<string[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

  async function fetchData() {
    setLoading(true);
    try {
      const res = await axios.get('/api/event-registrations', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setRegistrations(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
    fetchData();
  }, []);

  async function fetchEvents() {
    try {
      const res = await axios.get('/api/events');
      setEvents(res.data);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
    }
  }

  async function handleApprove(regId: string) {
    try {
      await axios.put(`/api/event-registrations/${regId}/approve`, {}, config);
      setEditingRegId(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to approve registration');
    }
  }

  async function handleReject(regId: string) {
    try {
      await axios.put(`/api/event-registrations/${regId}/reject`, {}, config);
      setEditingRegId(null);
      fetchData();
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
      fetchData();
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
      fetchData();
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
    setSelectedRegs(
      selectedRegs.length === filteredRegistrations.length 
        ? [] 
        : filteredRegistrations.map(reg => reg.registrationId)
    );
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const eventId = reg.eventId?._id || '';
      const userName = reg.fullName?.toLowerCase() || '';
      const mobile = reg.mobile?.toLowerCase() || '';
      const status = reg.status?.toLowerCase() || '';
      const attended = reg.attended ? 'yes' : 'no';
      
      return (!filters.event || eventId === filters.event) &&
             (!filters.name || userName.includes(filters.name.toLowerCase())) &&
             (!filters.mobile || mobile.includes(filters.mobile.toLowerCase())) &&
             (!filters.status || status === filters.status) &&
             (!filters.attended || attended === filters.attended);
    });
  }, [registrations, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filterOptions = [
    { key: 'event', label: 'Event', type: 'select' as const, options: [
      ...events.map(event => ({ value: event._id, label: event.name }))
    ]},
    { key: 'name', label: 'User Name', type: 'text' as const },
    { key: 'mobile', label: 'Mobile', type: 'text' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ]},
    { key: 'attended', label: 'Attended', type: 'select' as const, options: [
      { value: 'yes', label: 'Attended' },
      { value: 'no', label: 'Not Attended' }
    ]}
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>
        Event Users
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
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
                    checked={selectedRegs.length > 0 && selectedRegs.length === filteredRegistrations.length}
                    indeterminate={selectedRegs.length > 0 && selectedRegs.length < filteredRegistrations.length}
                    onChange={handleSelectAll}
                    sx={{ color: '#de6b2f' }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Event</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>User Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Mobile</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Attended</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRegistrations.length === 0 && <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 3, color: '#666', fontStyle: 'italic' }}>No users found.</TableCell></TableRow>}
              {filteredRegistrations.map((reg: any, idx: number) => (
                <TableRow key={reg.registrationId} hover sx={{ background: idx % 2 === 0 ? '#fff' : '#f9f4ee', '&:hover': { background: '#fff3e0' } }}>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                    <Checkbox 
                      checked={selectedRegs.includes(reg.registrationId)}
                      onChange={() => handleSelectReg(reg.registrationId)}
                      sx={{ color: '#de6b2f' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333', fontWeight: 600 }}>{reg.eventId?.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{reg.fullName}</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{reg.mobile}</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: reg.status === 'approved' ? '#2e7d32' : reg.status === 'rejected' ? '#d32f2f' : '#ed6c02', fontWeight: 600 }}>{reg.status}</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: reg.attended ? '#2e7d32' : '#666', fontWeight: 600 }}>
                    {reg.attended ? '✓ Attended' : 'Not Attended'}
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
        </>
      )}
    </Box>
  );
}