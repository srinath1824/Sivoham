import React, { useEffect, useState } from 'react';
import { getUsers, approveUser, rejectUser } from '../../services/api.ts';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Alert } from '@mui/material';

export default function AdminRequestsContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(userId: string) {
    try {
      await approveUser(userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to approve user');
    }
  }

  async function handleReject(userId: string) {
    if (!window.confirm('Are you sure you want to reject this user?')) return;
    try {
      await rejectUser(userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to reject user');
    }
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
        User Registration Requests
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#fff7f0' }}>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, idx) => (
              <TableRow key={user._id} hover sx={{ background: idx % 2 === 0 ? '#fff' : '#f9f4ee' }}>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.mobile}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.isSelected ? 'Approved' : 'Pending'}</TableCell>
                <TableCell>
                  {!user.isSelected && !user.isAdmin && (
                    <>
                      <Button size="small" color="success" variant="contained" onClick={() => handleApprove(user._id)}>
                        Approve
                      </Button>
                      <Button size="small" color="error" variant="contained" onClick={() => handleReject(user._id)} sx={{ ml: 1 }}>
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