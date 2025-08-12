import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

export default function EventsManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 700 }}>
        Events Management
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', background: '#fff', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.length === 0 && <TableRow><TableCell colSpan={4}>No events found.</TableCell></TableRow>}
            {events.map((event) => (
              <TableRow key={event._id}>
                <TableCell>{event.name}</TableCell>
                <TableCell>{event.date ? new Date(event.date).toLocaleDateString() : ''}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>
                  <Button size="small">Edit</Button>
                  <Button size="small" color="error">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}