import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import AdminFilters from './AdminFilters.tsx';

export default function EventsManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editEvent, setEditEvent] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', date: '', description: '', venue: '', location: '', eventType: 'open' });

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

  async function handleEdit(eventId: string) {
    const event = events.find(e => e._id === eventId);
    if (event) {
      setEditEvent(event);
      setEditForm({
        name: event.name || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        description: event.description || '',
        venue: event.venue || '',
        location: event.location || '',
        eventType: event.eventType || 'open'
      });
    }
  }

  async function handleSaveEdit() {
    try {
      await axios.put(`/api/events/${editEvent._id}`, editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEditEvent(null);
      fetchEvents();
    } catch (err) {
      alert('Failed to update event');
    }
  }

  async function handleDelete(eventId: string) {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchEvents();
    } catch (err) {
      alert('Failed to delete event');
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const name = event.name?.toLowerCase() || '';
      const description = event.description?.toLowerCase() || '';
      const eventDate = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
      
      return (!filters.name || name.includes(filters.name.toLowerCase())) &&
             (!filters.description || description.includes(filters.description.toLowerCase())) &&
             (!filters.date || eventDate === filters.date);
    });
  }, [events, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filterOptions = [
    { key: 'name', label: 'Event Name', type: 'text' as const },
    { key: 'description', label: 'Description', type: 'text' as const },
    { key: 'date', label: 'Date', type: 'date' as const }
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>
        Events Management
      </Typography>

      <AdminFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
      />

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#fff7f0' }}>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#de6b2f', fontFamily: 'Lora, serif', fontSize: '1rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.length === 0 && <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 3, color: '#666', fontStyle: 'italic' }}>No events found.</TableCell></TableRow>}
            {filteredEvents.map((event, idx) => (
              <TableRow key={event._id} hover sx={{ background: idx % 2 === 0 ? '#fff' : '#f9f4ee', '&:hover': { background: '#fff3e0' } }}>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333', fontWeight: 600 }}>{event.name}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#333' }}>{event.date ? new Date(event.date).toLocaleDateString() : ''}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#666' }}>{event.description}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                  <Button size="small" variant="outlined" onClick={() => handleEdit(event._id)} sx={{ mr: 1, fontSize: '0.8rem' }}>Edit</Button>
                  <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(event._id)} sx={{ fontSize: '0.8rem' }}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editEvent} onClose={() => setEditEvent(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#fff7f0', color: '#de6b2f', fontFamily: 'Lora, serif', fontWeight: 700, fontSize: '1.5rem' }}>
          Edit Event
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              fullWidth
              label="Event Name"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              error={!editForm.name.trim()}
              helperText={!editForm.name.trim() ? 'Event name is required' : ''}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={editForm.date}
              onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
              error={!editForm.date}
              helperText={!editForm.date ? 'Date is required' : ''}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              error={!editForm.description.trim()}
              helperText={!editForm.description.trim() ? 'Description is required' : ''}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Venue"
              value={editForm.venue}
              onChange={(e) => setEditForm(prev => ({ ...prev, venue: e.target.value }))}
              error={!editForm.venue.trim()}
              helperText={!editForm.venue.trim() ? 'Venue is required' : ''}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Location"
              value={editForm.location}
              onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
              error={!editForm.location.trim()}
              helperText={!editForm.location.trim() ? 'Location is required' : ''}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#fff7f0', gap: 1 }}>
          <Button 
            onClick={() => setEditEvent(null)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            disabled={!editForm.name.trim() || !editForm.date || !editForm.description.trim() || !editForm.venue.trim() || !editForm.location.trim()}
            sx={{ 
              borderRadius: 2, 
              px: 3,
              background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
              '&:hover': { background: 'linear-gradient(90deg, #b45309 0%, #de6b2f 100%)' }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}