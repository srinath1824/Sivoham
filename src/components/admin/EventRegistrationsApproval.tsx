import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Alert } from '@mui/material';

export default function EventRegistrationsApproval() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchRegistrations();
  }, []);

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
      fetchRegistrations();
    } catch (err) {
      alert('Failed to approve registration');
    }
  }

  async function handleReject(regId: string) {
    try {
      await axios.put(`/api/event-registrations/${regId}/reject`, {}, config);
      fetchRegistrations();
    } catch (err) {
      alert('Failed to reject registration');
    }
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>
        Event Registrations (Approval Required)
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Registrant</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.length === 0 && (
              <TableRow><TableCell colSpan={5}>No registrations found.</TableCell></TableRow>
            )}
            {registrations.map(reg => (
              <TableRow key={reg._id}>
                <TableCell>{reg.eventId?.name}</TableCell>
                <TableCell>{reg.fullName || '-'}</TableCell>
                <TableCell>{reg.mobile || '-'}</TableCell>
                <TableCell>{reg.status}</TableCell>
                <TableCell>
                  {reg.status === 'pending' && (
                    <>
                      <Button size="small" color="success" variant="contained" onClick={() => handleApprove(reg.registrationId)}>
                        Approve
                      </Button>
                      <Button size="small" color="error" variant="contained" onClick={() => handleReject(reg.registrationId)} sx={{ ml: 1 }}>
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}