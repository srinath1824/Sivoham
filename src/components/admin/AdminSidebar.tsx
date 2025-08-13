import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Typography, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

interface AdminSidebarProps {
  tab: number;
  setTab: (tab: number) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const userTabs = [
  { label: 'User Registration Requests', icon: <PeopleIcon />, index: 0 },
  { label: 'Users', icon: <PersonSearchIcon />, index: 4 },
];

const eventTabs = [
  { label: 'Events Management', icon: <EventIcon />, index: 1 },
  { label: 'Event Registrations', icon: <AssignmentIcon />, index: 2 },
  { label: 'Event Users', icon: <GroupIcon />, index: 3 },
  { label: 'Barcode Scanner', icon: <QrCodeScannerIcon />, index: 5 },
];

export default function AdminSidebar({ tab, setTab, drawerOpen, setDrawerOpen }: AdminSidebarProps) {
  return (
    <>
      <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 220, bgcolor: '#fff7f0', borderRight: 1, borderColor: '#eee', pt: 3 }}>
        <List>
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600, color: '#b45309', fontSize: '0.9rem' }}>
            USER MANAGEMENT
          </Typography>
          {userTabs.map((tabItem) => (
            <ListItem key={tabItem.label} disablePadding>
              <ListItemButton selected={tab === tabItem.index} onClick={() => setTab(tabItem.index)}>
                <ListItemIcon>{tabItem.icon}</ListItemIcon>
                <ListItemText primary={tabItem.label} />
              </ListItemButton>
            </ListItem>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600, color: '#b45309', fontSize: '0.9rem' }}>
            EVENT MANAGEMENT
          </Typography>
          {eventTabs.map((tabItem) => (
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
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600, color: '#b45309', fontSize: '0.9rem' }}>
              USER MANAGEMENT
            </Typography>
            {userTabs.map((tabItem) => (
              <ListItem key={tabItem.label} disablePadding>
                <ListItemButton selected={tab === tabItem.index} onClick={() => { setTab(tabItem.index); setDrawerOpen(false); }}>
                  <ListItemIcon>{tabItem.icon}</ListItemIcon>
                  <ListItemText primary={tabItem.label} />
                </ListItemButton>
              </ListItem>
            ))}
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600, color: '#b45309', fontSize: '0.9rem' }}>
              EVENT MANAGEMENT
            </Typography>
            {eventTabs.map((tabItem) => (
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