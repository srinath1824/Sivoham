
import { useTranslation } from 'react-i18next';
/**
 *
 */
export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-contact" style={{
          marginBottom: '1rem',
          padding: '1.5rem',
          backgroundColor: '#fff3e0',
          width: '100%'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
            gap: '2rem',
            alignItems: 'start'
          }}>
            <div style={{ textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>
              <h3 style={{
                fontFamily: 'Lora, serif',
                color: '#b45309',
                fontSize: '1.3rem',
                marginBottom: '0.8rem',
                fontWeight: 600
              }}>Contact Us</h3>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                color: '#666',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                marginBottom: '1rem'
              }}>
                Reach out for queries/suggestions and details on how to join the classes.
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                alignItems: window.innerWidth < 768 ? 'center' : 'flex-start'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  color: '#333'
                }}>
                  <svg width="16" height="16" fill="#b45309" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <a href="mailto:sivakundalini@gmail.com" style={{
                    color: '#de6b2f',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}>sivakundalini@gmail.com</a>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  color: '#333'
                }}>
                  <svg width="16" height="16" fill="#25D366" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                  </svg>
                  <a href="https://wa.me/917801046111" target="_blank" rel="noopener noreferrer" style={{
                    color: '#de6b2f',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}>+91 78010 46111</a>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>
              <h3 style={{
                fontFamily: 'Lora, serif',
                color: '#b45309',
                fontSize: '1.3rem',
                marginBottom: '0.8rem',
                fontWeight: 600
              }}>Ashram Location</h3>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                color: '#333',
                justifyContent: window.innerWidth < 768 ? 'center' : 'flex-start'
              }}>
                <svg width="16" height="16" fill="#b45309" viewBox="0 0 24 24" style={{ marginTop: '2px', flexShrink: 0 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div style={{ lineHeight: '1.4', textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    {t('home.ashramLocation')}
                  </div>
                  {/* <a 
                    href="https://www.google.com/maps?q=17.250167,78.270917" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      color: '#de6b2f',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    📍 Location on Map
                  </a> */}
                </div>
              </div>
              <div className="footer-socials" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: window.innerWidth < 768 ? 'center' : 'flex-start',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <span style={{
                  fontFamily: 'Lora, serif',
                  color: '#b45309',
                  fontSize: '1rem',
                  fontWeight: 600
                }}>Follow us on:</span>
                <a
                  href="https://www.facebook.com/SivaKundaliniSadhana"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  style={{ color: '#1877f2' }}
                >
                  <svg className="" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/SivaKundalini"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  style={{ color: '#1da1f2' }}
                >
                  <svg className="" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.90a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/sivakundalinisadhana"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  style={{ color: '#e4405f' }}
                >
                  <svg className="" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.808 2.256 6.088 2.243 6.497 2.243 12c0 5.503.013 5.912.072 7.192.059 1.276.353 2.449 1.32 3.416.967.967 2.14 1.261 3.416 1.32 1.28.059 1.689.072 7.192.072s5.912-.013 7.192-.072c1.276-.059 2.449-.353 3.416-1.32.967-.967 1.261-2.14 1.32-3.416.059-1.28.072-1.689.072-7.192s-.013-5.912-.072-7.192c-.059-1.276-.353-2.449-1.32-3.416C21.449.425 20.276.131 19 .072 17.72.013 17.311 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} Siva Kundalini Sadhana. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

