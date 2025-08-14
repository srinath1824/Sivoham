
import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Drawer, List, ListItem, ListItemText, Divider, ListItemButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


/**
 * Navigation links for the app.
 */
const navLinks = [
  { name: 'nav.home', to: '/' },
  { name: 'nav.about', to: '#about' },
  { name: 'nav.programs', to: '#programs' },
  { name: 'nav.gallery', to: '#gallery' },
  { name: 'nav.testimonials', to: '#testimonials' },
  { name: 'nav.joinUs', to: '/join' },
  { name: 'nav.events', to: '/events' },
  { name: 'nav.courses', to: '/courses' },
  { name: 'nav.progress', to: '/progress' },
];

/**
 * Tabs to show in header on mobile.
 */
const mobileDrawerTabs = ['nav.gallery', 'nav.testimonials', 'nav.joinUs', 'nav.progress'];

/**
 * Main navigation bar for the app.
 * @param {object} props
 * @param {() => void} [props.onLoginClick] - Handler for login button click.
 * @param {boolean} [props.isLoggedIn] - Whether the user is logged in.
 * @param {() => void} [props.onLogoutClick] - Handler for logout button click.
 * @returns {JSX.Element}
 */
export default function Navbar({ onLoginClick, user, onLogoutClick }) {
  const { t } = useTranslation();
  const isLoggedIn = !!user;
  const isAdmin = user && user.isAdmin;
  let navLinksToUse = navLinks;
  if (isAdmin) {
    navLinksToUse = [
      ...navLinks.filter(link => link.name !== 'nav.admin'),
      { name: 'nav.admin', to: '/admin' },
    ];
  }
  const filteredNavLinks = isLoggedIn ? navLinksToUse.filter(link => link.name !== 'nav.joinUs') : navLinksToUse;
  const filteredMobileDrawerTabs = isLoggedIn ? mobileDrawerTabs.filter(name => name !== 'nav.joinUs') : mobileDrawerTabs;
  if (isAdmin && !filteredMobileDrawerTabs.includes('nav.admin')) filteredMobileDrawerTabs.push('nav.admin');

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();

  // Handler for anchor links
  const handleAnchorNav = (hash) => (e) => {
    e.preventDefault();
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      {/* Main Header: Logo and Brand */}
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', display: { xs: 'flex', md: 'none' }, top: 0, zIndex: 1201 }}>
        <Toolbar sx={{ minHeight: 64, px: { xs: 1, md: 3 }, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src="/images/SKS_Logo_4K-1.png" alt="Logo" style={{ height: 36, width: 'auto' }} />
            <Typography variant="h6" sx={{ fontFamily: 'cursive', fontWeight: 600, color: '#1a2341', letterSpacing: 1, fontSize: { xs: '1.1rem', md: '1.4rem' } }}>
              {t('welcome')}
            </Typography>
          </Box>
          {/* Hamburger for mobile */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton edge="end" color="inherit" aria-label="menu" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
          {/* Desktop nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            {filteredNavLinks.map(link => (
              link.to.startsWith('/') ? (
                <Link key={link.to} to={link.to} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500, fontSize: 16, padding: '8px 16px' }}>
                  {t(link.name)}
                </Link>
              ) : (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={handleAnchorNav(link.to)}
                  style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500, fontSize: 16, padding: '8px 16px', cursor: 'pointer' }}
                >
                  {t(link.name)}
                </a>
              )
            ))}
          </Box>
          {/* Login/Logout Button */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {!isLoggedIn ? (
              <button
                onClick={onLoginClick}
                style={{
                  background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
                  color: '#fff',
                  fontFamily: 'Lora, serif',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: 20,
                  marginLeft: 16,
                  cursor: 'pointer',
                  borderLeft: '1px solid #ddd',
                  transition: 'background 0.2s',
                }}
              >
                {t('nav.login')}
              </button>
            ) : (
              <button
                onClick={onLogoutClick}
                style={{
                  background: 'linear-gradient(90deg, #b45309 0%, #de6b2f 100%)',
                  color: '#fff',
                  fontFamily: 'Lora, serif',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: 20,
                  marginLeft: 16,
                  cursor: 'pointer',
                  borderLeft: '1px solid #ddd',
                  transition: 'background 0.2s',
                }}
              >
                {t('nav.logout')}
              </button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {/* Secondary Header Bar */}
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: '#fff', minHeight: 40, boxShadow: 'none', borderBottom: 1, borderColor: 'divider', display: { xs: 'flex', md: 'none' }, top: 0, zIndex: 1201 }}>
        <Toolbar sx={{ minHeight: 40, px: { xs: 1, md: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          {filteredNavLinks.filter(link => ['nav.home', 'nav.about', 'nav.programs', 'nav.courses'].includes(link.name)).map(link => (
            link.to.startsWith('/') ? (
              <Link key={link.to} to={link.to} style={{ textDecoration: 'none', color: '#1a2341', fontWeight: 500, fontSize: 15, padding: '6px 12px', borderRadius: 4, transition: 'background 0.2s', marginRight: 2 }}>
                {t(link.name)}
              </Link>
            ) : (
              <a
                key={link.to}
                href={link.to}
                onClick={handleAnchorNav(link.to)}
                style={{ textDecoration: 'none', color: '#1a2341', fontWeight: 500, fontSize: 15, padding: '6px 12px', borderRadius: 4, transition: 'background 0.2s', marginRight: 2, cursor: 'pointer' }}
              >
                {t(link.name)}
              </a>
            )
          ))}
        </Toolbar>
      </AppBar>
      {/* Desktop header for md+ */}
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', display: { xs: 'none', md: 'flex' }, top: 0, zIndex: 1201 }}>
        <Toolbar sx={{ minHeight: 64, px: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src="/images/SKS_Logo_4K-1.png" alt="Logo" style={{ height: 36, width: 'auto' }} />
            <Typography variant="h6" sx={{ fontFamily: 'cursive', fontWeight: 600, color: '#1a2341', letterSpacing: 1, fontSize: '1.4rem' }}>
              {t('welcome')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            {filteredNavLinks.map(link => (
              link.to.startsWith('/') ? (
                <Link key={link.to} to={link.to} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500, fontSize: 16, padding: '8px 16px' }}>
                  {t(link.name)}
                </Link>
              ) : (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={handleAnchorNav(link.to)}
                  style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500, fontSize: 16, padding: '8px 16px', cursor: 'pointer' }}
                >
                  {t(link.name)}
                </a>
              )
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isLoggedIn ? (
              <button
                onClick={onLoginClick}
                style={{
                  background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
                  color: '#fff',
                  fontFamily: 'Lora, serif',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: 20,
                  marginLeft: 16,
                  cursor: 'pointer',
                  borderLeft: '1px solid #ddd',
                  transition: 'background 0.2s',
                }}
              >
                {t('nav.login')}
              </button>
            ) : (
              <button
                onClick={onLogoutClick}
                style={{
                  background: 'linear-gradient(90deg, #b45309 0%, #de6b2f 100%)',
                  color: '#fff',
                  fontFamily: 'Lora, serif',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: 20,
                  marginLeft: 16,
                  cursor: 'pointer',
                  borderLeft: '1px solid #ddd',
                  transition: 'background 0.2s',
                }}
              >
                {t('nav.logout')}
              </button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240, pt: 2 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {navLinks.filter(link => filteredMobileDrawerTabs.includes(link.name)).map(link => (
              link.to.startsWith('/') ? (
                <ListItem key={link.to} disablePadding>
                  <ListItemButton component={Link} to={link.to}>
                    <ListItemText primary={t(link.name)} />
                  </ListItemButton>
                </ListItem>
              ) : (
                <ListItem key={link.to} disablePadding>
                  <ListItemButton component="a" href={link.to}>
                    <ListItemText primary={t(link.name)} />
                  </ListItemButton>
                </ListItem>
              )
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              {!isLoggedIn ? (
                <ListItemButton onClick={onLoginClick}>
                  <ListItemText primary={t('nav.login')} />
                </ListItemButton>
              ) : (
                <ListItemButton onClick={onLogoutClick}>
                  <ListItemText primary={t('nav.logout')} />
                </ListItemButton>
              )}
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
