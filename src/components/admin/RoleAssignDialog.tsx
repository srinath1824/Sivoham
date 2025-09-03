import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete, Box, Typography } from '@mui/material';
import PermissionMatrix from './PermissionMatrix';
import axios from 'axios';
import { API_URL } from '../../services/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string;
}

interface RoleAssignDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoleAssignDialog({ open, onClose, onSuccess }: RoleAssignDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [step, setStep] = useState(1); // 1: Select User, 2: Set Permissions
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/all-users?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out existing admins
      const regularUsers = res.data.users.filter((user: any) => user.role === 'user' || !user.role);
      setUsers(regularUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleAssignRole = async (permissions: any) => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/assign-role`, {
        userId: selectedUser._id,
        permissions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Admin role assigned successfully!');
      onSuccess();
      handleClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedUser(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)', color: 'white' }}>
        {step === 1 ? 'Select User to Assign Admin Role' : 'Set Permissions'}
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, minHeight: 400 }}>
        {step === 1 ? (
          <Box>
            <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
              Select a user to assign admin role and permissions:
            </Typography>
            
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.mobile})`}
              value={selectedUser}
              onChange={(_, newValue) => setSelectedUser(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search and select user"
                  variant="outlined"
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {option.firstName} {option.lastName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {option.mobile} {option.email && `• ${option.email}`}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
            
            {selectedUser && (
              <Box sx={{ mt: 3, p: 2, background: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Selected User:
                </Typography>
                <Typography variant="body1">
                  {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {selectedUser.mobile}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <PermissionMatrix
            onSave={handleAssignRole}
            onCancel={() => setStep(1)}
          />
        )}
      </DialogContent>
      
      {step === 1 && (
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={() => setStep(2)}
            variant="contained"
            disabled={!selectedUser}
            sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)' }}
          >
            Next: Set Permissions
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

