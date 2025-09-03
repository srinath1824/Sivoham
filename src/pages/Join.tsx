import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { Box, Typography, TextField, Button, Alert, MenuItem, Stepper, Step, StepLabel } from '@mui/material';
import { register as apiRegister } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Custom theme to match application styling
const theme = createTheme({
  palette: {
    primary: {
      main: '#de6b2f',
      dark: '#b45309',
    },
    secondary: {
      main: '#b794f4',
    },
    background: {
      default: '#fff7f0',
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#7a7a7a',
    },
  },
  typography: {
    fontFamily: 'Lora, serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.7rem',
            backgroundColor: '#fff',
            fontFamily: 'Lora, serif',
            '& fieldset': {
              borderColor: '#f3e5d8',
            },
            '&:hover fieldset': {
              borderColor: '#de6b2f',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#de6b2f',
            },
          },
          '& .MuiInputLabel-root': {
            fontFamily: 'Lora, serif',
            color: '#7a7a7a',
            '&.Mui-focused': {
              color: '#de6b2f',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Lora, serif',
          fontWeight: 600,
          borderRadius: '0.7rem',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 0 16px rgba(222, 107, 47, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #b45309 0%, #de6b2f 100%)',
          },
        },
        outlined: {
          borderColor: '#de6b2f',
          color: '#de6b2f',
          '&:hover': {
            borderColor: '#b45309',
            backgroundColor: 'rgba(222, 107, 47, 0.04)',
          },
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepLabel-label': {
            fontFamily: 'Lora, serif',
            fontWeight: 500,
            '&.Mui-active': {
              color: '#de6b2f',
              fontWeight: 600,
            },
            '&.Mui-completed': {
              color: '#b45309',
            },
          },
          '& .MuiStepIcon-root': {
            '&.Mui-active': {
              color: '#de6b2f',
            },
            '&.Mui-completed': {
              color: '#b45309',
            },
          },
        },
      },
    },
  },
});

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

