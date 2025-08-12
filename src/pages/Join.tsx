import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { Box, Typography, TextField, Button, Alert, MenuItem, Divider, Stepper, Step, StepLabel } from '@mui/material';
import { register as apiRegister } from '../services/api.ts';
import { useNavigate } from 'react-router-dom';

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

export default function Join({ handleLogin }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [step, setStep] = useState(0);
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
  const [refSourceOther, setRefSourceOther] = useState('');
  const [referrerInfo, setReferrerInfo] = useState('');
  const [country, setCountry] = useState('');
  const [profession, setProfession] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<{[k: string]: boolean}>({});

  const steps = ['Personal Details', 'Other Details'];

  // Validation logic
  const errors: {[k: string]: string} = {};
  if (!firstName.trim()) errors.firstName = 'First name is required.';
  if (!lastName.trim()) errors.lastName = 'Last name is required.';
  if (!validateMobile(mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.';
  if (!place.trim()) errors.place = 'Place is required.';
  if (!gender) errors.gender = 'Gender is required.';
  if (!validateAge(age)) errors.age = 'Enter a valid age (1-120).';
  if (!preferredLang) errors.preferredLang = 'Preferred language is required.';
  if (!refSource.trim() || (refSource === 'Others' && !refSourceOther.trim())) errors.refSource = 'Reference source is required.';
  if (!referrerInfo.trim()) errors.referrerInfo = 'Referrer info is required.';
  if (!country.trim()) errors.country = 'Country is required.';
  if (email && !validateEmail(email)) errors.email = 'Enter a valid email address.';

  const personalDetailsErrors = ['firstName', 'lastName', 'mobile', 'email', 'gender', 'age', 'preferredLang', 'country'];
  const otherDetailsErrors = ['place', 'refSource', 'referrerInfo'];
  
  const isPersonalDetailsValid = personalDetailsErrors.every(field => !errors[field]);
  const isOtherDetailsValid = otherDetailsErrors.every(field => !errors[field]);
  const isFormValid = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => setTouched(t => ({ ...t, [field]: true }));

  const handleNext = () => {
    const personalFields = { firstName: true, lastName: true, mobile: true, gender: true, age: true, preferredLang: true, country: true, email: true };
    setTouched(t => ({ ...t, ...personalFields }));
    if (isPersonalDetailsValid) {
      setStep(1);
      setError('');
    } else {
      setError('Please fill all required personal details correctly.');
    }
  };

  const handleBack = () => {
    setStep(0);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!isFormValid) {
      setTouched({
        firstName: true, lastName: true, mobile: true, place: true, gender: true, age: true, preferredLang: true, refSource: true, referrerInfo: true, country: true, email: true
      });
      setError('Please fill all required fields correctly.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiRegister({
        mobile,
        firstName,
        lastName,
        comment,
        email,
        place,
        gender,
        age,
        preferredLang,
        refSource: refSource === 'Others' ? refSourceOther : refSource,
        referrerInfo,
        country,
        profession,
        address,
        message
      });
      setSuccess('Thank you for joining! Your details have been submitted.');
      if (handleLogin && res && res.user && res.token) {
        handleLogin(res.user, res.token);
      }
      setFirstName(''); setLastName(''); setMobile(''); setEmail(''); setComment(''); setMessage(''); setPlace(''); setGender(''); setAge(''); setPreferredLang(''); setRefSource(''); setRefSourceOther(''); setReferrerInfo(''); setCountry(''); setProfession(''); setAddress(''); setTouched({});
      setTimeout(() => {
        navigate('/', { state: { registered: true } });
      }, 1200);
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        setError('A user with this mobile number already exists. Please login or use a different number.');
      } else {
        setError(err.message || 'Failed to submit.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <Grid container spacing={0} alignItems="flex-start" justifyContent="center" sx={{ maxWidth: 1400, mx: 'auto', py: { xs: 3, md: 6 } }}>
        {/* Left: Text Content */}
        <Grid item xs={12} lg={4} md={12} sx={{ px: { xs: 2, lg: 6 }, mb: { xs: 4, lg: 0 }, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-start', position: 'relative' }}>
            <Typography variant="h2" sx={{ fontFamily: 'Lora, serif', fontStyle: 'italic', color: '#de6b2f', fontWeight: 400, fontSize: { xs: '2rem', md: '2.2rem' }, mb: 2, lineHeight: 1.1, letterSpacing: 0 }}>
              Join Us
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Lora, serif', fontSize: { xs: '1.1rem', md: '1.15rem' }, color: '#222', mb: 4, maxWidth: 520 }}>
              Siva Kundalini Sadhana, taught by Poojya Gurudev Sri Jeeveswara Yogi, is the safest and structured approach to Kundalini Awakening through Samadhi Meditation. This priceless knowledge is offered for Free to everyone.
              Please fill-in your details for you to get registered for Siva Kundalini Sadhana Classes.
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Lora, serif', fontSize: { xs: '1.1rem', md: '1.15rem' }, color: '#222', mb: 4, maxWidth: 520 }}>
              In case of any challenges filling the details, please WhatsApp/Call : +91 7801046111
            </Typography>
            {/* Decorative lotus SVG bottom left */}
            <Box sx={{ position: 'absolute', left: -40, bottom: -20, opacity: 0.13, zIndex: 1, display: { xs: 'none', md: 'block' } }}>
              <img src="https://yogananda.org/craft-public-storage/lotus-5_orange_light.svg" alt="lotus" width={140} height={140} style={{ maxWidth: '100%' }} />
            </Box>
            {/* Divider line */}
            <Box sx={{ width: 80, height: 2, background: '#de6b2f', mt: 4, mb: 0, display: { xs: 'none', md: 'block' } }} />
          </Box>
        </Grid>
        {/* Right: Join Form */}
        <Grid item xs={12} lg={8} md={12}>
          <Box sx={{ p: { xs: 2, md: 4 }, background: '#fff7f0', borderRadius: 3, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', width: '100%' }}>
            {/* Progress Stepper */}
            <Stepper activeStep={step} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#b45309', fontWeight: 500 } }}>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ maxWidth: { xs: '100%', sm: 500, md: 600 }, mx: 'auto' }}>
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                {step === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#b45309', textAlign: 'center' }}>Personal Details</Typography>
                    <Box>
                      <TextField label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} onBlur={() => handleBlur('firstName')} fullWidth required sx={{ mb: 2 }} error={!!touched.firstName && !!errors.firstName} helperText={touched.firstName && errors.firstName} />
                      <TextField label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} onBlur={() => handleBlur('lastName')} fullWidth required sx={{ mb: 2 }} error={!!touched.lastName && !!errors.lastName} helperText={touched.lastName && errors.lastName} />
                      <TextField label="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} onBlur={() => handleBlur('mobile')} fullWidth required sx={{ mb: 2 }} inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }} error={!!touched.mobile && !!errors.mobile} helperText={touched.mobile && errors.mobile} />
                      <TextField label="Email (optional)" value={email} onChange={e => setEmail(e.target.value)} onBlur={() => handleBlur('email')} type="email" fullWidth sx={{ mb: 2 }} error={!!touched.email && !!errors.email} helperText={touched.email && errors.email} />
                      <TextField label="Gender" value={gender} onChange={e => setGender(e.target.value)} onBlur={() => handleBlur('gender')} select fullWidth required sx={{ mb: 2 }} error={!!touched.gender && !!errors.gender} helperText={touched.gender && errors.gender}>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </TextField>
                      <TextField label="Age" value={age} onChange={e => setAge(e.target.value)} onBlur={() => handleBlur('age')} type="number" fullWidth required sx={{ mb: 2 }} inputProps={{ min: 1, max: 120 }} error={!!touched.age && !!errors.age} helperText={touched.age && errors.age} />
                      <TextField label="Preferred Language" value={preferredLang} onChange={e => setPreferredLang(e.target.value)} onBlur={() => handleBlur('preferredLang')} select fullWidth required sx={{ mb: 2 }} error={!!touched.preferredLang && !!errors.preferredLang} helperText={touched.preferredLang && errors.preferredLang}>
                        <MenuItem value="Telugu">Telugu</MenuItem>
                        <MenuItem value="English">English</MenuItem>
                      </TextField>
                      <TextField label="Country" value={country} onChange={e => setCountry(e.target.value)} onBlur={() => handleBlur('country')} fullWidth required sx={{ mb: 2 }} error={!!touched.country && !!errors.country} helperText={touched.country && errors.country} />
                    </Box>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Button onClick={handleNext} variant="contained" color="primary" sx={{ fontWeight: 600, width: '100%', mt: 2, py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}>
                      Next: Other Details
                    </Button>
                  </Box>
                )}

                {step === 1 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#b45309', textAlign: 'center' }}>Other Details</Typography>
                    <Box>
                      <TextField label="Place" value={place} onChange={e => setPlace(e.target.value)} onBlur={() => handleBlur('place')} fullWidth required sx={{ mb: 2 }} error={!!touched.place && !!errors.place} helperText={touched.place && errors.place} />
                      <TextField label="Profession (optional)" value={profession} onChange={e => setProfession(e.target.value)} fullWidth sx={{ mb: 2 }} />
                      <TextField label="Address (optional)" value={address} onChange={e => setAddress(e.target.value)} fullWidth sx={{ mb: 2 }} />
                      <TextField
                        label="Reference Source"
                        value={refSource}
                        onChange={e => { setRefSource(e.target.value); if (e.target.value !== 'Others') setRefSourceOther(''); }}
                        onBlur={() => handleBlur('refSource')}
                        select
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                        error={!!touched.refSource && !!errors.refSource}
                        helperText={touched.refSource && errors.refSource}
                      >
                        <MenuItem value="Friends-Family">Friends-Family</MenuItem>
                        <MenuItem value="SKS YouTube Videos">SKS YouTube Videos</MenuItem>
                        <MenuItem value="Facebook">Facebook</MenuItem>
                        <MenuItem value="Instagram">Instagram</MenuItem>
                        <MenuItem value="Guruji Interview in PMC">Guruji Interview in PMC</MenuItem>
                        <MenuItem value="Guruji Interview in Other Channels">Guruji Interview in Other Channels</MenuItem>
                        <MenuItem value="Others">Others</MenuItem>
                      </TextField>
                      {refSource === 'Others' && (
                        <TextField
                          label="Please specify"
                          value={refSourceOther}
                          onChange={e => setRefSourceOther(e.target.value)}
                          onBlur={() => handleBlur('refSource')}
                          fullWidth
                          required
                          sx={{ mb: 2 }}
                          error={!!touched.refSource && !!errors.refSource}
                          helperText={touched.refSource && errors.refSource}
                        />
                      )}
                      <TextField label="Referrer Info" value={referrerInfo} onChange={e => setReferrerInfo(e.target.value)} onBlur={() => handleBlur('referrerInfo')} fullWidth required sx={{ mb: 2 }} error={!!touched.referrerInfo && !!errors.referrerInfo} helperText={touched.referrerInfo && errors.referrerInfo} />
                      <TextField label="Comment (optional)" value={comment} onChange={e => setComment(e.target.value)} fullWidth sx={{ mb: 2 }} />
                      <TextField label="Message (optional)" value={message} onChange={e => setMessage(e.target.value)} multiline rows={4} fullWidth sx={{ mb: 2 }} />
                    </Box>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
                      <Button onClick={handleBack} variant="outlined" color="primary" sx={{ fontWeight: 600, flex: 1, py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}>
                        Back
                      </Button>
                      <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600, flex: 1, py: 1.5, fontSize: '1.1rem', borderRadius: 2 }} disabled={!isFormValid || loading}>
                        {loading ? 'Submitting...' : 'Join'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </form>
            </Box>
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