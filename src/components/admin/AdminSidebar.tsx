import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Typography, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { usePermissions } from '../../contexts/PermissionContext.tsx';
import { useState, useEffect } from 'react';

interface AdminSidebarProps {
  tab: number;
  setTab: (tab: number) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const userTabs = [
  { label: 'Users', icon: <PersonSearchIcon />, index: 4 },
  { label: 'User Registration Requests', icon: <PeopleIcon />, index: 0 },
  { label: 'Role Management', icon: <AdminPanelSettingsIcon />, index: 6 },
  { label: 'Event Permissions', icon: <EventIcon />, index: 7 },
];

const eventTabs = [
  { label: 'Events Management', icon: <EventIcon />, index: 1 },
  { label: 'Event Registrations', icon: <AssignmentIcon />, index: 2 },
  { label: 'Event Users', icon: <GroupIcon />, index: 3 },
  { label: 'Barcode Scanner', icon: <QrCodeScannerIcon />, index: 5 },
];

const otherTabs = [
  { label: 'Merchandise', icon: <ShoppingCartIcon />, index: 8 },
  { label: 'Sevaks', icon: <VolunteerActivismIcon />, index: 9 },
];

export default function AdminSidebar({ tab, setTab, drawerOpen, setDrawerOpen }: AdminSidebarProps) {
  const { isSuperAdmin } = usePermissions();
  const [eventPermissions, setEventPermissions] = useState<any>(null);
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setEventPermissions(user.eventPermissions || null);
  }, []);
  
  // Check both context and localStorage for super admin status
  const isSuper = isSuperAdmin() || JSON.parse(localStorage.getItem('user') || '{}').isSuperAdmin;
  const userTabsFiltered = userTabs.filter(tabItem => 
    (tabItem.index !== 6 && tabItem.index !== 7) || isSuper
  );
  
  // Other tabs are available to all admins
  const otherTabsFiltered = otherTabs;
  
  const eventTabsFiltered = eventTabs.filter(tabItem => {
    if (isSuperAdmin()) return true;
    if (!eventPermissions) return false;
    
    switch (tabItem.index) {
      case 1: return eventPermissions.eventsManagement;
      case 2: return eventPermissions.eventRegistrations;
      case 3: return eventPermissions.eventUsers;
      case 5: return eventPermissions.barcodeScanner;
      default: return false;
    }
  });
  
  return (
    <>
      <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 220, bgcolor: '#fff7f0', borderRight: 1, borderColor: '#eee', pt: 3 }}>
        <List>
          {isSuper && (
            <>
              <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600, color: '#b45309', fontSize: '0.9rem' }}>
                USER MANAGEMENT
              </Typography>
              {userTabsFiltered.map((tabItem) => (
                <ListItem key={tabItem.label} disablePadding>
                  <ListItemButton selected={tab === tabItem.index} onClick={() => setTab(tabItem.index)}>
                    <ListItemIcon>{tabItem.icon}</ListItemIcon>
                    <ListItemText primary={tabItem.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </>
          )}
          
          <Divider sx={{ my: 1 }} />
          
          {eventTabsFiltered.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600, color: '#b45309', fontSize: '0.9rem' }}>
                EVENT MANAGEMENT
              </Typography>
              {eventTabsFiltered.map((tabItem) => (
                <ListItem key={tabItem.label} disablePadding>
                  <ListItemButton selected={tab === tabItem.index} onClick={() => setTab(tabItem.index)}>
                    <ListItemIcon>{tabItem.icon}</ListItemIcon>
                    <ListItemText primary={tabItem.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </>
          )}
          
          <Divider sx={{ my: 1 }} />
          
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600, color: '#b45309', fontSize: '0.9rem' }}>
            OTHER
          </Typography>
          {otherTabs.map((tabItem) => (
            <ListItem key={tabItem.label} disablePadding>
              <ListItemButton selected={tab === tabItem.index} onClick={() => setTab(tabItem.index)}>
                <ListItemIcon>{tabItem.icon}</ListItemIcon>
                <ListItemText primary={tabItem.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box sx={{ width: 240 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {isSuper && (
              <>
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600, color: '#b45309', fontSize: '0.9rem' }}>
                  USER MANAGEMENT
                </Typography>
                {userTabsFiltered.map((tabItem) => (
                  <ListItem key={tabItem.label} disablePadding>
                    <ListItemButton selected={tab === tabItem.index} onClick={() => { setTab(tabItem.index); setDrawerOpen(false); }}>
                      <ListItemIcon>{tabItem.icon}</ListItemIcon>
                      <ListItemText primary={tabItem.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}
            
            {eventTabsFiltered.length > 0 && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600, color: '#b45309', fontSize: '0.9rem' }}>
                  EVENT MANAGEMENT
                </Typography>
                {eventTabsFiltered.map((tabItem) => (
                  <ListItem key={tabItem.label} disablePadding>
                    <ListItemButton selected={tab === tabItem.index} onClick={() => { setTab(tabItem.index); setDrawerOpen(false); }}>
                      <ListItemIcon>{tabItem.icon}</ListItemIcon>
                      <ListItemText primary={tabItem.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600, color: '#b45309', fontSize: '0.9rem' }}>
              OTHER
            </Typography>
            {otherTabs.map((tabItem) => (
              <ListItem key={tabItem.label} disablePadding>
                <ListItemButton selected={tab === tabItem.index} onClick={() => { setTab(tabItem.index); setDrawerOpen(false); }}>
                  <ListItemIcon>{tabItem.icon}</ListItemIcon>
                  <ListItemText primary={tabItem.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ 
        display: { xs: 'flex', md: 'none' }, 
        alignItems: 'center', 
        mb: 2,
        position: 'sticky',
        top: 0,
        bgcolor: 'white',
        zIndex: 10,
        py: 1
      }}>
        <IconButton onClick={() => setDrawerOpen(true)}>
          <MenuIcon />
        </IconButton>
      </Box>
    </>
  );
}