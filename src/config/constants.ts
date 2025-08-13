/**
 * Application-wide constants and configuration for Siva Kundalini Sadhana React app.
 */
import courseConfig from './courseConfig.ts';

/**
 * If true, skips login and allows open access (for development/demo).
 */
export const SKIP_LOGIN = true;

/**
 * If true, uses CDN/HLS adaptive streaming for videos.
 */
export const USE_CDN_HLS = true;

/**
 * Example HLS URLs for video streaming. Replace with real CDN links in production.
 */
export const HLS_URLS = ['https://www.w3schools.com/html/mov_bbb.mp4'];

/**
 * Width of the sidebar drawer in pixels.
 */
export const DRAWER_WIDTH = 280;

/**
 * LocalStorage key for course progress.
 */
export const STORAGE_KEY = 'courseProgress';

/**
 * Initial state for level test completion.
 */
export const INITIAL_LEVEL_TEST: Record<
  number,
  { testPassed: boolean; firstCompletedAt?: number }
> = {
  1: { testPassed: false },
  2: { testPassed: false },
  3: { testPassed: false },
  4: { testPassed: false },
};

/**
 * Returns a unique key for a given level and day.
 * @param level - The course level number.
 * @param day - The day number within the level.
 * @returns A string key in the format 'L{level}D{day}'.
 */
export function getKey(level: number, day: number): string {
  return `L${level}D${day}`;
}

/**
 * Course content access time windows (24-hour format, local time)
 * Each window is an object with startHour and endHour.
 * Change these values to adjust the allowed access windows.
 */
export const COURSE_ACCESS_WINDOWS = [
  { startHour: 6, endHour: 8 },   // 06:00-08:00 AM
  { startHour: 18, endHour: 20 }, // 06:00-08:00 PM
];

/**
 * Mock course structure for all levels and days, with video URLs.
 */
export const mockCourses = [
  {
    level: 1,
    days: Array.from({ length: courseConfig.daysPerLevel }, (_, i) => ({
      day: i + 1,
      videoUrl: USE_CDN_HLS
        ? HLS_URLS[i % HLS_URLS.length]
        : 'https://www.w3schools.com/html/mov_bbb.mp4',
    })),
  },
  {
    level: 2,
    days: Array.from({ length: courseConfig.daysPerLevel }, (_, i) => ({
      day: i + 1,
      videoUrl: USE_CDN_HLS
        ? HLS_URLS[(i + 1) % HLS_URLS.length]
        : 'https://www.w3schools.com/html/mov_bbb.mp4',
    })),
  },
  {
    level: 3,
    days: Array.from({ length: courseConfig.daysPerLevel }, (_, i) => ({
      day: i + 1,
      videoUrl: USE_CDN_HLS
        ? HLS_URLS[i % HLS_URLS.length]
        : 'https://www.w3schools.com/html/mov_bbb.mp4',
    })),
  },
  {
    level: 4,
    days: Array.from({ length: courseConfig.daysPerLevel }, (_, i) => ({
      day: i + 1,
      videoUrl: USE_CDN_HLS
        ? HLS_URLS[(i + 1) % HLS_URLS.length]
        : 'https://www.w3schools.com/html/mov_bbb.mp4',
    })),
  },
];

/**
 * Events configuration
 */
export const PAST_EVENTS = [
  {
    name: 'Maha Sivaratri',
    description: 'A grand celebration of Maha Sivaratri with special pujas, meditations, and spiritual discourses.',
    images: ['/images/events/maha_sivaratri_1.jpg', '/images/events/maha_sivaratri_2.jpg'],
    venue: 'Main Ashram Hall',
    location: 'Hyderabad'
  },
  {
    name: 'Himalaya Ashram Bhoomi Pooja',
    description: 'Sacred ground-breaking ceremony for the new Himalaya Ashram, attended by devotees and dignitaries.',
    images: ['/images/events/himalaya_bhoomi_1.jpg'],
    venue: 'Himalaya Ashram',
    location: 'Himalayas'
  },
  {
    name: 'Kalpataru',
    description: 'Kalpataru event for wish-fulfillment and blessings, with group meditations and satsang.',
    images: ['/images/events/kalpataru_1.jpg'],
    venue: 'Satsang Hall',
    location: 'Bangalore'
  },
  {
    name: 'Guru Poornima',
    description: 'A day to honor the Guru with special programs, bhajans, and offerings.',
    images: ['/images/events/guru_poornima_1.jpg'],
    venue: 'Main Ashram Hall',
    location: 'Hyderabad'
  },
  {
    name: 'Level 5',
    description: 'Advanced initiation event for selected sadhaks, held at the ashram.',
    images: ['/images/events/level5_1.jpg'],
    venue: 'Ashram',
    location: 'Hyderabad'
  },
];

export const UPCOMING_EVENTS = [
  {
    name: 'Guru Poornima 2024',
    date: '2024-07-21',
    description: 'Join us for Guru Poornima 2024 celebrations with special satsang and blessings.',
    registerUrl: 'https://example.com/register/gurupoornima2024',
    venue: 'Main Ashram Hall',
    location: 'Hyderabad'
  },
  {
    name: 'Kalpataru 2024',
    date: '2024-12-31',
    description: 'Kalpataru 2024: A special event for wish-fulfillment and spiritual growth.',
    registerUrl: 'https://example.com/register/kalpataru2024',
    venue: 'Satsang Hall',
    location: 'Bangalore'
  },
];
