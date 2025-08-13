import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton, Checkbox, TablePagination, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AdminFilters from './AdminFilters.tsx';
import axios from 'axios';

export default function AdminUsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [userTemplate, setUserTemplate] = useState('');
  const [templateDialog, setTemplateDialog] = useState<{ open: boolean; template: string }>({ open: false, template: '' });
  const [editableTemplate, setEditableTemplate] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/all-users?page=${page + 1}&limit=${rowsPerPage}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data.users || data);
        setTotalCount(data.total || data.length);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [page, rowsPerPage]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const name = `${user.firstName} ${user.lastName}`.toLowerCase();
      const mobile = user.mobile?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const isAdmin = user.isAdmin ? 'yes' : 'no';
      const isSelected = user.isSelected ? 'yes' : 'no';
      
      return (!filters.name || name.includes(filters.name.toLowerCase())) &&
             (!filters.mobile || mobile.includes(filters.mobile.toLowerCase())) &&
             (!filters.email || email.includes(filters.email.toLowerCase())) &&
             (!filters.admin || isAdmin === filters.admin) &&
             (!filters.selected || isSelected === filters.selected) &&
             (!filters.whatsappSent || (filters.whatsappSent === 'true' ? user.whatsappSent : !user.whatsappSent));
    });
  }, [users, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  async function handleToggleWhatsappSent(userId: string) {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`/api/admin/users/${userId}/toggle-whatsapp`, {}, config);
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
    const template = userTemplate || `Sivoham {name} garu🙏,\n\nWelcome to our community!\n\nYou can now access all our courses and programs.\n\nJai Gurudev 🙏`;
    return template.replace(/{name}/g, `${user.firstName} ${user.lastName}`);
  };

  const handleEditUserTemplate = () => {
    const template = userTemplate || `Sivoham {name} garu🙏,\n\nWelcome to our community!\n\nYou can now access all our courses and programs.\n\nJai Gurudev 🙏`;
    setEditableTemplate(template);
    setTemplateDialog({ open: true, template });
  };

  const handleSaveUserTemplate = () => {
    setUserTemplate(editableTemplate);
    setTemplateDialog({ open: false, template: '' });
    localStorage.setItem('allUsersTemplate', editableTemplate);
    alert('Template saved successfully!');
  };

  useEffect(() => {
    const savedTemplate = localStorage.getItem('allUsersTemplate');
    if (savedTemplate) {
      setUserTemplate(savedTemplate);
    }
  }, []);

  const filterOptions = [
    { key: 'name', label: 'Name', type: 'text' as const },
    { key: 'mobile', label: 'Mobile', type: 'text' as const },
    { key: 'email', label: 'Email', type: 'text' as const },
    { key: 'admin', label: 'Admin', type: 'select' as const, options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]},
    { key: 'selected', label: 'Selected', type: 'select' as const, options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]},
    { key: 'whatsappSent', label: 'WhatsApp Sent', type: 'select' as const, options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]}
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>
        Users ({totalCount})
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

          <Paper sx={{ p: 2, mb: 3, bgcolor: '#fff7f0' }}>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#de6b2f' }}>
              WhatsApp Message Template
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                onClick={handleEditUserTemplate}
                sx={{ borderColor: '#de6b2f', color: '#de6b2f' }}
              >
                Edit User Template
              </Button>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, color: '#666', fontStyle: 'italic' }}>
              Available placeholders: {'{name}'}
            </Typography>
          </Paper>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#fff7f0' }}>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Mobile</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Admin</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Selected</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>WhatsApp</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Message Sent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((u: any, idx: number) => (
                <TableRow key={u._id} hover sx={{ background: idx % 2 === 0 ? '#fff' : '#f9f4ee', '&:hover': { background: '#fff3e0' } }}>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{u.firstName} {u.lastName}</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{u.mobile}</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{u.email || '-'}</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: u.isAdmin ? '#2e7d32' : '#666', fontWeight: 600 }}>{u.isAdmin ? 'Yes' : 'No'}</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: u.isSelected ? '#2e7d32' : '#666', fontWeight: 600 }}>{u.isSelected ? 'Yes' : 'No'}</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', textAlign: 'center' }}>
                    {u.mobile && (
                      <IconButton
                        onClick={() => {
                          const message = getUserWhatsAppMessage(u);
                          const whatsappUrl = `https://web.whatsapp.com/send?phone=${u.mobile}&text=${encodeURIComponent(message)}`;
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
                      checked={u.whatsappSent || false}
                      onChange={() => handleToggleWhatsappSent(u._id)}
                      sx={{ color: '#25D366' }}
                      title="Mark as WhatsApp message sent"
                    />
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

      <Dialog open={templateDialog.open} onClose={() => setTemplateDialog({ open: false, template: '' })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Lora, serif', color: '#de6b2f' }}>
          Edit Users WhatsApp Template
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Available placeholders: {'{name}'}
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
    </Box>
  );
}