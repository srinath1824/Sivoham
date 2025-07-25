import React from 'react';
import Grid from '@mui/material/Grid';
import { Box, Typography, Avatar } from '@mui/material';

const testimonials = [
  {
    name: 'Ramananda Swami',
    desc: 'Sanyasi, Badrinath',
    text: 'I spent many years in Himalayas and travelled across India in pursuit of Moksha. Only a self-experienced person can guide others to the path of liberation. Guru Sree Jeeveswara Yogi is one of the rarest Advaitha Shaktipath Gurus. I feel so blessed and fortunate to have found him.',
  },
  {
    name: 'Mrs. Rajya Lakshmi',
    desc: 'Retd. Teacher',
    text: 'Parama Pujya Sree Jeeveswara Yogi is none the less than Dakshinamurthy himself disguised as a common man incarnated to uplift ignorant people like us with boundless Compassion. He is Shiva himself.',
  },
  {
    name: 'Mr. Suresh Kalimahanthi',
    desc: 'IT, USA',
    text: 'I have read a lot of books on Kundalini and many Upanishads. However, there is only a mention of how to do and what to do in them. Sree Jeeveswara Yogi is imparting that practical knowledge whole heartedly without expecting anything from us.',
  },
];

/**
 *
 */
export default function Testimonials() {
  return (
    <main className="main-content">
      <Grid
        container
        spacing={0}
        alignItems="flex-start"
        justifyContent="center"
        sx={{ maxWidth: 1400, mx: 'auto' }}
      >
        <Grid
          item
          xs={12}
          md={5}
          sx={{ px: { xs: 2, md: 6 }, mb: { xs: 4, md: 0 }, position: 'relative', zIndex: 2 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'flex-start',
              position: 'relative',
            }}
          >
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
              Testimonials
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Lora, serif',
                fontSize: { xs: '1.1rem', md: '1.15rem' },
                color: '#222',
                mb: 4,
                maxWidth: 520,
              }}
            >
              Hear from our students and community members about their experiences with Siva
              Kundalini Sadhana and Guru Sree Jeeveswara Yogi.
            </Typography>
            {/* Decorative lotus SVG bottom left */}
            <Box
              sx={{
                position: 'absolute',
                left: -40,
                bottom: -20,
                opacity: 0.13,
                zIndex: 1,
                display: { xs: 'none', md: 'block' },
              }}
            >
              <img
                src="https://yogananda.org/craft-public-storage/lotus-5_orange_light.svg"
                alt="lotus"
                width={140}
                height={140}
                style={{ maxWidth: '100%' }}
              />
            </Box>
            {/* Divider line */}
            <Box
              sx={{
                width: 80,
                height: 2,
                background: '#de6b2f',
                mt: 4,
                mb: 0,
                display: { xs: 'none', md: 'block' },
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 4,
              width: '100%',
            }}
          >
            {testimonials.map((t, i) => (
              <Box
                key={i}
                sx={{
                  background: '#fff7f0',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(222,107,47,0.07)',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: 220,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#de6b2f',
                    color: '#fff',
                    width: 56,
                    height: 56,
                    fontFamily: 'Lora, serif',
                    fontWeight: 700,
                    fontSize: '1.7rem',
                    mb: 2,
                  }}
                >
                  {t.name[0]}
                </Avatar>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Lora, serif',
                    color: '#de6b2f',
                    fontWeight: 700,
                    mb: 1,
                    fontSize: '1.1rem',
                    textAlign: 'center',
                  }}
                >
                  {t.name}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Lora, serif',
                    color: '#b45309',
                    fontSize: '0.98rem',
                    mb: 1,
                    textAlign: 'center',
                  }}
                >
                  {t.desc}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Lora, serif',
                    color: '#222',
                    fontSize: '1.05rem',
                    textAlign: 'center',
                  }}
                >
                  {t.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
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
