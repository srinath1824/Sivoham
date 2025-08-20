import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert } from '@mui/material';
import { Edit, Delete, PersonAdd } from '@mui/icons-material';
import JaiGurudevLoader from '../JaiGurudevLoader.tsx';
import RoleAssignDialog from './RoleAssignDialog.tsx';
import PermissionMatrix from './PermissionMatrix.tsx';
import axios from 'axios';

interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string;
  role: 'admin' | 'superadmin';
  permissions?: any;
  assignedBy?: { firstName: string; lastName: string };
  assignedAt?: string;
}

export default function RoleManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignDialog, setAssignDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: AdminUser | null }>({ open: false, user: null });
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; user: AdminUser | null }>({ open: false, user: null });
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch admin users');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeRole = async () => {
    if (!revokeDialog.user) return;
    
    setRevoking(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/revoke-role/${revokeDialog.user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAdmins(prev => prev.filter(admin => admin._id !== revokeDialog.user!._id));
      setRevokeDialog({ open: false, user: null });
      alert('Admin role revoked successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to revoke role');
    } finally {
      setRevoking(false);
    }
  };

  const handleUpdatePermissions = async (userId: string, permissions: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/update-permissions/${userId}`, { permissions }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAdmins(prev => prev.map(admin => 
        admin._id === userId ? { ...admin, permissions } : admin
      ));
      setEditDialog({ open: false, user: null });
      alert('Permissions updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update permissions');
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
          Role Management
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
          Assign Admin Role
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#fff7f0' }}>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Assigned By</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Assigned Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.map((admin, idx) => (
              <TableRow key={admin._id} hover sx={{ background: idx % 2 === 0 ? '#fff' : '#f9f4ee' }}>
                <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                <TableCell>{admin.mobile}</TableCell>
                <TableCell>
                  <Chip 
                    label={admin.isSuperAdmin ? 'Super Admin' : 'Admin'}
                    color={admin.isSuperAdmin ? 'error' : 'primary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {admin.assignedBy ? `${admin.assignedBy.firstName} ${admin.assignedBy.lastName}` : 'System'}
                </TableCell>
                <TableCell>
                  {admin.assignedAt ? new Date(admin.assignedAt).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {!admin.isSuperAdmin && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => setEditDialog({ open: true, user: admin })}
                        sx={{ color: '#1976d2' }}
                        title="Edit permissions"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => setRevokeDialog({ open: true, user: admin })}
                        sx={{ color: '#d32f2f' }}
                        title="Revoke admin role"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Assign Role Dialog */}
      <RoleAssignDialog
        open={assignDialog}
        onClose={() => setAssignDialog(false)}
        onSuccess={() => {
          setAssignDialog(false);
          fetchAdmins();
        }}
      />

      {/* Edit Permissions Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)', color: 'white' }}>
          Edit Permissions - {editDialog.user?.firstName} {editDialog.user?.lastName}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {editDialog.user && (
            <PermissionMatrix
              initialPermissions={editDialog.user.permissions}
              onSave={(permissions) => handleUpdatePermissions(editDialog.user!._id, permissions)}
              onCancel={() => setEditDialog({ open: false, user: null })}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Role Dialog */}
      <Dialog open={revokeDialog.open} onClose={() => !revoking && setRevokeDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #d32f2f 0%, #b71c1c 100%)', color: 'white' }}>
          ⚠️ Revoke Admin Role
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {revokeDialog.user && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f', fontWeight: 700 }}>
                Are you sure you want to revoke admin role?
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
                This will remove all admin permissions and access to the admin panel.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setRevokeDialog({ open: false, user: null })} disabled={revoking}>
            Cancel
          </Button>
          <Button 
            onClick={handleRevokeRole}
            variant="contained"
            color="error"
            disabled={revoking}
          >
            {revoking ? 'Revoking...' : 'Revoke Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}