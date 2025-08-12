import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';

export default function AdminUsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/user/', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>
        Users
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
                <TableCell>Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Selected</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u: any) => (
                <TableRow key={u._id}>
                  <TableCell>{u.firstName} {u.lastName}</TableCell>
                  <TableCell>{u.mobile}</TableCell>
                  <TableCell>{u.email || '-'}</TableCell>
                  <TableCell>{u.isAdmin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{u.isSelected ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}