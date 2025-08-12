import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';

export default function EventUsersTab() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
    fetchData();
  }, []);

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
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registrations.length === 0 && <TableRow><TableCell colSpan={4}>No users found.</TableCell></TableRow>}
              {registrations.map((reg: any) => (
                <TableRow key={reg.registrationId}>
                  <TableCell>{reg.eventId?.name}</TableCell>
                  <TableCell>{reg.fullName}</TableCell>
                  <TableCell>{reg.mobile}</TableCell>
                  <TableCell>{reg.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}