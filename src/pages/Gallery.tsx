import React, { useEffect, useState, useRef } from 'react';

// Configurable image array for the gallery
const galleryImages = [
  'https://www.sivakundalini.org/resources/images/gallery/thumbs/1.jpg',
  'https://www.sivakundalini.org/resources/images/gallery/thumbs/2.jpg',
  'https://www.sivakundalini.org/resources/images/gallery/thumbs/Hemanth.jpg',
  'https://www.sivakundalini.org/resources/images/gallery/thumbs/101.jpg',
  'https://www.sivakundalini.org/resources/images/gallery/thumbs/9.jpg',
  'https://www.sivakundalini.org/resources/images/gallery/thumbs/100.jpg',
  'https://www.sivakundalini.org/resources/images/gallery/thumbs/4.jpg',
  'https://www.sivakundalini.org/resources/images/gallery/thumbs/104.jpg',
];

const CAROUSEL_INTERVAL = 5000; // 5 seconds

/**
 *
 */
const Gallery: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const total = galleryImages.length;
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, CAROUSEL_INTERVAL);
    return () => clearInterval(timer);
  }, [total]);

  return (
    <main className="main-content">
      <section
        id="gallery"
        style={{
          margin: 0,
          textAlign: 'center',
          position: 'relative',
          width: '100%',
          minHeight: '220px',
          padding: '1rem 0',
        }}
      >
        {/* <h2 className="section-heading" style={{ textAlign: 'left', marginLeft: 32, marginTop: 0 }}>Gallery</h2> */}
        <div
          ref={carouselRef}
          style={{
            width: '100%',
            maxWidth: '100vw',
            overflow: 'hidden',
            margin: '0 auto',
            background: '#fff7f0',
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(222,107,47,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 180,
            height: '500px',
            position: 'relative',
          }}
        >
          {galleryImages.map((src, idx) => (
            <img
              key={src}
              src={src}
              alt={`Gallery ${idx + 1}`}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 16,
                opacity: idx === current ? 1 : 0,
                transition: 'opacity 0.7s',
                zIndex: idx === current ? 2 : 1,
                boxShadow: idx === current ? '0 4px 24px rgba(222,107,47,0.13)' : 'none',
                background: '#fff',
              }}
            />
          ))}
          {/* Carousel indicators */}
          <div
            style={{
              position: 'absolute',
              bottom: 18,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {galleryImages.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: idx === current ? '#de6b2f' : '#f3e5d8',
                  display: 'inline-block',
                  transition: 'background 0.3s',
                  border: idx === current ? '2px solid #b45309' : '2px solid #fff7f0',
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Gallery;
