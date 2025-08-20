import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { usePermissions } from '../../contexts/PermissionContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  category: 'users' | 'events' | 'courses' | 'analytics' | 'settings';
  action: string;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({ children, category, action, fallback }: PermissionGuardProps) {
  const { hasPermission, loading, role } = usePermissions();

  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (!hasPermission(category, action)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Access Denied
        </Typography>
        <Typography variant="body2">
          You don't have permission to {action} {category}. 
          {role === 'admin' && ' Contact your super admin for access.'}
        </Typography>
      </Alert>
    );
  }

  return <>{children}</>;
}