export default function Join({ handleLogin }: { handleLogin: any }) {
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
      if (handleLogin && res && (res as any).user && (res as any).token) {
        handleLogin((res as any).user, (res as any).token);
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
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          background: 'linear-gradient(120deg, #fff7f0 0%, #fff 100%)',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative elements */}
        <Box
          sx={{
            position: 'fixed',
            zIndex: -1,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 30%, #b794f4 0%, transparent 60%),
              radial-gradient(circle at 80% 70%, #7f9cf5 0%, transparent 60%),
              radial-gradient(circle at 60% 20%, #f7fafc 0%, transparent 70%)
            `,
            opacity: 0.35,
            pointerEvents: 'none',
          }}
        />
        
        <main className="main-content">
          <Grid container spacing={0} alignItems="flex-start" justifyContent="center" sx={{ maxWidth: 1400, mx: 'auto', py: { xs: 3, md: 6 } }}>
            {/* Left: Text Content */}
            <Grid item xs={12} lg={4} md={12} sx={{ px: { xs: 2, lg: 6 }, mb: { xs: 4, lg: 0 }, position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-start', position: 'relative' }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontFamily: 'Lora, serif', 
                    fontStyle: 'italic', 
                    color: '#de6b2f', 
                    fontWeight: 700, 
                    fontSize: { xs: '2rem', md: '2.5rem' }, 
                    mb: 2, 
                    lineHeight: 1.1, 
                    letterSpacing: '-1px',
                    textShadow: '0 2px 8px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  Join Us
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: 'Lora, serif', 
                    fontSize: { xs: '1.1rem', md: '1.18rem' }, 
                    color: '#222', 
                    mb: 4, 
                    maxWidth: 520,
                    lineHeight: 1.7
                  }}
                >
                  Siva Kundalini Sadhana, taught by Poojya Gurudev Sree Jeeveswara Yogi, is the safest and structured approach to Kundalini Awakening through Samadhi Meditation. This priceless knowledge is offered for Free to everyone.
                  Please fill-in your details for you to get registered for Siva Kundalini Sadhana Classes.
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'Lora, serif', 
                    fontSize: { xs: '1rem', md: '1.05rem' }, 
                    color: '#7a7a7a', 
                    mb: 4, 
                    maxWidth: 520,
                    lineHeight: 1.6
                  }}
                >
                  In case of any challenges filling the details, please WhatsApp/Call : +91 7801046111
                </Typography>
                {/* Decorative lotus SVG bottom left */}
                <Box sx={{ position: 'absolute', left: -40, bottom: -20, opacity: 0.13, zIndex: 1, display: { xs: 'none', md: 'block' } }}>
                  <img src="https://yogananda.org/craft-public-storage/lotus-5_orange_light.svg" alt="lotus" width={140} height={140} style={{ maxWidth: '100%' }} />
                </Box>
                {/* Divider line */}
                <Box sx={{ width: 80, height: 2, background: '#de6b2f', mt: 4, mb: 0, display: { xs: 'none', md: 'block' }, borderRadius: '1px' }} />
              </Box>
            </Grid>
            {/* Right: Join Form */}
            <Grid item xs={12} lg={8} md={12}>
              <Box 
                sx={{ 
                  p: { xs: 2, md: 4 }, 
                  background: '#fff', 
                  borderRadius: '1.5rem', 
                  boxShadow: '0 8px 32px rgba(222, 107, 47, 0.12)', 
                  width: '100%',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(222, 107, 47, 0.02) 0%, rgba(183, 148, 244, 0.02) 100%)',
                    borderRadius: '1.5rem',
                    zIndex: 0,
                  },
                  '& > *': {
                    position: 'relative',
                    zIndex: 1,
                  }
                }}
              >
                {/* Progress Stepper */}
                <Stepper activeStep={step} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

            <Box sx={{ maxWidth: { xs: '100%', sm: 500, md: 600 }, mx: 'auto' }}>
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                {step === 0 && (
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontFamily: 'Lora, serif',
                        fontWeight: 700, 
                        mb: 3, 
                        color: '#de6b2f', 
                        textAlign: 'center',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Personal Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField 
                          label="First Name" 
                          value={firstName} 
                          onChange={e => setFirstName(e.target.value)} 
                          onBlur={() => handleBlur('firstName')} 
                          fullWidth 
                          required 
                          error={!!touched.firstName && !!errors.firstName} 
                          helperText={touched.firstName && errors.firstName}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        />
                        <TextField 
                          label="Last Name" 
                          value={lastName} 
                          onChange={e => setLastName(e.target.value)} 
                          onBlur={() => handleBlur('lastName')} 
                          fullWidth 
                          required 
                          error={!!touched.lastName && !!errors.lastName} 
                          helperText={touched.lastName && errors.lastName}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField 
                          label="Mobile Number" 
                          value={mobile} 
                          onChange={e => setMobile(e.target.value)} 
                          onBlur={() => handleBlur('mobile')} 
                          fullWidth 
                          required 
                          inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }} 
                          error={!!touched.mobile && !!errors.mobile} 
                          helperText={touched.mobile && errors.mobile}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        />
                        <TextField 
                          label="Email (optional)" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          onBlur={() => handleBlur('email')} 
                          type="email" 
                          fullWidth 
                          error={!!touched.email && !!errors.email} 
                          helperText={touched.email && errors.email}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField 
                          label="Gender" 
                          value={gender} 
                          onChange={e => setGender(e.target.value)} 
                          onBlur={() => handleBlur('gender')} 
                          select 
                          fullWidth 
                          required 
                          error={!!touched.gender && !!errors.gender} 
                          helperText={touched.gender && errors.gender}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        >
                          <MenuItem value="Male" sx={{ fontFamily: 'Lora, serif' }}>Male</MenuItem>
                          <MenuItem value="Female" sx={{ fontFamily: 'Lora, serif' }}>Female</MenuItem>
                          <MenuItem value="Other" sx={{ fontFamily: 'Lora, serif' }}>Other</MenuItem>
                        </TextField>
                        <TextField 
                          label="Age" 
                          value={age} 
                          onChange={e => setAge(e.target.value)} 
                          onBlur={() => handleBlur('age')} 
                          type="number" 
                          fullWidth 
                          required 
                          inputProps={{ min: 1, max: 120 }} 
                          error={!!touched.age && !!errors.age} 
                          helperText={touched.age && errors.age}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField 
                          label="Preferred Language" 
                          value={preferredLang} 
                          onChange={e => setPreferredLang(e.target.value)} 
                          onBlur={() => handleBlur('preferredLang')} 
                          select 
                          fullWidth 
                          required 
                          error={!!touched.preferredLang && !!errors.preferredLang} 
                          helperText={touched.preferredLang && errors.preferredLang}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        >
                          <MenuItem value="Telugu" sx={{ fontFamily: 'Lora, serif' }}>Telugu</MenuItem>
                          <MenuItem value="English" sx={{ fontFamily: 'Lora, serif' }}>English</MenuItem>
                        </TextField>
                        <TextField 
                          label="Country" 
                          value={country} 
                          onChange={e => setCountry(e.target.value)} 
                          onBlur={() => handleBlur('country')} 
                          fullWidth 
                          required 
                          error={!!touched.country && !!errors.country} 
                          helperText={touched.country && errors.country}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    {error && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mt: 2, 
                          borderRadius: '0.7rem',
                          fontFamily: 'Lora, serif'
                        }}
                      >
                        {error}
                      </Alert>
                    )}
                    <Button 
                      onClick={handleNext} 
                      variant="contained" 
                      color="primary" 
                      sx={{ 
                        width: '100%', 
                        mt: 3, 
                        py: 1.8, 
                        fontSize: '1.1rem',
                        fontFamily: 'Lora, serif',
                        fontWeight: 600,
                        letterSpacing: '0.5px'
                      }}
                    >
                      Next: Other Details
                    </Button>
                  </Box>
                )}

                {step === 1 && (
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontFamily: 'Lora, serif',
                        fontWeight: 700, 
                        mb: 3, 
                        color: '#de6b2f', 
                        textAlign: 'center',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Other Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField 
                          label="Place" 
                          value={place} 
                          onChange={e => setPlace(e.target.value)} 
                          onBlur={() => handleBlur('place')} 
                          fullWidth 
                          required 
                          error={!!touched.place && !!errors.place} 
                          helperText={touched.place && errors.place}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        />
                        <TextField 
                          label="Profession (optional)" 
                          value={profession} 
                          onChange={e => setProfession(e.target.value)} 
                          fullWidth
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        />
                      </Box>
                      <TextField 
                        label="Address (optional)" 
                        value={address} 
                        onChange={e => setAddress(e.target.value)} 
                        fullWidth
                        sx={{
                          '& .MuiInputBase-input': {
                            fontFamily: 'Lora, serif',
                            fontSize: '1.05rem'
                          }
                        }}
                      />
                      <TextField
                        label="Reference Source"
                        value={refSource}
                        onChange={e => { setRefSource(e.target.value); if (e.target.value !== 'Others') setRefSourceOther(''); }}
                        onBlur={() => handleBlur('refSource')}
                        select
                        fullWidth
                        required
                        error={!!touched.refSource && !!errors.refSource}
                        helperText={touched.refSource && errors.refSource}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontFamily: 'Lora, serif',
                            fontSize: '1.05rem'
                          }
                        }}
                      >
                        <MenuItem value="Friends-Family" sx={{ fontFamily: 'Lora, serif' }}>Friends-Family</MenuItem>
                        <MenuItem value="SKS YouTube Videos" sx={{ fontFamily: 'Lora, serif' }}>SKS YouTube Videos</MenuItem>
                        <MenuItem value="Facebook" sx={{ fontFamily: 'Lora, serif' }}>Facebook</MenuItem>
                        <MenuItem value="Instagram" sx={{ fontFamily: 'Lora, serif' }}>Instagram</MenuItem>
                        <MenuItem value="Guruji Interview in PMC" sx={{ fontFamily: 'Lora, serif' }}>Guruji Interview in PMC</MenuItem>
                        <MenuItem value="Guruji Interview in Other Channels" sx={{ fontFamily: 'Lora, serif' }}>Guruji Interview in Other Channels</MenuItem>
                        <MenuItem value="Others" sx={{ fontFamily: 'Lora, serif' }}>Others</MenuItem>
                      </TextField>
                      {refSource === 'Others' && (
                        <TextField
                          label="Please specify"
                          value={refSourceOther}
                          onChange={e => setRefSourceOther(e.target.value)}
                          onBlur={() => handleBlur('refSource')}
                          fullWidth
                          required
                          error={!!touched.refSource && !!errors.refSource}
                          helperText={touched.refSource && errors.refSource}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        />
                      )}
                      <TextField 
                        label="Referrer Info" 
                        value={referrerInfo} 
                        onChange={e => setReferrerInfo(e.target.value)} 
                        onBlur={() => handleBlur('referrerInfo')} 
                        fullWidth 
                        required 
                        error={!!touched.referrerInfo && !!errors.referrerInfo} 
                        helperText={touched.referrerInfo && errors.referrerInfo}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontFamily: 'Lora, serif',
                            fontSize: '1.05rem'
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField 
                          label="Comment (optional)" 
                          value={comment} 
                          onChange={e => setComment(e.target.value)} 
                          fullWidth
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        />
                        <TextField 
                          label="Message (optional)" 
                          value={message} 
                          onChange={e => setMessage(e.target.value)} 
                          multiline 
                          rows={2} 
                          fullWidth
                          sx={{
                            '& .MuiInputBase-input': {
                              fontFamily: 'Lora, serif',
                              fontSize: '1.05rem'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    {error && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mt: 2, 
                          borderRadius: '0.7rem',
                          fontFamily: 'Lora, serif'
                        }}
                      >
                        {error}
                      </Alert>
                    )}
                    {success && (
                      <Alert 
                        severity="success" 
                        sx={{ 
                          mt: 2, 
                          borderRadius: '0.7rem',
                          fontFamily: 'Lora, serif'
                        }}
                      >
                        {success}
                      </Alert>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 3 }}>
                      <Button 
                        onClick={handleBack} 
                        variant="outlined" 
                        color="primary" 
                        sx={{ 
                          flex: 1, 
                          py: 1.8, 
                          fontSize: '1.1rem',
                          fontFamily: 'Lora, serif',
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }}
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        sx={{ 
                          flex: 1, 
                          py: 1.8, 
                          fontSize: '1.1rem',
                          fontFamily: 'Lora, serif',
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }} 
                        disabled={!isFormValid || loading}
                      >
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
      </Box>
    </ThemeProvider>
  );
} 

