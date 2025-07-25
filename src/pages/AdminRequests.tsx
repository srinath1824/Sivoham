import React, { useEffect, useState } from 'react';
import { getUsers, approveUser, rejectUser, updateUser } from '../services/api.ts';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Grid, Select, MenuItem, InputLabel, FormControl, Checkbox, Tabs, Tab, CircularProgress } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import * as XLSX from 'xlsx';

interface EventType {
  _id?: string;
  name: string;
  date: string;
  description: string;
  venue: string;
  location: string;
  imageUrl?: string;
  eventType: 'unlimited' | 'limited';
}

function EventsManagement() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [eventData, setEventData] = useState<EventType>({ name: '', date: '', description: '', venue: '', location: '', imageUrl: '', eventType: 'unlimited' });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: '', date: '', description: '', venue: '', location: '' });
  // Add filter state
  const [filter, setFilter] = useState({ name: '', year: '', type: '' });

  // Helper to robustly extract year from date string
  const getYear = (dateStr: string | undefined) => dateStr ? dateStr.slice(0, 4) : '';

  // Helper to get unique years from events
  const eventYears = Array.from(new Set(events.map(e => getYear(e.date)).filter(Boolean)));

  function validateEvent(data) {
    const errors = { name: '', date: '', description: '', venue: '', location: '' };
    if (!data.name.trim()) errors.name = 'Name is required.';
    if (!data.date) errors.date = 'Date is required.';
    if (!data.description.trim()) errors.description = 'Description is required.';
    if (!data.venue.trim()) errors.venue = 'Venue is required.';
    if (!data.location.trim()) errors.location = 'Location is required.';
    return errors;
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await axios.get('/api/events');
      setEvents(res.data);
    } finally {
      setLoading(false);
    }
  }

  const handleOpen = (idx = -1) => {
    setEditIdx(idx);
    setEventData(idx >= 0 ? events[idx] : { name: '', date: '', description: '', venue: '', location: '', imageUrl: '', eventType: 'unlimited' });
    setDialogOpen(true);
    setFormError('');
    setFieldErrors({ name: '', date: '', description: '', venue: '', location: '' });
  };
  const handleClose = () => { setDialogOpen(false); setEditIdx(-1); setFormError(''); setFieldErrors({ name: '', date: '', description: '', venue: '', location: '' }); };
  const handleChange = e => setEventData({ ...eventData, [e.target.name]: e.target.value });
  async function handleSave() {
    const errors = validateEvent(eventData);
    setFieldErrors(errors);
    setFormError('');
    if (Object.values(errors).some(Boolean)) {
      setFormError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editIdx >= 0) {
        await axios.put(`/api/events/${events[editIdx]._id}`, eventData, config);
      } else {
        await axios.post('/api/events', eventData, config);
      }
      fetchEvents();
      handleClose();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  }
  async function handleDelete(idx) {
    if (window.confirm('Delete this event?')) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`/api/events/${events[idx]._id}`, config);
        fetchEvents();
      } finally {
        setLoading(false);
      }
    }
  }

  function handleFilterChange(e) {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  }

  // Filtered events
  const filteredEvents = events.filter(event => {
    const nameMatch = filter.name === '' || event.name.toLowerCase().includes(filter.name.toLowerCase());
    const yearMatch = filter.year === '' || getYear(event.date) === filter.year;
    const typeMatch = filter.type === '' || event.eventType === filter.type;
    return nameMatch && yearMatch && typeMatch;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>Events Management</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ fontWeight: 700 }}>Add Event</Button>
      </Box>
      {/* Filter UI */}
      <Paper elevation={2} sx={{ mb: 3, p: 2, borderRadius: 3, background: '#fff7f0', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Event Name"
          name="name"
          value={filter.name}
          onChange={handleFilterChange}
          size="small"
          sx={{ minWidth: 180 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="year-label">Year</InputLabel>
          <Select
            labelId="year-label"
            name="year"
            value={filter.year}
            label="Year"
            onChange={handleFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            {eventYears.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            name="type"
            value={filter.type}
            label="Type"
            onChange={handleFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="unlimited">Unlimited</MenuItem>
            <MenuItem value="limited">Limited</MenuItem>
          </Select>
        </FormControl>
      </Paper>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Venue</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.length === 0 && <TableRow><TableCell colSpan={8}>No events found.</TableCell></TableRow>}
            {filteredEvents.map((event, idx) => (
              <TableRow key={event._id}>
                <TableCell>{event.name}</TableCell>
                <TableCell>{event.date ? new Date(event.date).toLocaleDateString() : ''}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>{event.venue}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{event.imageUrl ? <img src={event.imageUrl} alt="event" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} /> : '-'}</TableCell>
                <TableCell>{event.eventType === 'limited' ? 'Limited' : 'Unlimited'}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpen(idx)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(idx)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editIdx >= 0 ? 'Edit Event' : 'Add Event'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField label="Name" name="name" value={eventData.name} onChange={handleChange} fullWidth sx={{ mb: 2 }} error={!!fieldErrors.name} helperText={fieldErrors.name} />
          <TextField label="Date" name="date" type="date" value={eventData.date} onChange={handleChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} error={!!fieldErrors.date} helperText={fieldErrors.date} />
          <TextField label="Description" name="description" value={eventData.description} onChange={handleChange} fullWidth multiline minRows={2} error={!!fieldErrors.description} helperText={fieldErrors.description} />
          <TextField label="Venue" name="venue" value={eventData.venue} onChange={handleChange} fullWidth sx={{ mb: 2 }} error={!!fieldErrors.venue} helperText={fieldErrors.venue} />
          <TextField label="Location" name="location" value={eventData.location} onChange={handleChange} fullWidth sx={{ mb: 2 }} error={!!fieldErrors.location} helperText={fieldErrors.location} />
          <TextField label="Image URL" name="imageUrl" value={eventData.imageUrl} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="event-type-label">Event Type</InputLabel>
            <Select labelId="event-type-label" name="eventType" value={eventData.eventType} label="Event Type" onChange={handleChange}>
              <MenuItem value="unlimited">Unlimited (auto-approve)</MenuItem>
              <MenuItem value="limited">Limited (admin approval)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const tabList = [
    { label: 'User Registration Requests', icon: <PeopleIcon /> },
    { label: 'Events Management', icon: <EventIcon /> },
    { label: 'Event Registrations', icon: <AssignmentIcon /> },
    { label: 'Event Users', icon: <GroupIcon /> },
  ];
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar for desktop, Drawer for mobile */}
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
      {/* Drawer for mobile */}
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
      {/* Main content */}
      <Box sx={{ flex: 1, p: { xs: 1, md: 3 } }}>
        {/* Mobile menu icon */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>
            {tabList[tab].label}
          </Typography>
        </Box>
        {tab === 0 && <AdminRequestsContent />}
        {tab === 1 && <EventsManagement />}
        {tab === 2 && <EventRegistrationsApproval />}
        {tab === 3 && <EventUsersTab />}
      </Box>
    </Box>
  );
}

function AdminRequestsContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [touched, setTouched] = useState<{[k: string]: boolean}>({});
  const [filter, setFilter] = useState({
    name: '',
    mobile: '',
    email: '',
    isSelected: '',
    isAdmin: '',
    dateFrom: '',
    dateTo: '',
  });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Validation functions (ported from Join.tsx)
  function validateEmail(email: string) {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function validateMobile(mobile: string) {
    return /^\d{10}$/.test(mobile);
  }
  function validateAge(age: string) {
    const n = Number(age);
    return n >= 1 && n <= 120;
  }
  const errors: {[k: string]: string} = {};
  if (!editData.firstName?.trim()) errors.firstName = 'First name is required.';
  if (!editData.lastName?.trim()) errors.lastName = 'Last name is required.';
  if (!validateMobile(editData.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.';
  if (!editData.place?.trim()) errors.place = 'Place is required.';
  if (!editData.gender) errors.gender = 'Gender is required.';
  if (!validateAge(editData.age)) errors.age = 'Enter a valid age (1-120).';
  if (!editData.preferredLang) errors.preferredLang = 'Preferred language is required.';
  if (!editData.refSource?.trim()) errors.refSource = 'Reference source is required.';
  if (!editData.referrerInfo?.trim()) errors.referrerInfo = 'Referrer info is required.';
  if (!editData.country?.trim()) errors.country = 'Country is required.';
  if (editData.email && !validateEmail(editData.email)) errors.email = 'Enter a valid email address.';
  const isFormValid = Object.keys(errors).length === 0;

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(userId) {
    try {
      await approveUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to approve user');
    }
  }

  async function handleReject(userId) {
    if (!window.confirm('Are you sure you want to reject this user?')) return;
    try {
      await rejectUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to reject user');
    }
  }

  function handleEditOpen(user) {
    setEditUser(user);
    setEditData(user);
    setEditError('');
    setTouched({});
  }
  function handleEditChange(e) {
    setEditData({ ...editData, [e.target.name]: e.target.value });
    setTouched(t => ({ ...t, [e.target.name]: true }));
  }
  function handleEditBlur(field: string) {
    setTouched(t => ({ ...t, [field]: true }));
  }
  async function handleEditSave() {
    setEditLoading(true);
    setEditError('');
    if (!isFormValid) {
      setTouched({
        firstName: true, lastName: true, mobile: true, place: true, gender: true, age: true, preferredLang: true, refSource: true, referrerInfo: true, country: true, email: true
      });
      setEditError('Please fill all required fields correctly.');
      setEditLoading(false);
      return;
    }
    try {
      await updateUser(editUser._id, editData);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setEditError(err.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  }
  function handleEditClose() {
    setEditUser(null);
    setEditError('');
    setTouched({});
  }

  function handleFilterChange(e) {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  }

  function handleDateChange(e) {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  }

  function handleSelectRow(userId: string) {
    setSelectedRows(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  }
  function handleSelectAllRows(e) {
    if (e.target.checked) {
      setSelectedRows(filteredUsers.map(u => u._id));
    } else {
      setSelectedRows([]);
    }
  }
  async function handleBulkApprove() {
    for (const userId of selectedRows) {
      await approveUser(userId);
    }
    setSelectedRows([]);
    fetchUsers();
  }
  async function handleBulkReject() {
    for (const userId of selectedRows) {
      await rejectUser(userId);
    }
    setSelectedRows([]);
    fetchUsers();
  }

  // Filter users based on filter state
  const filteredUsers = users.filter(user => {
    const nameMatch = filter.name === '' || (`${user.firstName} ${user.lastName}`.toLowerCase().includes(filter.name.toLowerCase()));
    const mobileMatch = filter.mobile === '' || (user.mobile && user.mobile.includes(filter.mobile));
    const emailMatch = filter.email === '' || (user.email && user.email.toLowerCase().includes(filter.email.toLowerCase()));
    const isSelectedMatch = filter.isSelected === '' || (filter.isSelected === 'yes' ? user.isSelected : !user.isSelected);
    const isAdminMatch = filter.isAdmin === '' || (filter.isAdmin === 'yes' ? user.isAdmin : !user.isAdmin);
    let dateMatch = true;
    if (filter.dateFrom) {
      dateMatch = dateMatch && new Date(user.createdAt) >= new Date(filter.dateFrom);
    }
    if (filter.dateTo) {
      dateMatch = dateMatch && new Date(user.createdAt) <= new Date(filter.dateTo);
    }
    return nameMatch && mobileMatch && emailMatch && isSelectedMatch && isAdminMatch && dateMatch;
  });

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>User Registration Requests</Typography>
      {/* Filter Section */}
      <Paper elevation={2} className="admin-filter-paper" sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3, background: '#fff7f0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField label="Name" name="name" value={filter.name} onChange={handleFilterChange} size="small" fullWidth sx={{ fontFamily: 'Lora, serif' }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField label="Mobile" name="mobile" value={filter.mobile} onChange={handleFilterChange} size="small" fullWidth sx={{ fontFamily: 'Lora, serif' }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField label="Email" name="email" value={filter.email} onChange={handleFilterChange} size="small" fullWidth sx={{ fontFamily: 'Lora, serif' }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth sx={{ minWidth: 180 }}>
              <InputLabel id="status-label" sx={{ fontFamily: 'Lora, serif' }}>Status</InputLabel>
              <Select labelId="status-label" label="Status" name="isSelected" value={filter.isSelected || ''} onChange={handleFilterChange} sx={{ fontFamily: 'Lora, serif' }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="yes">Approved</MenuItem>
                <MenuItem value="no">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth sx={{ minWidth: 180 }}>
              <InputLabel id="admin-label" sx={{ fontFamily: 'Lora, serif' }}>Admin</InputLabel>
              <Select labelId="admin-label" label="Admin" name="isAdmin" value={filter.isAdmin || ''} onChange={handleFilterChange} sx={{ fontFamily: 'Lora, serif' }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField label="From" name="dateFrom" type="date" value={filter.dateFrom} onChange={handleDateChange} size="small" InputLabelProps={{ shrink: true, style: { fontFamily: 'Lora, serif' } }} fullWidth sx={{ fontFamily: 'Lora, serif' }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField label="To" name="dateTo" type="date" value={filter.dateTo} onChange={handleDateChange} size="small" InputLabelProps={{ shrink: true, style: { fontFamily: 'Lora, serif' } }} fullWidth sx={{ fontFamily: 'Lora, serif' }} />
          </Grid>
        </Grid>
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {/* Bulk Approve/Reject Buttons */}
      {selectedRows.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="success" onClick={handleBulkApprove}>Approve Selected</Button>
          <Button variant="contained" color="error" onClick={handleBulkReject}>Reject Selected</Button>
        </Box>
      )}
      <TableContainer component={Paper} elevation={3} className="admin-table-container" sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#fff7f0' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedRows.length > 0 && selectedRows.length < filteredUsers.length}
                  checked={filteredUsers.length > 0 && selectedRows.length === filteredUsers.length}
                  onChange={handleSelectAllRows}
                  inputProps={{ 'aria-label': 'select all users' }}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Place</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Gender</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Age</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Preferred Lang</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Ref Source</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Referrer Info</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Country</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Profession</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Comment</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>isSelected</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>isAdmin</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user, idx) => (
              <TableRow key={user._id} hover sx={{ background: idx % 2 === 0 ? '#fff' : '#f9f4ee', transition: 'background 0.2s' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRows.includes(user._id)}
                    onChange={() => handleSelectRow(user._id)}
                    inputProps={{ 'aria-label': `select user ${user.firstName} ${user.lastName}` }}
                  />
                </TableCell>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.mobile}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.place}</TableCell>
                <TableCell>{user.gender}</TableCell>
                <TableCell>{user.age}</TableCell>
                <TableCell>{user.preferredLang}</TableCell>
                <TableCell>{user.refSource}</TableCell>
                <TableCell>{user.referrerInfo}</TableCell>
                <TableCell>{user.country}</TableCell>
                <TableCell>{user.profession}</TableCell>
                <TableCell>{user.address}</TableCell>
                <TableCell>{user.comment}</TableCell>
                <TableCell>{user.isSelected ? 'Yes' : 'No'}</TableCell>
                <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  {!user.isSelected && !user.isAdmin && (
                    <>
                      <Button size="small" color="success" variant="contained" onClick={() => handleApprove(user._id)}>Approve</Button>
                      <Button size="small" color="error" variant="contained" onClick={() => handleReject(user._id)} sx={{ ml: 1 }}>Reject</Button>
                    </>
                  )}
                  <Button size="small" onClick={() => handleEditOpen(user)} sx={{ ml: 1 }}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!editUser} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          {editUser && (
            <Box component="form" sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="First Name" name="firstName" value={editData.firstName || ''} onChange={handleEditChange} onBlur={() => handleEditBlur('firstName')} fullWidth required error={!!touched.firstName && !!errors.firstName} helperText={touched.firstName && errors.firstName} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Last Name" name="lastName" value={editData.lastName || ''} onChange={handleEditChange} onBlur={() => handleEditBlur('lastName')} fullWidth required error={!!touched.lastName && !!errors.lastName} helperText={touched.lastName && errors.lastName} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Mobile" name="mobile" value={editData.mobile || ''} onChange={handleEditChange} onBlur={() => handleEditBlur('mobile')} fullWidth required inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }} error={!!touched.mobile && !!errors.mobile} helperText={touched.mobile && errors.mobile} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email (optional)" name="email" value={editData.email || ''} onChange={handleEditChange} onBlur={() => handleEditBlur('email')} type="email" fullWidth error={!!touched.email && !!errors.email} helperText={touched.email && errors.email} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Place" name="place" value={editData.place || ''} onChange={handleEditChange} onBlur={() => handleEditBlur('place')} fullWidth required error={!!touched.place && !!errors.place} helperText={touched.place && errors.place} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Gender" name="gender" value={editData.gender || ''} onChange={handleEditChange} onBlur={() => handleEditBlur('gender')} fullWidth required error={!!touched.gender && !!errors.gender} helperText={touched.gender && errors.gender} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Age" name="age" value={editData.age || ''} onChange={handleEditChange} onBlur={() => handleEditBlur('age')} type="number" fullWidth required inputProps={{ min: 1, max: 120 }} error={!!touched.age && !!errors.age} helperText={touched.age && errors.age} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Preferred Language" name="preferredLang" value={editData.preferredLang || ''} onChange={handleEditChange} onBlur={() => handleEditBlur('preferredLang')} fullWidth required error={!!touched.preferredLang && !!errors.preferredLang} helperText={touched.preferredLang && errors.preferredLang} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Ref Source" name="refSource" value={editData.refSource || ''} onChange={handleEditChange} onBlur={() => handleEditBlur('refSource')} fullWidth required error={!!touched.refSource && !!errors.refSource} helperText={touched.refSource && errors.refSource} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Referrer Info" name="referrerInfo" value={editData.referrerInfo || ''} onChange={handleEditChange} onBlur={() => handleEditBlur('referrerInfo')} fullWidth required error={!!touched.referrerInfo && !!errors.referrerInfo} helperText={touched.referrerInfo && errors.referrerInfo} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Country" name="country" value={editData.country || ''} onChange={handleEditChange} onBlur={() => handleEditBlur('country')} fullWidth required error={!!touched.country && !!errors.country} helperText={touched.country && errors.country} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Profession (optional)" name="profession" value={editData.profession || ''} onChange={handleEditChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Address (optional)" name="address" value={editData.address || ''} onChange={handleEditChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Comment (optional)" name="comment" value={editData.comment || ''} onChange={handleEditChange} fullWidth />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} disabled={editLoading || !isFormValid} variant="contained">{editLoading ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function EventRegistrationsApproval() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    eventName: '',
    eventType: '',
    status: '',
    registrant: '',
    mobile: '',
    gender: '',
    sksLevel: '',
    dateFrom: '',
    dateTo: ''
  });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/event-registrations', config);
      // Only show registrations for events that require approval (eventType: 'limited')
      setRegistrations(res.data.filter((reg: any) => reg.eventId && reg.eventId.eventType === 'limited'));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch event registrations');
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(e: any) {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  }

  // Filter registrations based on filter state
  const filteredRegistrations = registrations.filter((reg: any) => {
    const eventNameMatch = filter.eventName === '' || (reg.eventId && reg.eventId.name && reg.eventId.name.toLowerCase().includes(filter.eventName.toLowerCase()));
    const eventTypeMatch = filter.eventType === '' || (reg.eventId && reg.eventId.eventType === filter.eventType);
    const statusMatch = filter.status === '' || reg.status === filter.status;
    const registrantMatch = filter.registrant === '' || (reg.fullName && reg.fullName.toLowerCase().includes(filter.registrant.toLowerCase()));
    const mobileMatch = filter.mobile === '' || (reg.mobile && reg.mobile.includes(filter.mobile));
    const genderMatch = filter.gender === '' || reg.gender === filter.gender;
    const sksLevelMatch = filter.sksLevel === '' || reg.sksLevel === filter.sksLevel;
    let dateMatch = true;
    if (filter.dateFrom) {
      dateMatch = dateMatch && new Date(reg.eventDate) >= new Date(filter.dateFrom);
    }
    if (filter.dateTo) {
      dateMatch = dateMatch && new Date(reg.eventDate) <= new Date(filter.dateTo);
    }
    return eventNameMatch && eventTypeMatch && statusMatch && registrantMatch && mobileMatch && genderMatch && sksLevelMatch && dateMatch;
  });

  async function handleApprove(regId: string) {
    try {
      await axios.put(`/api/event-registrations/${regId}/approve`, {}, config);
      fetchRegistrations();
    } catch (err) {
      alert('Failed to approve registration');
    }
  }
  async function handleReject(regId: string) {
    try {
      await axios.put(`/api/event-registrations/${regId}/reject`, {}, config);
      fetchRegistrations();
    } catch (err) {
      alert('Failed to reject registration');
    }
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>Event Registrations (Approval Required)</Typography>
      {/* Filter UI */}
      <Paper elevation={2} sx={{ mb: 3, p: 2, borderRadius: 3, background: '#fff7f0', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField label="Event Name" name="eventName" value={filter.eventName} onChange={handleFilterChange} size="small" sx={{ minWidth: 160 }} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="event-type-label">Event Type</InputLabel>
          <Select labelId="event-type-label" name="eventType" value={filter.eventType} label="Event Type" onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="unlimited">Unlimited</MenuItem>
            <MenuItem value="limited">Limited</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="status-label">Status</InputLabel>
          <Select labelId="status-label" name="status" value={filter.status} label="Status" onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Registrant Name" name="registrant" value={filter.registrant} onChange={handleFilterChange} size="small" sx={{ minWidth: 140 }} />
        <TextField label="Mobile" name="mobile" value={filter.mobile} onChange={handleFilterChange} size="small" sx={{ minWidth: 120 }} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="gender-label">Gender</InputLabel>
          <Select labelId="gender-label" name="gender" value={filter.gender} label="Gender" onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="sks-level-label">SKS Level</InputLabel>
          <Select labelId="sks-level-label" name="sksLevel" value={filter.sksLevel} label="SKS Level" onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Level-5.1">Level-5.1</MenuItem>
            <MenuItem value="Level-5">Level-5</MenuItem>
            <MenuItem value="Level-4">Level-4</MenuItem>
            <MenuItem value="Level-3">Level-3</MenuItem>
            <MenuItem value="Level-2">Level-2</MenuItem>
            <MenuItem value="Level-1">Level-1</MenuItem>
            <MenuItem value="Not done any Level">Not done any Level</MenuItem>
          </Select>
        </FormControl>
        <TextField label="From" name="dateFrom" type="date" value={filter.dateFrom} onChange={handleFilterChange} size="small" InputLabelProps={{ shrink: true }} sx={{ minWidth: 120 }} />
        <TextField label="To" name="dateTo" type="date" value={filter.dateTo} onChange={handleFilterChange} size="small" InputLabelProps={{ shrink: true }} sx={{ minWidth: 120 }} />
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Registrant</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Registration ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRegistrations.length === 0 && (
              <TableRow><TableCell colSpan={8}>No registrations found.</TableCell></TableRow>
            )}
            {filteredRegistrations.map(reg => (
              <TableRow key={reg._id}>
                <TableCell>{reg.eventId?.name}</TableCell>
                <TableCell>{reg.eventId?.date ? new Date(reg.eventId.date).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{reg.fullName || '-'}</TableCell>
                <TableCell>{reg.mobile || '-'}</TableCell>
                <TableCell style={{ fontWeight: 700 }}>{reg.registeredId || reg.registrationId || '-'}</TableCell>
                <TableCell style={{ color: reg.status === 'approved' ? 'green' : reg.status === 'pending' ? '#b45309' : reg.status === 'rejected' ? 'red' : undefined, fontWeight: 700 }}>
                  {reg.status ? (reg.status.charAt(0).toUpperCase() + reg.status.slice(1)) : 'N/A'}
                </TableCell>
                <TableCell>
                  <div style={{ fontSize: 13 }}>
                    <div><b>Gender:</b> {reg.gender || '-'}</div>
                    <div><b>Age:</b> {reg.age || '-'}</div>
                    <div><b>Profession:</b> {reg.profession || '-'}</div>
                    <div><b>Address:</b> {reg.address || '-'}</div>
                    <div><b>SKS Level:</b> {reg.sksLevel || '-'}</div>
                    <div><b>Miracles:</b> {reg.sksMiracle || '-'}</div>
                    <div><b>Other:</b> {reg.otherDetails || '-'}</div>
                    <div><b>For:</b> {reg.forWhom === 'self' ? 'Myself' : reg.forWhom === 'other' ? 'Someone Else' : '-'}</div>
                  </div>
                  {(['fullName','mobile','gender','age','address','sksLevel','sksMiracle','forWhom'].some(f => !reg[f] || reg[f] === '-')) &&
                    <div style={{ color: 'red', fontSize: 11 }}>Warning: Some required fields are missing in this registration.</div>
                  }
                </TableCell>
                <TableCell>
                  {reg.status === 'pending' && (
                    <>
                      <Button size="small" color="success" variant="contained" onClick={() => handleApprove(reg.registrationId || reg.registeredId)}>Approve</Button>
                      <Button size="small" color="error" variant="contained" onClick={() => handleReject(reg.registrationId || reg.registeredId)} sx={{ ml: 1 }}>Reject</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function EventUsersTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [filter, setFilter] = useState({ name: '', mobile: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [eventsRes, regsRes] = await Promise.all([
          axios.get('/api/events'),
          axios.get('/api/event-registrations', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        ]);
        setEvents(eventsRes.data);
        setRegistrations(regsRes.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleEventChange = (e: any) => setSelectedEvent(e.target.value);
  const handleFilterChange = (e: any) => setFilter({ ...filter, [e.target.name]: e.target.value });

  // Filter registrations for selected event
  const filteredRegs = registrations.filter((reg: any) => {
    const eventMatch = !selectedEvent || (reg.eventId && reg.eventId._id === selectedEvent);
    const nameMatch = filter.name === '' || (reg.fullName && reg.fullName.toLowerCase().includes(filter.name.toLowerCase()));
    const mobileMatch = filter.mobile === '' || (reg.mobile && reg.mobile.includes(filter.mobile));
    const statusMatch = filter.status === '' || reg.status === filter.status;
    return eventMatch && nameMatch && mobileMatch && statusMatch;
  });

  function handleDownloadExcel() {
    const data = filteredRegs.map((reg: any) => ({
      'Event': reg.eventId?.name,
      'Date': reg.eventId?.date ? new Date(reg.eventId.date).toLocaleDateString() : '-',
      'User Name': reg.fullName,
      'Mobile': reg.mobile,
      'Email': reg.user?.email || '-',
      'Registration ID': reg.registrationId,
      'Status': reg.status,
      'Gender': reg.gender,
      'Age': reg.age,
      'Profession': reg.profession,
      'Address': reg.address,
      'SKS Level': reg.sksLevel,
      'Miracles': reg.sksMiracle,
      'For': reg.forWhom === 'self' ? 'Myself' : 'Someone Else',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Event Users');
    XLSX.writeFile(wb, 'event_users.xlsx');
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>Event Users</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="success" onClick={handleDownloadExcel} disabled={filteredRegs.length === 0}>
          Download Excel
        </Button>
      </Box>
      <Paper elevation={2} sx={{ mb: 3, p: 2, borderRadius: 3, background: '#fff7f0', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="event-select-label">Select Event</InputLabel>
          <Select
            labelId="event-select-label"
            value={selectedEvent}
            label="Select Event"
            onChange={handleEventChange}
          >
            <MenuItem value="">All Events</MenuItem>
            {events.map(ev => <MenuItem key={ev._id} value={ev._id}>{ev.name} ({ev.date ? new Date(ev.date).toLocaleDateString() : ''})</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="User Name" name="name" value={filter.name} onChange={handleFilterChange} size="small" sx={{ minWidth: 160 }} />
        <TextField label="Mobile" name="mobile" value={filter.mobile} onChange={handleFilterChange} size="small" sx={{ minWidth: 140 }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="status-label">Status</InputLabel>
          <Select labelId="status-label" name="status" value={filter.status} label="Status" onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Paper>
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Registration ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRegs.length === 0 && <TableRow><TableCell colSpan={8}>No users found for this event.</TableCell></TableRow>}
              {filteredRegs.map((reg: any) => (
                <TableRow key={reg.registrationId}>
                  <TableCell>{reg.eventId?.name}</TableCell>
                  <TableCell>{reg.eventId?.date ? new Date(reg.eventId.date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{reg.fullName}</TableCell>
                  <TableCell>{reg.mobile}</TableCell>
                  <TableCell>{reg.user?.email || '-'}</TableCell>
                  <TableCell>{reg.registrationId}</TableCell>
                  <TableCell style={{ color: reg.status === 'approved' ? 'green' : reg.status === 'pending' ? '#b45309' : 'red', fontWeight: 700 }}>
                    {reg.status ? (reg.status.charAt(0).toUpperCase() + reg.status.slice(1)) : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: 13 }}>
                      <div><b>Gender:</b> {reg.gender}</div>
                      <div><b>Age:</b> {reg.age}</div>
                      <div><b>Profession:</b> {reg.profession || '-'}</div>
                      <div><b>Address:</b> {reg.address}</div>
                      <div><b>SKS Level:</b> {reg.sksLevel}</div>
                      <div><b>Miracles:</b> {reg.sksMiracle}</div>
                      <div><b>For:</b> {reg.forWhom === 'self' ? 'Myself' : 'Someone Else'}</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
} 