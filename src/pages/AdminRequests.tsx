import React, { useState } from 'react';
import { Box } from '@mui/material';
import AdminSidebar from '../components/admin/AdminSidebar.tsx';
import AdminRequestsContent from '../components/admin/AdminRequestsContent.tsx';
import EventsManagement from '../components/admin/EventsManagement.tsx';
import EventRegistrationsApproval from '../components/admin/EventRegistrationsApproval.tsx';
import EventUsersTab from '../components/admin/EventUsersTab.tsx';
import AdminUsersTab from '../components/admin/AdminUsersTab.tsx';
import BarcodeScanner from '../components/admin/BarcodeScanner.tsx';
import RoleManagement from '../components/admin/RoleManagement.tsx';
import EventPermissions from '../components/admin/EventPermissions.tsx';
import InProgressTab from '../components/admin/InProgressTab.tsx';

export default function AdminRequests() {
  const [tab, setTab] = useState(4); // Default to Users tab
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar 
        tab={tab} 
        setTab={setTab} 
        drawerOpen={drawerOpen} 
        setDrawerOpen={setDrawerOpen} 
      />
      
      <Box sx={{ flex: 1, p: { xs: 1, md: 3 } }}>
        {tab === 0 && <AdminRequestsContent />}
        {tab === 1 && <EventsManagement />}
        {tab === 2 && <EventRegistrationsApproval />}
        {tab === 3 && <EventUsersTab />}
        {tab === 4 && <AdminUsersTab />}
        {tab === 5 && <BarcodeScanner />}
        {tab === 6 && <RoleManagement />}
        {tab === 7 && <EventPermissions />}
        {tab === 8 && <InProgressTab title="Merchandise Management" description="Manage spiritual merchandise, books, and sacred items. Track inventory, orders, and deliveries for devotees." />}
        {tab === 9 && <InProgressTab title="Sevaks Management" description="Coordinate volunteer activities and seva opportunities. Manage sevak registrations, assignments, and contributions to the spiritual community." />}
      </Box>
    </Box>
  );
}