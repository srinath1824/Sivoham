
import { Grid } from '@mui/material';
import { Box, Typography, Link as MuiLink } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 *
 */
export default function About() {
  const { t } = useTranslation();
  return (
    <main className="main-content">
      {/* Mobile background image */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.1,
          background: 'center/cover no-repeat',
          backgroundImage: 'url(/images/guruji_new.jpg)',
        }}
      />
      <Grid
        container
        spacing={0}
        alignItems="center"
        justifyContent="center"
        sx={{ maxWidth: 1400, mx: 'auto', position: 'relative', zIndex: 1 }}
      >
        {/* Left: Text Content */}
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'center',
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
              {t('about.missionHeading')}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Lora, serif',
                fontSize: { xs: '1.1rem', md: '1.15rem' },
                color: '#222',
                mb: 3,
                maxWidth: 520,
              }}
            >
              {t('about.missionParagraph1')}
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
              {t('about.missionParagraph2')}
            </Typography>
            <MuiLink
              href="#programs"
              underline="none"
              sx={{
                fontFamily: 'Lora, serif',
                color: '#de6b2f',
                fontWeight: 400,
                fontSize: '1.1rem',
                borderBottom: '2px solid #de6b2f',
                width: 'fit-content',
                pb: '2px',
                transition: 'color 0.2s',
                '&:hover': { color: '#b45309', borderBottom: '2px solid #b45309' },
                mb: 4,
                display: 'inline-block',
              }}
            >
              {t('about.explorePrograms')}
            </MuiLink>
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
                width={160}
                height={160}
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
        {/* Right: Decorative/empty for symmetry, or add an image if desired */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            minHeight: 220,
            zIndex: 2,
            background: 'transparent',
          }}
        >
          {/* Optionally add an image or keep empty for now */}
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

