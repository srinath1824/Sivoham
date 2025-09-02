// Feature flags configuration for production release
export interface FeatureConfig {
  // Navigation tabs
  home: boolean;
  about: boolean;
  programs: boolean;
  gallery: boolean;
  testimonials: boolean;
  courses: boolean;
  events: boolean;
  profile: boolean;
  admin: boolean;
  
  // Home page sections
  heroSection: boolean;
  aboutSection: boolean;
  whySection: boolean;
  programsSection: boolean;
  gallerySection: boolean;
  testimonialsSection: boolean;
  youtubeTestimonials: boolean;
  
  // Features
  registration: boolean;
  login: boolean;
  videoPlayer: boolean;
  eventRegistration: boolean;
  progressTracking: boolean;
  
  // External integrations
  youtubeIntegration: boolean;
  whatsappIntegration: boolean;
}

// Production configuration - set to false to disable features
export const FEATURE_FLAGS: FeatureConfig = {
  // Navigation tabs
  home: true,
  about: true,
  programs: true,
  gallery: true,
  testimonials: true,
  courses: false,        // Disable courses for initial release
  events: true,         // Enable events
  profile: false,        // Disable profile for initial release
  admin: false,          // Disable admin for initial release
  
  // Home page sections
  heroSection: true,
  aboutSection: true,
  whySection: true,
  programsSection: true,
  gallerySection: true,
  testimonialsSection: true,
  youtubeTestimonials: true,
  
  // Features
  registration: true,
  login: false,
  videoPlayer: false,    // Disable video player for initial release
  eventRegistration: false,
  progressTracking: false,
  
  // External integrations
  youtubeIntegration: true,
  whatsappIntegration: true,
};

// Helper function to check if feature is enabled
export const isFeatureEnabled = (feature: keyof FeatureConfig): boolean => {
  return FEATURE_FLAGS[feature];
};