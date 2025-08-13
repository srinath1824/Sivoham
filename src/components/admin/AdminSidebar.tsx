import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Typography } from '@mui/material';
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

const tabList = [
  { label: 'User Registration Requests', icon: <PeopleIcon /> },
  { label: 'Events Management', icon: <EventIcon /> },
  { label: 'Event Registrations', icon: <AssignmentIcon /> },
  { label: 'Event Users', icon: <GroupIcon /> },
  { label: 'Users', icon: <PersonSearchIcon /> },
  { label: 'Barcode Scanner', icon: <QrCodeScannerIcon /> },
];

export default function AdminSidebar({ tab, setTab, drawerOpen, setDrawerOpen }: AdminSidebarProps) {
  return (
    <>
      <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 220, bgcolor: '#fff7f0', borderRight: 1, borderColor: '#eee', pt: 3 }}>
        <List>
          {tabList.map((tabItem, idx) => (
            <ListItem key={tabItem.label} disablePadding>
              <ListItemButton selected={tab === idx} onClick={() => setTab(idx)}>
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
            {tabList.map((tabItem, idx) => (
              <ListItem key={tabItem.label} disablePadding>
                <ListItemButton selected={tab === idx} onClick={() => { setTab(idx); setDrawerOpen(false); }}>
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