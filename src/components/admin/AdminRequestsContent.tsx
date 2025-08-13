import React, { useEffect, useState, useMemo } from 'react';
import { getUsers, approveUser, rejectUser, bulkApproveUsers, bulkRejectUsers } from '../../services/api.ts';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Alert, Checkbox } from '@mui/material';
import AdminFilters from './AdminFilters.tsx';

export default function AdminRequestsContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

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
      setEditingUserId(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to approve user');
    }
  }

  async function handleReject(userId: string) {
    try {
      await rejectUser(userId);
      setEditingUserId(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to reject user');
    }
  }

  async function handleBulkApprove() {
    if (selectedUsers.length === 0) return;
    if (!window.confirm(`Approve ${selectedUsers.length} selected users?`)) return;
    try {
      await bulkApproveUsers(selectedUsers);
      setSelectedUsers([]);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to bulk approve users');
    }
  }

  async function handleBulkReject() {
    if (selectedUsers.length === 0) return;
    if (!window.confirm(`Reject ${selectedUsers.length} selected users?`)) return;
    try {
      await bulkRejectUsers(selectedUsers);
      setSelectedUsers([]);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to bulk reject users');
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const eligibleUsers = filteredUsers.filter(user => !user.isAdmin);
    setSelectedUsers(
      selectedUsers.length === eligibleUsers.length 
        ? [] 
        : eligibleUsers.map(user => user._id)
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const name = `${user.firstName} ${user.lastName}`.toLowerCase();
      const mobile = user.mobile?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const status = user.isSelected ? 'approved' : 'pending';
      
      return (!filters.name || name.includes(filters.name.toLowerCase())) &&
             (!filters.mobile || mobile.includes(filters.mobile.toLowerCase())) &&
             (!filters.email || email.includes(filters.email.toLowerCase())) &&
             (!filters.status || status === filters.status);
    });
  }, [users, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filterOptions = [
    { key: 'name', label: 'Name', type: 'text' as const },
    { key: 'mobile', label: 'Mobile', type: 'text' as const },
    { key: 'email', label: 'Email', type: 'text' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' }
    ]}
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
        User Registration Requests
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <AdminFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
      />

      {selectedUsers.length > 0 && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ alignSelf: 'center', fontWeight: 600 }}>
            {selectedUsers.length} users selected
          </Typography>
          <Button size="small" color="success" variant="contained" onClick={handleBulkApprove}>
            Bulk Approve
          </Button>
          <Button size="small" color="error" variant="contained" onClick={handleBulkReject}>
            Bulk Reject
          </Button>
          <Button size="small" variant="outlined" onClick={() => setSelectedUsers([])}>
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
                  checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.filter(u => !u.isAdmin).length}
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.filter(u => !u.isAdmin).length}
                  onChange={handleSelectAll}
                  sx={{ color: '#de6b2f' }}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user, idx) => (
              <TableRow key={user._id} hover sx={{ background: idx % 2 === 0 ? '#fff' : '#f9f4ee', '&:hover': { background: '#fff3e0' } }}>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                  {!user.isAdmin && (
                    <Checkbox 
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                      sx={{ color: '#de6b2f' }}
                    />
                  )}
                </TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{user.firstName} {user.lastName}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{user.mobile}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{user.email}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: user.isSelected ? '#2e7d32' : '#ed6c02', fontWeight: 600 }}>{user.isSelected ? 'Approved' : 'Pending'}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                  {!user.isAdmin && (
                    <>
                      {!user.isSelected || editingUserId === user._id ? (
                        <>
                          <Button size="small" color="success" variant="contained" onClick={() => handleApprove(user._id)} sx={{ mr: 1, fontSize: '0.8rem' }}>
                            Approve
                          </Button>
                          <Button size="small" color="error" variant="contained" onClick={() => handleReject(user._id)} sx={{ mr: 1, fontSize: '0.8rem' }}>
                            Reject
                          </Button>
                          {editingUserId === user._id && (
                            <Button size="small" variant="outlined" onClick={() => setEditingUserId(null)} sx={{ fontSize: '0.8rem' }}>
                              Cancel
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button size="small" variant="outlined" onClick={() => setEditingUserId(user._id)} sx={{ fontSize: '0.8rem' }}>
                          Edit
                        </Button>
                      )}
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