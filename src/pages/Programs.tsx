import React from 'react';
import Grid from '@mui/material/Grid';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 *
 */
export default function Programs() {
  return (
    <main className="main-content programs-bg">
      <Grid
        container
        spacing={0}
        alignItems="center"
        justifyContent="center"
        sx={{ maxWidth: 1400, mx: 'auto' }}
      >
        {/* Left: Chakra Image */}
        <Grid
          item
          xs={12}
          sm={5}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: { xs: 4, sm: 0 },
            position: 'relative',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 340,
              minHeight: 320,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/images/chakras.png"
              alt="Chakras Illustration"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: 420,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Box>
        </Grid>
        {/* Right: Program Content */}
        <Grid item xs={12} sm={7}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'Lora, serif',
              fontStyle: 'italic',
              color: '#de6b2f',
              fontWeight: 400,
              fontSize: { xs: '2rem', md: '2.2rem' },
              mb: 2,
              lineHeight: 1.1,
              letterSpacing: 0,
            }}
          >
            Our Programs
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Lora, serif',
              fontSize: { xs: '1.1rem', md: '1.15rem' },
              color: '#222',
              mb: 4,
            }}
          >
            Explore our unique, step-by-step Kundalini Sadhana programs, designed for all
            backgrounds and experience levels. Each level builds on the last, guiding you safely and
            effectively on your spiritual journey.
          </Typography>
          {/* Divider line */}
          <Box
            sx={{
              width: 80,
              height: 2,
              background: '#de6b2f',
              mb: 4,
              display: { xs: 'none', md: 'block' },
            }}
          />
          <Box
            sx={{
              background: '#fff7f0',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(222,107,47,0.07)',
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Lora, serif',
                color: '#de6b2f',
                fontWeight: 700,
                mb: 1,
                fontSize: '1.25rem',
              }}
            >
              Level 1: Brahma Randra Opening
            </Typography>
            <Typography sx={{ fontFamily: 'Lora, serif', color: '#222', fontSize: '1.05rem' }}>
              Learn to open Brahma randhra, allowing Cosmic Energy to awaken the Kundalini and heal
              at all levels, physically, psychologically, and spiritually.
            </Typography>
          </Box>
          <Box
            sx={{
              background: '#fff7f0',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(222,107,47,0.07)',
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Lora, serif',
                color: '#de6b2f',
                fontWeight: 700,
                mb: 1,
                fontSize: '1.25rem',
              }}
            >
              Level 2: Awakening the Sushumna Nadi
            </Typography>
            <Typography sx={{ fontFamily: 'Lora, serif', color: '#222', fontSize: '1.05rem' }}>
              Awaken the Sushumna Nadi, the central channel of spiritual energy, and learn to enter
              the Brahma Nadi for deeper spiritual progress.
            </Typography>
          </Box>
          <Box
            sx={{
              background: '#fff7f0',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(222,107,47,0.07)',
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Lora, serif',
                color: '#de6b2f',
                fontWeight: 700,
                mb: 1,
                fontSize: '1.25rem',
              }}
            >
              Level 3: Awakening and Cleansing of 7 Chakras
            </Typography>
            <Typography sx={{ fontFamily: 'Lora, serif', color: '#222', fontSize: '1.05rem' }}>
              Awaken and cleanse the seven main chakras, unlocking higher states of consciousness
              and well-being.
            </Typography>
          </Box>
          <Box
            sx={{
              background: '#fff7f0',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(222,107,47,0.07)',
              p: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Lora, serif',
                color: '#de6b2f',
                fontWeight: 700,
                mb: 1,
                fontSize: '1.25rem',
              }}
            >
              Level 4: Moving Kundalini Energy
            </Typography>
            <Typography sx={{ fontFamily: 'Lora, serif', color: '#222', fontSize: '1.05rem' }}>
              Learn to move the awakened Kundalini Energy from Mooladhara to Sahasrara, unlocking
              the true potential of human life.
            </Typography>
          </Box>
        </Grid>
      </Grid>
      {/* Join Now Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
        <Link
          to="/join"
          style={{
            background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
            color: '#fff',
            fontFamily: 'Lora, serif',
            fontWeight: 700,
            fontSize: '1.15rem',
            padding: '12px 40px',
            border: 'none',
            borderRadius: 24,
            textDecoration: 'none',
            boxShadow: '0 2px 12px rgba(222,107,47,0.10)',
            transition: 'background 0.2s',
            cursor: 'pointer',
            letterSpacing: 0.5,
          }}
        >
          Join Now
        </Link>
      </Box>
      {/* Lotus SVG background for mobile */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          opacity: 0.1,
          zIndex: 0,
          display: { xs: 'block', md: 'none' },
        }}
      >
        <img
          src="https://yogananda.org/craft-public-storage/lotus-5_orange_light.svg"
          alt="lotus"
          width={120}
          height={120}
          style={{ maxWidth: '100%' }}
        />
      </Box>
    </main>
  );
}
