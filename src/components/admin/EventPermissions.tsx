import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert, Switch, FormControlLabel } from '@mui/material';
import { Edit, Delete, PersonAdd } from '@mui/icons-material';
import JaiGurudevLoader from '../JaiGurudevLoader.tsx';
import axios from 'axios';
import { API_URL } from '../../services/api.ts';

interface EventAdmin {
  _id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string;
  eventPermissions?: {
    eventsManagement: boolean;
    eventRegistrations: boolean;
    eventUsers: boolean;
    barcodeScanner: boolean;
  };
}

export default function EventPermissions() {
  const [eventAdmins, setEventAdmins] = useState<EventAdmin[]>([]);
  const [allUsers, setAllUsers] = useState<EventAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignDialog, setAssignDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: EventAdmin | null }>({ open: false, user: null });
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; user: EventAdmin | null }>({ open: false, user: null });
  const [selectedUser, setSelectedUser] = useState<EventAdmin | null>(null);
  const [permissions, setPermissions] = useState({
    eventsManagement: false,
    eventRegistrations: false,
    eventUsers: false,
    barcodeScanner: false
  });

  useEffect(() => {
    fetchEventAdmins();
    fetchAllUsers();
  }, []);

  const fetchEventAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/event-admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEventAdmins(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch event admins');
      setEventAdmins([]);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/all-users?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const users = Array.isArray(res.data.users) ? res.data.users : Array.isArray(res.data) ? res.data : [];
      setAllUsers(users.filter((user: any) => user.role !== 'superadmin'));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPermissions = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/assign-event-permissions`, {
        userId: selectedUser._id,
        permissions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Event permissions assigned successfully!');
      setAssignDialog(false);
      setSelectedUser(null);
      setPermissions({ eventsManagement: false, eventRegistrations: false, eventUsers: false, barcodeScanner: false });
      fetchEventAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to assign permissions');
    }
  };

  const handleUpdatePermissions = async () => {
    if (!editDialog.user) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/update-event-permissions/${editDialog.user._id}`, {
        permissions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEventAdmins(prev => prev.map(admin => 
        admin._id === editDialog.user!._id 
          ? { ...admin, eventPermissions: permissions }
          : admin
      ));
      setEditDialog({ open: false, user: null });
      alert('Permissions updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update permissions');
    }
  };

  const handleRevokePermissions = async () => {
    if (!revokeDialog.user) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/revoke-event-permissions/${revokeDialog.user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEventAdmins(prev => prev.filter(admin => admin._id !== revokeDialog.user!._id));
      setRevokeDialog({ open: false, user: null });
      alert('Event permissions revoked successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to revoke permissions');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <JaiGurudevLoader />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>
          Event Management Permissions
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setAssignDialog(true)}
          sx={{ 
            background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
            '&:hover': { background: 'linear-gradient(90deg, #b45309 0%, #de6b2f 100%)' }
          }}
        >
          Assign Event Permissions
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#fff7f0' }}>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Events Mgmt</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Registrations</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Event Users</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Barcode Scanner</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(eventAdmins) && eventAdmins.map((admin, idx) => (
              <TableRow key={admin._id} hover sx={{ background: idx % 2 === 0 ? '#fff' : '#f9f4ee' }}>
                <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                <TableCell>{admin.mobile}</TableCell>
                <TableCell>
                  <Chip 
                    label={admin.eventPermissions?.eventsManagement ? 'Yes' : 'No'}
                    color={admin.eventPermissions?.eventsManagement ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={admin.eventPermissions?.eventRegistrations ? 'Yes' : 'No'}
                    color={admin.eventPermissions?.eventRegistrations ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={admin.eventPermissions?.eventUsers ? 'Yes' : 'No'}
                    color={admin.eventPermissions?.eventUsers ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={admin.eventPermissions?.barcodeScanner ? 'Yes' : 'No'}
                    color={admin.eventPermissions?.barcodeScanner ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => {
                        setEditDialog({ open: true, user: admin });
                        setPermissions(admin.eventPermissions || { eventsManagement: false, eventRegistrations: false, eventUsers: false, barcodeScanner: false });
                      }}
                      sx={{ color: '#1976d2' }}
                      title="Edit permissions"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => setRevokeDialog({ open: true, user: admin })}
                      sx={{ color: '#d32f2f' }}
                      title="Revoke permissions"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Assign Permissions Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)', color: 'white' }}>
          Assign Event Management Permissions
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>Select user and permissions:</Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Select User:</Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1 }}>
              {Array.isArray(allUsers) && allUsers.map(user => (
                <Box
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    background: selectedUser?._id === user._id ? '#e3f2fd' : 'transparent',
                    '&:hover': { background: '#f5f5f5' },
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {user.mobile}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 2 }}>Event Management Permissions:</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Switch checked={permissions.eventsManagement} onChange={(e) => setPermissions(prev => ({ ...prev, eventsManagement: e.target.checked }))} />}
              label="Events Management"
            />
            <FormControlLabel
              control={<Switch checked={permissions.eventRegistrations} onChange={(e) => setPermissions(prev => ({ ...prev, eventRegistrations: e.target.checked }))} />}
              label="Event Registrations"
            />
            <FormControlLabel
              control={<Switch checked={permissions.eventUsers} onChange={(e) => setPermissions(prev => ({ ...prev, eventUsers: e.target.checked }))} />}
              label="Event Users"
            />
            <FormControlLabel
              control={<Switch checked={permissions.barcodeScanner} onChange={(e) => setPermissions(prev => ({ ...prev, barcodeScanner: e.target.checked }))} />}
              label="Barcode Scanner"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignPermissions}
            variant="contained"
            disabled={!selectedUser}
            sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)' }}
          >
            Assign Permissions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)', color: 'white' }}>
          Edit Event Permissions - {editDialog.user?.firstName} {editDialog.user?.lastName}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Event Management Permissions:</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Switch checked={permissions.eventsManagement} onChange={(e) => setPermissions(prev => ({ ...prev, eventsManagement: e.target.checked }))} />}
              label="Events Management"
            />
            <FormControlLabel
              control={<Switch checked={permissions.eventRegistrations} onChange={(e) => setPermissions(prev => ({ ...prev, eventRegistrations: e.target.checked }))} />}
              label="Event Registrations"
            />
            <FormControlLabel
              control={<Switch checked={permissions.eventUsers} onChange={(e) => setPermissions(prev => ({ ...prev, eventUsers: e.target.checked }))} />}
              label="Event Users"
            />
            <FormControlLabel
              control={<Switch checked={permissions.barcodeScanner} onChange={(e) => setPermissions(prev => ({ ...prev, barcodeScanner: e.target.checked }))} />}
              label="Barcode Scanner"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>Cancel</Button>
          <Button 
            onClick={handleUpdatePermissions}
            variant="contained"
            sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)' }}
          >
            Update Permissions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Permissions Dialog */}
      <Dialog open={revokeDialog.open} onClose={() => setRevokeDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #d32f2f 0%, #b71c1c 100%)', color: 'white' }}>
          ⚠️ Revoke Event Permissions
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {revokeDialog.user && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f', fontWeight: 700 }}>
                Are you sure you want to revoke all event permissions?
              </Typography>
              <Box sx={{ background: '#ffebee', borderRadius: 2, p: 2, mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  {revokeDialog.user.firstName} {revokeDialog.user.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Mobile: {revokeDialog.user.mobile}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                This will remove all event management permissions for this user.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setRevokeDialog({ open: false, user: null })}>Cancel</Button>
          <Button 
            onClick={handleRevokePermissions}
            variant="contained"
            color="error"
          >
            Revoke Permissions
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}