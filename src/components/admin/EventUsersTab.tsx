import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Checkbox, TablePagination } from '@mui/material';
import JaiGurudevLoader from '../JaiGurudevLoader.tsx';
import { Download } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import AdminFilters from './AdminFilters.tsx';

export default function EventUsersTab() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editingRegId, setEditingRegId] = useState<string | null>(null);
  const [selectedRegs, setSelectedRegs] = useState<string[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        ...filters
      });
      const res = await axios.get(`/api/event-registrations/all?${params}`, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setRegistrations(res.data.registrations || res.data);
      setTotalCount(res.data.total || res.data.length);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
    fetchData();
  }, [page, rowsPerPage, filters]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const filteredRegistrations = registrations;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page when filtering
  };

  const handleExcelDownload = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const res = await axios.get(`/api/event-registrations/export?${params}`, config);
      
      if (!res.data || !res.data.registrations) {
        throw new Error('No data received from server');
      }
      
      const data = res.data.registrations || [];
      
      if (data.length === 0) {
        alert('No data to export with current filters');
        return;
      }
      
      // Prepare data for Excel with safe property access
      const excelData = data.map((reg: any) => {
        try {
          return {
            'Registration ID': reg?.registrationId || '-',
            'Event Name': reg?.eventId?.name || '-',
            'Full Name': reg?.fullName || '-',
            'Mobile': reg?.mobile || '-',
            'Gender': reg?.gender || '-',
            'Age': reg?.age || '-',
            'Profession': reg?.profession || '-',
            'Address': reg?.address || '-',
            'SKS Level': reg?.sksLevel || '-',
            'SKS Miracle': reg?.sksMiracle || '-',
            'For Whom': reg?.forWhom || '-',
            'Other Details': reg?.otherDetails || '-',
            'Status': reg?.status || '-',
            'Attended': reg?.attended ? 'Yes' : 'No',
            'Attendance Time': reg?.attended && reg?.attendedAt ? new Date(reg.attendedAt).toLocaleString() : '-',
            'Registration Date': reg?.dateRegistered ? new Date(reg.dateRegistered).toLocaleDateString() : '-',
            'Event Date': reg?.eventDate ? new Date(reg.eventDate).toLocaleDateString() : '-'
          };
        } catch (regErr) {
          console.error('Error processing registration:', regErr);
          return {
            'Registration ID': 'Error',
            'Event Name': 'Error processing data',
            'Full Name': '-', 'Mobile': '-', 'Gender': '-', 'Age': '-',
            'Profession': '-', 'Address': '-', 'SKS Level': '-', 'SKS Miracle': '-',
            'For Whom': '-', 'Other Details': '-', 'Status': '-', 'Attended': '-',
            'Attendance Time': '-', 'Registration Date': '-', 'Event Date': '-'
          };
        }
      });
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Event Users');
      
      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `event-users-${date}.xlsx`;
      
      // Download file
      XLSX.writeFile(wb, filename);
    } catch (err: any) {
      console.error('Excel download error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to download Excel file';
      alert(`Download failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
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
    ]},
    { key: 'attendedBefore', label: 'Attended Before', type: 'datetime' as const },
    { key: 'attendedAfter', label: 'Attended After', type: 'datetime' as const }
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>
          Event Users ({totalCount})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExcelDownload}
          disabled={loading}
          sx={{ 
            bgcolor: '#2e7d32', 
            '&:hover': { bgcolor: '#1b5e20' },
            fontWeight: 600
          }}
        >
          Download Excel
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <JaiGurudevLoader />
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
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Attendance Time</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRegistrations.length === 0 && <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', py: 3, color: '#666', fontStyle: 'italic' }}>No users found.</TableCell></TableRow>}
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
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: reg.status === 'approved' ? '#2e7d32' : reg.status === 'rejected' ? '#d32f2f' : '#ed6c02', fontWeight: 600 }}>{reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: reg.attended ? '#2e7d32' : '#d32f2f', fontWeight: 600 }}>
                    {reg.attended ? '✓ Attended' : '✗ Not Attended'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>
                    {reg.attended && reg.attendedAt ? new Date(reg.attendedAt).toLocaleString() : '-'}
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
              setRowsPerPage(parseInt(e.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: '1px solid #e0e0e0' }}
          />
        </TableContainer>
        </>
      )}
    </Box>
  );
}