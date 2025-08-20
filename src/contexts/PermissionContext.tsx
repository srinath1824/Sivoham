import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Permissions {
  users: { view: boolean; edit: boolean; delete: boolean };
  events: { view: boolean; edit: boolean; delete: boolean };
  courses: { view: boolean; edit: boolean };
  analytics: { view: boolean };
  settings: { view: boolean; edit: boolean };
}

interface PermissionContextType {
  role: 'user' | 'admin' | 'superadmin';
  permissions: Permissions | null;
  loading: boolean;
  hasPermission: (category: keyof Permissions, action: string) => boolean;
  isSuperAdmin: () => boolean;
  refreshPermissions: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<'user' | 'admin' | 'superadmin'>('user');
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [superAdmin, setSuperAdmin] = useState(false);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get('/api/admin/my-permissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRole(res.data.role || 'user');
      setPermissions(res.data.permissions || null);
      setSuperAdmin(res.data.isSuperAdmin || false);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      setRole('user');
      setPermissions(null);
      setSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const hasPermission = (category: keyof Permissions, action: string): boolean => {
    if (role === 'superadmin') return true;
    if (!permissions) return false;
    return permissions[category]?.[action as keyof typeof permissions[typeof category]] || false;
  };

  const isSuperAdmin = (): boolean => {
    return superAdmin;
  };

  const refreshPermissions = () => {
    fetchPermissions();
  };

  return (
    <PermissionContext.Provider value={{
      role,
      permissions,
      loading,
      hasPermission,
      isSuperAdmin,
      refreshPermissions
    }}>
      {children}
    </PermissionContext.Provider>
  );
};