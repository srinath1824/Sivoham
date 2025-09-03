
import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { 
  People, 
  Event, 
  Analytics, 
 
  ShoppingCart, 
  VolunteerActivism,
  AdminPanelSettings,
  Dashboard
} from '@mui/icons-material';

const AdminWelcome: React.FC = () => {
  const features = [
    {
      icon: <People />,
      title: 'User Management',
      description: 'Manage registrations & profiles'
    },
    {
      icon: <Event />,
      title: 'Event Management',
      description: 'Create & track spiritual events'
    },
    {
      icon: <Analytics />,
      title: 'Analytics',
      description: 'Monitor progress & insights'
    },
    {
      icon: <ShoppingCart />,
      title: 'Merchandise',
      description: 'Spiritual books & items'
    },
    {
      icon: <VolunteerActivism />,
      title: 'Sevaks',
      description: 'Volunteer coordination'
    },
    {
      icon: <AdminPanelSettings />,
      title: 'Permissions',
      description: 'Access control & roles'
    }
  ];

  return (
    <Box
      sx={{
        height: 'calc(100vh - 100px)',
        background: 'linear-gradient(135deg, #fff7f0 0%, #f0f8ff 100%)',
        borderRadius: '2rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23de6b2f" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 0,
        },
        '& > *': {
          position: 'relative',
          zIndex: 1,
        }
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          textAlign: 'center',
          pt: 3,
          pb: 2,
          px: 3,
          flex: '0 0 auto'
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #de6b2f 0%, #b45309 100%)',
            mb: 2,
            boxShadow: '0 8px 24px rgba(222, 107, 47, 0.3)',
            animation: 'pulse 3s infinite',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                boxShadow: '0 8px 24px rgba(222, 107, 47, 0.3)',
              },
              '50%': {
                transform: 'scale(1.05)',
                boxShadow: '0 12px 32px rgba(222, 107, 47, 0.4)',
              },
              '100%': {
                transform: 'scale(1)',
                boxShadow: '0 8px 24px rgba(222, 107, 47, 0.3)',
              },
            },
          }}
        >
          <Dashboard sx={{ fontSize: 40, color: 'white' }} />
        </Box>

        <Typography
          variant="h4"
          sx={{
            color: '#de6b2f',
            fontFamily: 'Lora, serif',
            fontWeight: 700,
            mb: 1,
            fontSize: { xs: '1.5rem', md: '2rem' },
            textShadow: '0 2px 8px rgba(255, 255, 255, 0.8)',
          }}
        >
          🕉️ Welcome to Admin Panel
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#7a7a7a',
            fontFamily: 'Lora, serif',
            fontSize: { xs: '0.9rem', md: '1rem' },
            maxWidth: 500,
            mx: 'auto',
            lineHeight: 1.4,
            mb: 2,
          }}
        >
          Manage the spiritual journey with comprehensive admin tools
        </Typography>


      </Box>

      {/* Features Grid */}
      <Box sx={{ px: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h6"
          sx={{
            color: '#b45309',
            fontFamily: 'Lora, serif',
            fontWeight: 700,
            textAlign: 'center',
            mb: 2,
            fontSize: { xs: '1.1rem', md: '1.3rem' }
          }}
        >
          🛠️ Administrative Features
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', maxWidth: 900, mx: 'auto', flex: 1 }}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ width: 'calc(33.333% - 16px)', minWidth: 250 }}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                  borderRadius: 2,
                  boxShadow: '0 4px 16px rgba(222, 107, 47, 0.08)',
                  border: '1px solid rgba(222, 107, 47, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(222, 107, 47, 0.15)',
                    border: '1px solid rgba(222, 107, 47, 0.2)',
                  }
                }}
              >
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(222, 107, 47, 0.1) 0%, rgba(222, 107, 47, 0.05) 100%)',
                      mb: 1,
                      border: '2px solid rgba(222, 107, 47, 0.1)'
                    }}
                  >
                    {React.cloneElement(feature.icon, { sx: { fontSize: 24, color: '#de6b2f' } })}
                  </Box>

                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: '#b45309',
                      fontFamily: 'Lora, serif',
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: '0.9rem'
                    }}
                  >
                    {feature.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      fontFamily: 'Lora, serif',
                      lineHeight: 1.3,
                      fontSize: '0.75rem'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Footer Message */}
      <Box
        sx={{
          textAlign: 'center',
          pb: 2,
          px: 3,
          flex: '0 0 auto'
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#8b5a2b',
            fontFamily: 'Lora, serif',
            fontStyle: 'italic',
            fontSize: '0.85rem',
            mb: 1
          }}
        >
          "Service to humanity is service to divinity"
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#b45309',
            fontFamily: 'Lora, serif',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          🙏 Jai Gurudev 🙏
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminWelcome;

