import React, { useState } from 'react';
import { Box, Typography, Switch, FormControlLabel, Button, Grid, Paper } from '@mui/material';

interface Permissions {
  users: { view: boolean; edit: boolean; delete: boolean };
  events: { view: boolean; edit: boolean; delete: boolean };
  courses: { view: boolean; edit: boolean };
  analytics: { view: boolean };
  settings: { view: boolean; edit: boolean };
}

interface PermissionMatrixProps {
  initialPermissions?: Permissions;
  onSave: (permissions: Permissions) => void;
  onCancel: () => void;
}

const defaultPermissions: Permissions = {
  users: { view: false, edit: false, delete: false },
  events: { view: false, edit: false, delete: false },
  courses: { view: false, edit: false },
  analytics: { view: false },
  settings: { view: false, edit: false }
};

export default function PermissionMatrix({ initialPermissions, onSave, onCancel }: PermissionMatrixProps) {
  const [permissions, setPermissions] = useState<Permissions>(initialPermissions || defaultPermissions);

  const handlePermissionChange = (category: keyof Permissions, action: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [action]: value
      }
    }));
  };

  const permissionCategories = [
    {
      key: 'users' as keyof Permissions,
      label: 'User Management',
      icon: '👥',
      actions: [
        { key: 'view', label: 'View Users' },
        { key: 'edit', label: 'Edit Users' },
        { key: 'delete', label: 'Delete Users' }
      ]
    },
    {
      key: 'events' as keyof Permissions,
      label: 'Event Management',
      icon: '📅',
      actions: [
        { key: 'view', label: 'View Events' },
        { key: 'edit', label: 'Edit Events' },
        { key: 'delete', label: 'Delete Events' }
      ]
    },
    {
      key: 'courses' as keyof Permissions,
      label: 'Course Management',
      icon: '📚',
      actions: [
        { key: 'view', label: 'View Courses' },
        { key: 'edit', label: 'Edit Courses' }
      ]
    },
    {
      key: 'analytics' as keyof Permissions,
      label: 'Analytics',
      icon: '📊',
      actions: [
        { key: 'view', label: 'View Analytics' }
      ]
    },
    {
      key: 'settings' as keyof Permissions,
      label: 'Settings',
      icon: '⚙️',
      actions: [
        { key: 'view', label: 'View Settings' },
        { key: 'edit', label: 'Edit Settings' }
      ]
    }
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, color: '#b45309', fontWeight: 700 }}>
        Assign Permissions
      </Typography>
      
      <Grid container spacing={2}>
        {permissionCategories.map((category) => (
          <Grid item xs={12} md={6} key={category.key}>
            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{category.icon}</span>
                {category.label}
              </Typography>
              
              {category.actions.map((action) => (
                <FormControlLabel
                  key={action.key}
                  control={
                    <Switch
                      checked={permissions[category.key][action.key as keyof typeof permissions[typeof category.key]]}
                      onChange={(e) => handlePermissionChange(category.key, action.key, e.target.checked)}
                      color="primary"
                    />
                  }
                  label={action.label}
                  sx={{ display: 'block', mb: 1 }}
                />
              ))}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={() => onSave(permissions)}
          variant="contained"
          sx={{ background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)' }}
        >
          Save Permissions
        </Button>
      </Box>
    </Box>
  );
}

