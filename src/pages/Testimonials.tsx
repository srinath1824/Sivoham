import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Testimonials() {
  const { t } = useTranslation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const totalTestimonials = 5;
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleArrowClick = (direction) => {
    const container = document.querySelector('.testimonials-scroll-container');
    if (container) {
      const cardWidth = container.clientWidth;
      const newScrollLeft = direction === 'left' 
        ? Math.max(0, container.scrollLeft - cardWidth)
        : Math.min(container.scrollWidth - container.clientWidth, container.scrollLeft + cardWidth);
      container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
    setCurrentTestimonial(prev => direction === 'left' ? Math.max(0, prev - 1) : Math.min(totalTestimonials - 1, prev + 1));
  };

  return (
    <>
      <h2 className="section-heading">{t('home.testimonials')}</h2>
      <Typography
        variant="body1"
        sx={{
          fontFamily: 'Lora, serif',
          fontSize: { xs: '1.1rem', md: '1.15rem' },
          color: '#222',
          mb: 4,
        }}
      >
        Some experiences of those who attended Siva Kundalini Sadhana programs.
      </Typography>
      {isMobile ? (
        <div style={{ position: 'relative' }}>
          {currentTestimonial > 0 && (
            <div 
              onClick={() => handleArrowClick('left')}
              style={{
                position: 'absolute',
                left: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#de6b2f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: 'white',
                opacity: 0.7,
                zIndex: 1,
                cursor: 'pointer'
              }}
            >
              ‹
            </div>
          )}
          {currentTestimonial < totalTestimonials - 1 && (
            <div 
              onClick={() => handleArrowClick('right')}
              style={{
                position: 'absolute',
                right: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#de6b2f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: 'white',
                opacity: 0.7,
                zIndex: 1,
                cursor: 'pointer'
              }}
            >
              ›
            </div>
          )}
          <div 
            className="testimonials-scroll-container"
            style={{ 
              overflowX: 'auto', 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            <style>
              {`div::-webkit-scrollbar { display: none; }`}
            </style>
            <div style={{
              display: 'flex',
              paddingBottom: '10px'
            }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="testimonial-card" style={{
                  width: 'calc(100vw - 4rem)',
                  flexShrink: 0,
                  minHeight: '200px',
                  marginRight: '2rem',
                  scrollSnapAlign: 'start',
                  padding: '1.5rem'
                }}>
                  <div className="testimonial-avatar" style={{textAlign: 'center'}}>{t('home.testimonialsList.' + i + '.name')[0]}</div>
                  <h3 style={{fontWeight: 600, color: 'var(--primary)', marginBottom: 4}}>{t('home.testimonialsList.' + i + '.name')}</h3>
                  <span style={{fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: 8}}>{t('home.testimonialsList.' + i + '.desc')}</span>
                  <p style={{marginTop: 8, lineHeight: 1.4, textAlign: 'justify'}}>
                    {t('home.testimonialsList.' + i + '.text')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {currentTestimonial > 0 && (
            <div 
              onClick={() => setCurrentTestimonial(prev => prev - 1)}
              style={{
                position: 'absolute',
                left: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#de6b2f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: 'white',
                opacity: 0.7,
                zIndex: 1,
                cursor: 'pointer'
              }}
            >
              ‹
            </div>
          )}
          {currentTestimonial < totalTestimonials - 3 && (
            <div 
              onClick={() => setCurrentTestimonial(prev => prev + 1)}
              style={{
                position: 'absolute',
                right: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#de6b2f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: 'white',
                opacity: 0.7,
                zIndex: 1,
                cursor: 'pointer'
              }}
            >
              ›
            </div>
          )}
          <div className="testimonials-grid">
            {[currentTestimonial, currentTestimonial + 1, currentTestimonial + 2].map((i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-avatar" style={{textAlign: 'center'}}>{t('home.testimonialsList.' + i + '.name')[0]}</div>
                <h3 style={{fontWeight: 600, color: 'var(--primary)', marginBottom: 4}}>{t('home.testimonialsList.' + i + '.name')}</h3>
                <span style={{fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: 8}}>{t('home.testimonialsList.' + i + '.desc')}</span>
                <p style={{marginTop: 8, lineHeight: 1.4, textAlign: 'justify'}}>
                  {t('home.testimonialsList.' + i + '.text')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}