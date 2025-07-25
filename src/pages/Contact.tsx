import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import { Box, Typography, TextField, Button, Alert, MenuItem } from '@mui/material';
import { register as apiRegister } from '../services/api.ts';

export default function Contact() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [place, setPlace] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [preferredLang, setPreferredLang] = useState('');
  const [refSource, setRefSource] = useState('');
  const [referrerInfo, setReferrerInfo] = useState('');
  const [country, setCountry] = useState('');
  const [profession, setProfession] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!firstName.trim() || !lastName.trim() || !/^\d{10}$/.test(mobile) || !place.trim() || !gender || !age || !preferredLang || !refSource.trim() || !referrerInfo.trim() || !country.trim()) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      await apiRegister(mobile, firstName, lastName, comment, email, place, gender, Number(age), preferredLang, refSource, referrerInfo, country, profession, address);
      setSuccess('Thank you! Your message has been sent.');
      setFirstName(''); setLastName(''); setMobile(''); setEmail(''); setComment(''); setMessage(''); setPlace(''); setGender(''); setAge(''); setPreferredLang(''); setRefSource(''); setReferrerInfo(''); setCountry(''); setProfession(''); setAddress('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <Grid container spacing={0} alignItems="flex-start" justifyContent="center" sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Left: Text Content */}
        <Grid item xs={12} md={5} sx={{ px: { xs: 2, md: 6 }, mb: { xs: 4, md: 0 }, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-start', position: 'relative' }}>
            <Typography variant="h2" sx={{ fontFamily: 'Lora, serif', fontStyle: 'italic', color: '#de6b2f', fontWeight: 400, fontSize: { xs: '2rem', md: '2.2rem' }, mb: 2, lineHeight: 1.1, letterSpacing: 0 }}>
              Join / Contact Us
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Lora, serif', fontSize: { xs: '1.1rem', md: '1.15rem' }, color: '#222', mb: 4, maxWidth: 520 }}>
              Reach out to join our programs, ask questions, or connect with our community. We look forward to hearing from you!
            </Typography>
            {/* Decorative lotus SVG bottom left */}
            <Box sx={{ position: 'absolute', left: -40, bottom: -20, opacity: 0.13, zIndex: 1, display: { xs: 'none', md: 'block' } }}>
              <img src="https://yogananda.org/craft-public-storage/lotus-5_orange_light.svg" alt="lotus" width={140} height={140} style={{ maxWidth: '100%' }} />
            </Box>
            {/* Divider line */}
            <Box sx={{ width: 80, height: 2, background: '#de6b2f', mt: 4, mb: 0, display: { xs: 'none', md: 'block' } }} />
          </Box>
        </Grid>
        {/* Right: Contact Form */}
        <Grid item xs={12} md={7}>
          <Box sx={{ p: { xs: 2, md: 4 }, background: '#fff7f0', borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', maxWidth: 600, mx: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <TextField label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} fullWidth required sx={{ mb: 2 }} />
              <TextField label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} fullWidth required sx={{ mb: 2 }} />
              <TextField label="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} fullWidth required sx={{ mb: 2 }} inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }} />
              <TextField label="Place" value={place} onChange={e => setPlace(e.target.value)} fullWidth required sx={{ mb: 2 }} />
              <TextField label="Gender" value={gender} onChange={e => setGender(e.target.value)} select fullWidth required sx={{ mb: 2 }}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <TextField label="Age" value={age} onChange={e => setAge(e.target.value)} type="number" fullWidth required sx={{ mb: 2 }} inputProps={{ min: 1, max: 120 }} />
              <TextField label="Preferred Language" value={preferredLang} onChange={e => setPreferredLang(e.target.value)} select fullWidth required sx={{ mb: 2 }}>
                <MenuItem value="Telugu">Telugu</MenuItem>
                <MenuItem value="English">English</MenuItem>
              </TextField>
              <TextField label="Reference Source" value={refSource} onChange={e => setRefSource(e.target.value)} fullWidth required sx={{ mb: 2 }} />
              <TextField label="Referrer Info" value={referrerInfo} onChange={e => setReferrerInfo(e.target.value)} fullWidth required sx={{ mb: 2 }} />
              <TextField label="Country" value={country} onChange={e => setCountry(e.target.value)} fullWidth required sx={{ mb: 2 }} />
              <TextField label="Profession (optional)" value={profession} onChange={e => setProfession(e.target.value)} fullWidth sx={{ mb: 2 }} />
              <TextField label="Address (optional)" value={address} onChange={e => setAddress(e.target.value)} fullWidth sx={{ mb: 2 }} />
              <TextField label="Email (optional)" value={email} onChange={e => setEmail(e.target.value)} type="email" fullWidth sx={{ mb: 2 }} />
              <TextField label="Comment (optional)" value={comment} onChange={e => setComment(e.target.value)} fullWidth sx={{ mb: 2 }} />
              <TextField label="Message (optional)" value={message} onChange={e => setMessage(e.target.value)} multiline rows={4} fullWidth sx={{ mb: 2 }} />
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600, width: '100%' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </Box>
        </Grid>
      </Grid>
      {/* Lotus SVG background for mobile */}
      <Box sx={{ position: 'absolute', left: 0, bottom: 0, opacity: 0.1, zIndex: 0, display: { xs: 'block', md: 'none' } }}>
        <img src="https://yogananda.org/craft-public-storage/lotus-5_orange_light.svg" alt="lotus" width={120} height={120} style={{ maxWidth: '100%' }} />
      </Box>
    </main>
  );
}
