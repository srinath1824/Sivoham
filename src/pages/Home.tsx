import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import Grid from '@mui/material/Grid';
import { Box, Typography, Link as MuiLink, Alert } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const Programs = lazy(() => import('./Programs.tsx'));
const Gallery = lazy(() => import('./Gallery.tsx'));

const images = [
  '/logo192.png',
  '/logo512.png',
];

const testimonials = [
  {
    name: 'Ramananda Swami',
    desc: 'Sanyasi, Badrinath',
    text: 'I spent many years in Himalayas and travelled across India in pursuit of Moksha. Only a self-experienced person can guide others to the path of liberation. Guru Sree Jeeveswara Yogi is one of the rarest Advaitha Shaktipath Gurus. I feel so blessed and fortunate to have found him.'
  },
  {
    name: 'Mrs. Rajya Lakshmi',
    desc: 'Retd. Teacher',
    text: 'Parama Pujya Sree Jeeveswara Yogi is none the less than Dakshinamurthy himself disguised as a common man incarnated to uplift ignorant people like us with boundless Compassion. He is Shiva himself.'
  },
  {
    name: 'Mr. Suresh Kalimahanthi',
    desc: 'IT, USA',
    text: 'I have read a lot of books on Kundalini and many Upanishads. However, there is only a mention of how to do and what to do in them. Sree Jeeveswara Yogi is imparting that practical knowledge whole heartedly without expecting anything from us.'
  },
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ScrollingSivohamBackground({ count = 20 }: { count?: number }) {
  // Generate random positions and animation durations for each text
  const texts = Array.from({ length: count }).map((_, i) => {
    const top = getRandomInt(0, 80); // percent
    const left = getRandomInt(0, 90); // percent
    const duration = getRandomInt(8, 18); // seconds
    const delay = getRandomInt(0, 10); // seconds
    const fontSize = getRandomInt(18, 38); // px
    const opacity = Math.random() * 0.5 + 0.3;
    return (
      <span
        key={i}
        className="scrolling-sivoham"
        style={{
          top: `${top}%`,
          left: `${left}%`,
          animationDuration: `${duration}s`,
          animationDelay: `-${delay}s`,
          fontSize: `${fontSize}px`,
          opacity,
        }}
      >
        Sivoham
      </span>
    );
  });
  return <div className="scrolling-sivoham-bg">{texts}</div>;
}

// SectionLoader spinner
function SectionLoader() {
  return (
    <div className="section-loader-wrapper">
      <div className="section-loader"></div>
    </div>
  );
}

// AnimatedImage with Intersection Observer for scroll-in animation
function AnimatedImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [visible, setVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className + (visible ? ' fade-in-image' : ' image-hidden')}
      loading="lazy"
      {...props}
    />
  );
}

export default function Home() {
  const { t } = useTranslation();
  const location = useLocation();
  const [showBadge, setShowBadge] = useState(true);
  const registered = location.state && typeof location.state.registered === 'boolean' ? location.state.registered : null;
  useEffect(() => {
    if (registered !== null) {
      setShowBadge(true);
      const timer = setTimeout(() => setShowBadge(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [registered]);
  return (
    <main className="main-content">
      {showBadge && registered === true && (
        <Alert severity="success" sx={{ position: 'fixed', top: 80, left: 0, right: 0, maxWidth: 400, mx: 'auto', zIndex: 2000, textAlign: 'center' }}>{t('home.successfullyRegistered')}</Alert>
      )}
      {showBadge && registered === false && (
        <Alert severity="error" sx={{ position: 'fixed', top: 80, left: 0, right: 0, maxWidth: 400, mx: 'auto', zIndex: 2000, textAlign: 'center' }}>{t('home.registrationFailed')}</Alert>
      )}
      {/* Home Section */}
      <section id="home" className="home-section" style={{ padding: '2rem 0' }}>
        <div>
          <div className="home-hero-row">
            <div className="home-hero-text">
              <h1 className="home-title">{t('home.title')}</h1>
              <p className="home-description">
                {t('home.description')}
              </p>
            </div>
            <AnimatedImage src="/images/guruji_Rays.png" alt={t('home.heroImageAlt')} className="" />
          </div>
        </div>
        <Link to="/join" className="home-cta">{t('home.joinNow')}</Link>
      </section>
      {/* About Section */}
      <section id="about" className="home-section" style={{ background: '#ffff', padding: '2rem 0' }}>
        <div className="mission-content">
        <div className="mission-image-bg">
            <AnimatedImage src="/images/guruji_about.png" alt={t('home.aboutImageAlt')} className="mission-image" />
          </div>
          <div className="mission-text">
            <h2 className="mission-heading">{t('home.aboutHeading')}</h2>
            <div className="card mission-card">
              <p>{t('home.aboutParagraph1')}</p>
              <p style={{marginTop: '1rem'}}>{t('home.aboutParagraph2')}</p>
            </div>
          </div>
        </div>
      </section>
      {/* About Section */}
      <section id="about" className="home-section" style={{ padding: '2rem 0' }}>
        <div className="mission-content">
          <div className="mission-text">
            <h2 className="mission-heading">{t('home.whyHeading')}</h2>
            <div className="card mission-card">
              <p>{t('home.whyParagraph1')}</p>
              <p style={{marginTop: '1rem'}}>{t('home.whyParagraph2')}</p>
              <p style={{marginTop: '1rem'}}>{t('home.whyParagraph3')}</p>
            </div>
          </div>
          <div className="mission-image-bg">
            <AnimatedImage src="/images/guruji_sks.png" alt={t('home.whyImageAlt')} className="mission-image" />
          </div>
        </div>
      </section>
      {/* Programs Section */}
      <section id="programs">
        <Suspense fallback={<SectionLoader />}>
          <Programs />
        </Suspense>
      </section>
      {/* Gallery Section */}
      <section id="gallery" style={{ background: '#fff7f0', padding: '2rem' }}>
        <h2 className="section-heading">{t('home.gallery')}</h2>
        <Suspense fallback={<SectionLoader />}>
          <Gallery />
        </Suspense>
      </section>
      {/* Testimonials Section */}
      <section id="testimonials" style={{ background: '#ffff', padding: '2rem' }} >
        <h2 className="section-heading">{t('home.testimonials')}</h2>
        <div className="testimonials-grid">
          {testimonials.map((tst, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-avatar">{tst.name[0]}</div>
              <h3 style={{fontWeight: 600, color: 'var(--primary)', marginBottom: 4}}>{t('home.testimonialsList.' + i + '.name')}</h3>
              <span style={{fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: 8}}>{t('home.testimonialsList.' + i + '.desc')}</span>
              <p style={{marginTop: 8}}>{t('home.testimonialsList.' + i + '.text')}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
} 