import { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Checkbox, TablePagination, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Delete } from '@mui/icons-material';
import JaiGurudevLoader from '../JaiGurudevLoader';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AdminFilters from './AdminFilters';


import axios from 'axios';
import { API_URL } from '../../services/api';

export default function AdminUsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [userTemplate, setUserTemplate] = useState('');
  const [templateDialog, setTemplateDialog] = useState<{ open: boolean; template: string }>({ open: false, template: '' });
  const [editableTemplate, setEditableTemplate] = useState('');
  const [watchTimeDialog, setWatchTimeDialog] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });
  const [deleting, setDeleting] = useState(false);


  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      // setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/admin/all-users?page=${page + 1}&limit=${rowsPerPage}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        const usersArray = Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : [];
        setUsers(usersArray);
        setTotalCount(data.total || usersArray.length);
      } catch (err: any) {
        console.error('Failed to fetch users:', err.message || 'Failed to fetch users');
        setUsers([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [page, rowsPerPage]);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter(user => {
      const name = `${user.firstName} ${user.lastName}`.toLowerCase();
      const mobile = user.mobile?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const isAdmin = user.isAdmin ? 'yes' : 'no';
      const isSelected = user.isSelected ? 'yes' : 'no';
      
      // Course progress filtering
      let courseProgressMatch = true;
      if (filters.courseProgress) {
        const progress = user.courseProgress;
        const currentLevel = progress?.currentLevel || 'Not Started';
        
        switch (filters.courseProgress) {
          case 'not_started':
            courseProgressMatch = currentLevel === 'Not Started';
            break;
          case 'level_1':
            courseProgressMatch = currentLevel === 'Level 1 Completed';
            break;
          case 'level_2':
            courseProgressMatch = currentLevel === 'Level 2 Completed';
            break;
          case 'meditation_test':
            courseProgressMatch = currentLevel === 'Test Completed';
            break;
          case 'level_3':
            courseProgressMatch = currentLevel === 'Level 3 Completed';
            break;
          case 'level_4':
            courseProgressMatch = currentLevel === 'Level 4 Completed';
            break;
          case 'level_5':
            courseProgressMatch = currentLevel === 'Level 5 Completed';
            break;
          default:
            courseProgressMatch = true;
        }
      }
      
      // Date range filtering for course completion
      let dateMatch = true;
      if (filters.completedFrom || filters.completedTo) {
        const completionDate = user.courseProgress?.lastCompletedAt ? new Date(user.courseProgress.lastCompletedAt) : user.updatedAt ? new Date(user.updatedAt) : null;
        if (completionDate) {
          if (filters.completedFrom) {
            const fromDate = new Date(filters.completedFrom);
            fromDate.setHours(0, 0, 0, 0);
            if (completionDate < fromDate) dateMatch = false;
          }
          if (filters.completedTo) {
            const toDate = new Date(filters.completedTo);
            toDate.setHours(23, 59, 59, 999);
            if (completionDate > toDate) dateMatch = false;
          }
        } else {
          dateMatch = false;
        }
      }
      
      return (!filters.name || name.includes(filters.name.toLowerCase())) &&
             (!filters.mobile || mobile.includes(filters.mobile.toLowerCase())) &&
             (!filters.email || email.includes(filters.email.toLowerCase())) &&
             (!filters.admin || isAdmin === filters.admin) &&
             (!filters.selected || isSelected === filters.selected) &&
             (!filters.whatsappSent || (filters.whatsappSent === 'true' ? user.whatsappSent : !user.whatsappSent)) &&
             courseProgressMatch &&
             dateMatch;
    });
  }, [users, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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

  async function handleDeleteUser() {
    if (!deleteDialog.user) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/admin/users/${deleteDialog.user._id}`, config);
      
      // Remove user from local state
      setUsers(prev => prev.filter(user => user._id !== deleteDialog.user._id));
      setTotalCount(prev => prev - 1);
      
      alert('User deleted successfully!');
      setDeleteDialog({ open: false, user: null });
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
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
    { key: 'courseProgress', label: 'Course Progress', type: 'select' as const, options: [
      { value: 'not_started', label: 'Not Started' },
      { value: 'level_1', label: 'Level 1 Completed' },
      { value: 'level_2', label: 'Level 2 Completed' },
      { value: 'meditation_test', label: 'Meditation Test Completed' },
      { value: 'level_3', label: 'Level 3 Completed' },
      { value: 'level_4', label: 'Level 4 Completed' },
      { value: 'level_5', label: 'Level 5 Completed (Event)' }
    ]},
    { key: 'completedFrom', label: 'Completed From', type: 'date' as const },
    { key: 'completedTo', label: 'Completed To', type: 'date' as const },
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
          <JaiGurudevLoader />
        </Box>
      ) : (
        <>
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
                📝 Placeholders: {'{name}'}
              </Typography>
            </Paper>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#fff7f0' }}>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Mobile</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Course Progress</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Watch Time</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Admin</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Selected</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>WhatsApp</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Message Sent</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((u: any, idx: number) => (
                <TableRow key={u._id} hover sx={{ background: idx % 2 === 0 ? '#fff' : '#f9f4ee', '&:hover': { background: '#fff3e0' } }}>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{u.firstName} {u.lastName}</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{u.mobile}</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 600,
                        color: u.courseProgress?.level4Completed ? '#2e7d32' : u.courseProgress?.completedLevels > 0 ? '#ed6c02' : '#666'
                      }}>
                        {u.courseProgress?.currentLevel || 'Not Started'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>
                        {u.courseProgress?.level4Completed ? '✓ Level 4 Done' : `${u.courseProgress?.completedLevels || 0}/5 Levels`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                    <Button 
                      size="small" 
                      variant="contained" 
                      onClick={() => setWatchTimeDialog({ open: true, user: u })}
                      sx={{ 
                        fontSize: '0.75rem',
                        background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
                        color: 'white',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 2,
                        '&:hover': { 
                          background: 'linear-gradient(90deg, #b45309 0%, #de6b2f 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 8px rgba(222,107,47,0.3)'
                        }
                      }}
                    >
                      📊 Analytics
                    </Button>
                  </TableCell>
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
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {!u.isAdmin && (
                        <IconButton
                          onClick={() => setDeleteDialog({ open: true, user: u })}
                          sx={{ 
                            color: '#d32f2f',
                            '&:hover': { 
                              backgroundColor: 'rgba(211, 47, 47, 0.1)' 
                            }
                          }}
                          title="Delete user"
                        >
                          <Delete />
                        </IconButton>
                      )}
                      {u.isAdmin && (
                        <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', py: 1 }}>
                          Admin User
                        </Typography>
                      )}
                    </Box>
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

      {/* Watch Time Details Dialog */}
      <Dialog open={watchTimeDialog.open} onClose={() => setWatchTimeDialog({ open: false, user: null })} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #de6b2f 0%, #b45309 100%)',
          color: 'white',
          textAlign: 'center',
          py: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0l8 6-8 6V8h-4v4h4zM0 50V0l6 8H0v42H0z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.1
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              📊 {watchTimeDialog.user?.firstName} {watchTimeDialog.user?.lastName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Complete Course Analytics & Watch History
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, background: 'linear-gradient(135deg, #fff7f0 0%, #f0f8ff 100%)', maxHeight: '80vh', overflow: 'auto' }}>
          {watchTimeDialog.user && (
            <Box sx={{ p: 3 }}>
              {/* Summary Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)', 
                  borderRadius: 3, 
                  p: 2, 
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(222,107,47,0.1)',
                  border: '2px solid #de6b2f'
                }}>
                  <Typography variant="h4" sx={{ color: '#de6b2f', fontWeight: 700, mb: 0.5 }}>
                    {watchTimeDialog.user.courseProgress?.completedLevels || 0}/5
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Levels Completed</Typography>
                </Box>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)', 
                  borderRadius: 3, 
                  p: 2, 
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(46,125,50,0.1)',
                  border: `2px solid ${watchTimeDialog.user.courseProgress?.level4Completed ? '#2e7d32' : '#ed6c02'}`
                }}>
                  <Typography variant="h4" sx={{ color: watchTimeDialog.user.courseProgress?.level4Completed ? '#2e7d32' : '#ed6c02', fontWeight: 700, mb: 0.5 }}>
                    {watchTimeDialog.user.courseProgress?.level4Completed ? '✅' : '⏳'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Level 4 Status</Typography>
                </Box>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)', 
                  borderRadius: 3, 
                  p: 2, 
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(25,118,210,0.1)',
                  border: '2px solid #1976d2'
                }}>
                  <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 700, mb: 0.5 }}>
                    {Math.round((watchTimeDialog.user.courseProgress?.totalWatchTime || 0) / 60)}h
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Total Watch Time</Typography>
                </Box>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)', 
                  borderRadius: 3, 
                  p: 2, 
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(156,39,176,0.1)',
                  border: `2px solid ${watchTimeDialog.user.courseProgress?.meditationTest?.completed ? '#2e7d32' : '#ed6c02'}`
                }}>
                  <Typography variant="h4" sx={{ color: watchTimeDialog.user.courseProgress?.meditationTest?.completed ? '#2e7d32' : '#ed6c02', fontWeight: 700, mb: 0.5 }}>
                    {watchTimeDialog.user.courseProgress?.meditationTest?.completed ? '🧘' : '⏸️'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Meditation Test</Typography>
                </Box>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)', 
                  borderRadius: 3, 
                  p: 2, 
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(255,152,0,0.1)',
                  border: '2px solid #ff9800'
                }}>
                  <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700, mb: 0.5 }}>
                    {watchTimeDialog.user.courseProgress?.totalSessions || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Total Sessions</Typography>
                </Box>
              </Box>

              {/* Level Progress Cards */}
              <Typography variant="h6" sx={{ color: '#b45309', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                📈 Level-wise Progress & Watch History
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                {[1, 2, 3, 4, 5].map(level => {
                  const levelData = watchTimeDialog.user.courseProgress?.levelDetails?.[`level${level}`] || {};
                  const isCompleted = levelData.completed || false;
                  const watchTime = Math.round((levelData.watchTime || 0) / 60); // Convert to hours

                  const dailyProgress = levelData.dailyProgress || {};
                  const sessionsCount = Object.keys(dailyProgress).length;
                  const avgWatchTime = sessionsCount > 0 ? Math.round(levelData.watchTime / sessionsCount) : 0;
                  
                  return (
                    <Box key={level} sx={{ 
                      background: 'white',
                      borderRadius: 3,
                      p: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: `3px solid ${isCompleted ? '#28a745' : '#dc3545'}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Level Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            bgcolor: isCompleted ? '#28a745' : '#dc3545', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700
                          }}>
                            {isCompleted ? '✓' : level}
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: isCompleted ? '#28a745' : '#dc3545' }}>
                            Level {level}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                          bgcolor: isCompleted ? '#d4edda' : '#f8d7da',
                          color: isCompleted ? '#155724' : '#721c24',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          fontWeight: 600
                        }}>
                          {isCompleted ? 'Completed' : 'In Progress'}
                        </Typography>
                      </Box>

                      {/* Stats Grid */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>{watchTime}h</Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>Watch Time</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                          <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 700 }}>{sessionsCount}</Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>Sessions</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                          <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>{avgWatchTime}m</Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>Avg/Session</Typography>
                        </Box>
                      </Box>

                      {/* Daily Progress */}
                      {Object.keys(dailyProgress).length > 0 && (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#666' }}>Daily Sessions:</Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 120, overflow: 'auto' }}>
                            {Object.entries(dailyProgress).map(([dayKey, dayData]: [string, any]) => {
                              const dayNum = dayKey.replace('day', '');
                              const watchedMinutes = Math.round((dayData.watchedSeconds || 0) / 60);
                              const completedDate = dayData.completedAt ? new Date(dayData.completedAt).toLocaleDateString() : 'N/A';
                              
                              return (
                                <Box key={`${level}-${dayKey}`} sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 1, 
                                  bgcolor: dayData.completed ? '#d4edda' : '#fff3cd', 
                                  border: '1px solid',
                                  borderColor: dayData.completed ? '#28a745' : '#ffc107',
                                  borderRadius: 1
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 30 }}>D{dayNum}</Typography>
                                    <Typography variant="body2" sx={{ color: dayData.completed ? '#155724' : '#856404' }}>✓</Typography>
                                  </Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>{watchedMinutes}m</Typography>
                                  <Typography variant="caption" sx={{ color: '#666', minWidth: 70, textAlign: 'right' }}>{completedDate}</Typography>
                                  {dayData.dayGapHours > 0 && (
                                    <Typography variant="caption" sx={{ color: '#ff5722', fontWeight: 600 }}>+{dayData.dayGapHours}h</Typography>
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      )}
                      
                      {Object.keys(dailyProgress).length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 2, color: '#999' }}>
                          <Typography variant="body2">No session data available</Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Meditation Test Details */}
              {watchTimeDialog.user.courseProgress?.meditationTest && (
                <Box sx={{ 
                  background: 'white',
                  borderRadius: 3,
                  p: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '3px solid #9c27b0'
                }}>
                  <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🧘 Meditation Test Results
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                      <Typography variant="h5" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                        {watchTimeDialog.user.courseProgress.meditationTest.completed ? '✅' : '❌'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Status</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                      <Typography variant="h5" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                        {Math.round((watchTimeDialog.user.courseProgress.meditationTest.duration || 0) / 60)}m
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Duration</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                      <Typography variant="h5" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                        {watchTimeDialog.user.courseProgress.meditationTest.attempts || 1}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Attempts</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                      <Typography variant="h5" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                        {watchTimeDialog.user.courseProgress.meditationTest.score || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Score</Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, background: 'linear-gradient(135deg, #fff7f0 0%, #f0f8ff 100%)', justifyContent: 'center' }}>
          <Button 
            onClick={() => setWatchTimeDialog({ open: false, user: null })}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
              px: 4,
              py: 1,
              borderRadius: 3,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(222,107,47,0.3)',
              '&:hover': {
                background: 'linear-gradient(90deg, #b45309 0%, #de6b2f 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(222,107,47,0.4)'
              }
            }}
          >
            Close Analytics
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => !deleting && setDeleteDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
          color: 'white',
          textAlign: 'center',
          py: 2
        }}>
          ⚠️ Delete User
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {deleteDialog.user && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f', fontWeight: 700 }}>
                Are you sure you want to delete this user?
              </Typography>
              <Box sx={{ 
                background: '#ffebee', 
                borderRadius: 2, 
                p: 2, 
                mb: 2,
                border: '1px solid #ffcdd2'
              }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  {deleteDialog.user.firstName} {deleteDialog.user.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                  Mobile: {deleteDialog.user.mobile}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Email: {deleteDialog.user.email || 'N/A'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600, mb: 1 }}>
                This action will permanently delete:
              </Typography>
              <Box component="ul" sx={{ color: '#666', pl: 2, mb: 2 }}>
                <li>User account and profile data</li>
                <li>Course progress and watch history</li>
                <li>Event registrations and attendance</li>
                <li>All associated user data</li>
              </Box>
              <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 700 }}>
                This action cannot be undone!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, user: null })}
            variant="outlined"
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{ 
              background: 'linear-gradient(90deg, #d32f2f 0%, #b71c1c 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #b71c1c 0%, #d32f2f 100%)'
              }
            }}
          >
            {deleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

