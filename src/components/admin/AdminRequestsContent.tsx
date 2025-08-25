import React, { useEffect, useState, useMemo } from 'react';
import { getUsers, approveUser, rejectUser, bulkApproveUsers, bulkRejectUsers } from '../../services/api.ts';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Alert, Checkbox, IconButton, TablePagination, Select, MenuItem, FormControl, InputLabel, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AdminFilters from './AdminFilters.tsx';
import JaiGurudevLoader from '../JaiGurudevLoader.tsx';
import axios from 'axios';
import { API_URL } from '../../services/api.ts';

export default function AdminRequestsContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [userTemplate, setUserTemplate] = useState('');
  const [templateDialog, setTemplateDialog] = useState<{ open: boolean; template: string }>({ open: false, template: '' });
  const [editableTemplate, setEditableTemplate] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/users?page=${page + 1}&limit=${rowsPerPage}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      const usersArray = Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : [];
      setUsers(usersArray);
      setTotalCount(data.total || usersArray.length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
      setTotalCount(0);
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

  async function handleToggleWhatsappSent(userId: string) {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_URL}/admin/users/${userId}/toggle-whatsapp`, {}, config);
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, whatsappSent: response.data.whatsappSent }
          : user
      ));
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to update WhatsApp status');
    }
  }

  const getUserWhatsAppMessage = (user: any) => {
    const template = userTemplate || `*Sivoham* {name} garu🙏,\n\n*Congratulations!*\n*Your registration has been {status}.*\n\nYou can now access our courses and programs.\n\n*Jai Gurudev* 🙏`;
    
    return template
      .replace(/{name}/g, `${user.firstName} ${user.lastName}`)
      .replace(/{status}/g, user.isSelected ? 'approved' : 'processed');
  };

  const handleEditUserTemplate = () => {
    const template = userTemplate || `*Sivoham* {name} garu🙏,\n\n*Congratulations!*\n*Your registration has been {status}.*\n\nYou can now access our courses and programs.\n\n*Jai Gurudev* 🙏`;
    setEditableTemplate(template);
    setTemplateDialog({ open: true, template });
  };

  const handleSaveUserTemplate = () => {
    setUserTemplate(editableTemplate);
    setTemplateDialog({ open: false, template: '' });
    localStorage.setItem('userRegistrationTemplate', editableTemplate);
    alert('Template saved successfully!');
  };

  useEffect(() => {
    const savedTemplate = localStorage.getItem('userRegistrationTemplate');
    if (savedTemplate) {
      setUserTemplate(savedTemplate);
    }
  }, []);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter(user => {
      const name = `${user.firstName} ${user.lastName}`.toLowerCase();
      const mobile = user.mobile?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const status = user.isSelected ? 'approved' : 'pending';
      
      // Date filtering
      let dateMatch = true;
      if (filters.registeredFrom || filters.registeredTo) {
        const userDate = user.createdAt ? new Date(user.createdAt) : null;
        if (userDate) {
          if (filters.registeredFrom) {
            const fromDate = new Date(filters.registeredFrom);
            fromDate.setHours(0, 0, 0, 0);
            if (userDate < fromDate) dateMatch = false;
          }
          if (filters.registeredTo) {
            const toDate = new Date(filters.registeredTo);
            toDate.setHours(23, 59, 59, 999);
            if (userDate > toDate) dateMatch = false;
          }
        } else {
          dateMatch = false;
        }
      }
      
      return (!filters.name || name.includes(filters.name.toLowerCase())) &&
             (!filters.mobile || mobile.includes(filters.mobile.toLowerCase())) &&
             (!filters.email || email.includes(filters.email.toLowerCase())) &&
             (!filters.status || status === filters.status) &&
             (!filters.whatsappSent || (filters.whatsappSent === 'true' ? user.whatsappSent : !user.whatsappSent)) &&
             dateMatch;
    });
  }, [users, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filterOptions = [
    { key: 'name', label: 'Name', type: 'text' as const },
    { key: 'mobile', label: 'Mobile', type: 'text' as const },
    { key: 'email', label: 'Email', type: 'text' as const },
    { key: 'registeredFrom', label: 'Registered From', type: 'date' as const },
    { key: 'registeredTo', label: 'Registered To', type: 'date' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' }
    ]},
    { key: 'whatsappSent', label: 'WhatsApp Sent', type: 'select' as const, options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]}
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
        User Registration Requests ({totalCount})
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
              minWidth: { xs: '100%', lg: 300 },
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
                  background: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <WhatsAppIcon sx={{ fontSize: '0.9rem' }} />
                </Box>
                <Typography variant="body1" sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                  WhatsApp Template
                </Typography>
              </Box>
              <Button 
                size="small"
                variant="contained" 
                onClick={handleEditUserTemplate}
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
              <Typography variant="caption" sx={{ 
                display: 'block', 
                mt: 1, 
                color: '#8b5a2b', 
                fontSize: '0.7rem',
                fontStyle: 'italic',
                opacity: 0.8
              }}>
                📝 Placeholders: {'{name}'}, {'{status}'}
              </Typography>
            </Paper>
          </Box>

      {selectedUsers.length > 0 && (
        <Box sx={{ 
          mb: 3, 
          p: 2.5, 
          background: 'linear-gradient(135deg, #fff3e0 0%, #ffe8cc 100%)', 
          borderRadius: 3, 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          alignItems: 'center',
          boxShadow: '0 4px 16px rgba(255,152,0,0.15)',
          border: '1px solid rgba(255,152,0,0.2)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 700
            }}>
              {selectedUsers.length}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#e65100' }}>
              users selected
            </Typography>
          </Box>
          <Button 
            size="small" 
            variant="contained" 
            onClick={handleBulkApprove}
            sx={{ 
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            ✅ Bulk Approve
          </Button>
          <Button 
            size="small" 
            variant="contained" 
            onClick={handleBulkReject}
            sx={{ 
              background: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            ❌ Bulk Reject
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => setSelectedUsers([])}
            sx={{ 
              borderColor: '#ff9800',
              color: '#e65100',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                borderColor: '#f57c00',
                backgroundColor: 'rgba(255,152,0,0.1)'
              }
            }}
          >
            🗑️ Clear
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
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Registration Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>WhatsApp</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Message Sent</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(filteredUsers) && filteredUsers.map((user, idx) => (
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
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#666' }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: user.isSelected ? '#2e7d32' : '#ed6c02', fontWeight: 600 }}>{user.isSelected ? 'Approved' : 'Pending'}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', textAlign: 'center' }}>
                  {user.mobile && (
                    <IconButton
                      onClick={() => {
                        const message = getUserWhatsAppMessage(user);
                        const whatsappUrl = `https://web.whatsapp.com/send?phone=${user.mobile}&text=${encodeURIComponent(message)}`;
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
                    checked={user.whatsappSent || false}
                    onChange={() => handleToggleWhatsappSent(user._id)}
                    sx={{ color: '#25D366' }}
                    title="Mark as WhatsApp message sent"
                  />
                </TableCell>
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

      <Dialog open={templateDialog.open} onClose={() => setTemplateDialog({ open: false, template: '' })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Lora, serif', color: '#de6b2f' }}>
          Edit User Registration WhatsApp Template
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Available placeholders: {'{name}'}, {'{status}'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={editableTemplate}
            onChange={(e) => setEditableTemplate(e.target.value)}
            placeholder="Enter your WhatsApp message template..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setTemplateDialog({ open: false, template: '' })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveUserTemplate}
            variant="contained"
            sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)' }}
          >
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </Box>
  );
}