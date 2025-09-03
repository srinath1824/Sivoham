import { captureException, captureMessage } from './monitoring';

export const API_URL = process.env.REACT_APP_API_URL || '/api';

// Enterprise API Configuration
const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  cacheTimeout: 5 * 60 * 1000,
} as const;

// Simple in-memory cache for GET requests
const cache = new Map<string, { data: any; timestamp: number }>();

if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    API_URL,
    timeout: API_CONFIG.timeout,
    retryAttempts: API_CONFIG.retryAttempts,
  });
}

// Enterprise Error Types
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Check if we're in offline mode or have network issues
 */
function isNetworkError(error: any): boolean {
  return !navigator.onLine || 
         error.name === 'NetworkError' || 
         error.name === 'TimeoutError' ||
         (error as Error).message?.includes('fetch') ||
         (error as Error).message?.includes('network') ||
         error.code === 'NETWORK_ERROR';
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  attempts: number = API_CONFIG.retryAttempts,
  delay: number = API_CONFIG.retryDelay
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (attempts <= 1 || !isNetworkError(error)) {
      throw error;
    }
    
    await sleep(delay);
    return withRetry(operation, attempts - 1, delay * 2); // Exponential backoff
  }
}

/**
 * Create cache key for GET requests
 */
function getCacheKey(url: string, headers?: Record<string, string>): string {
  const token = headers?.Authorization || '';
  return `${url}:${token}`;
}

/**
 * Get cached data if valid
 */
function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < API_CONFIG.cacheTimeout) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

/**
 * Set cache data
 */
function setCacheData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Enhanced fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_CONFIG.timeout
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new TimeoutError(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Handle API errors gracefully with proper logging
 */
function handleApiError(error: any, context: string, url?: string) {
  const errorInfo = {
    context,
    url,
    message: (error as Error).message,
    status: error.status,
    timestamp: new Date().toISOString(),
  };

  if (isNetworkError(error)) {
    captureMessage(`Network error in ${context}`, 'warning');
    throw new NetworkError('Network connection failed. Please check your internet connection and try again.');
  }

  captureException(error, errorInfo);
  
  if (error instanceof ApiError) {
    throw error;
  }
  
  throw new ApiError((error as Error).message || `${context} failed`, error.status);
}

/**
 * Get authentication token from secure storage
 */
function getToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    captureException(error as Error, { context: 'getToken' });
    return null;
  }
}

/**
 * Build request headers with authentication and security headers
 */
function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...extra,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Generic API request handler with enterprise features
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  useCache: boolean = false
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = buildHeaders(options.headers as Record<string, string>);
  
  // Check cache for GET requests
  if (useCache && (!options.method || options.method === 'GET')) {
    const cacheKey = getCacheKey(url, headers);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await withRetry(() => fetchWithTimeout(url, requestOptions));
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = errorData;
      } catch {
        // Response is not JSON, use status text
      }
      
      throw new ApiError(errorMessage, response.status, 'HTTP_ERROR', errorDetails);
    }

    const data = await response.json();
    
    // Cache successful GET requests
    if (useCache && (!options.method || options.method === 'GET')) {
      const cacheKey = getCacheKey(url, headers);
      setCacheData(cacheKey, data);
    }
    
    return data;
  } catch (error: any) {
    handleApiError(error, `API request to ${endpoint}`, url);
    throw error; // This line won't be reached due to handleApiError throwing
  }
}

// Auth API Methods
/**
 * Login with mobile and OTP
 */
export async function login(mobile: string, otp: string) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ mobile, otp }),
  });
}

/**
 * Register with all user fields as top-level properties
 */
export async function register(userData: any) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * Check if a user exists and is registered by mobile number
 */
export async function checkMobileRegistered(mobile: string) {
  return apiRequest('/auth/check-mobile', {
    method: 'POST',
    body: JSON.stringify({ mobile }),
  });
}

// Progress API Methods
/**
 * Get user progress with caching
 */
export async function getProgress() {
  const data = await apiRequest('/progress', {}, true);
  return (data as any).progress || data; // Handle both response formats
}

/**
 * Update user progress
 */
export async function updateProgress(data: any) {
  // Clear progress cache when updating
  const cacheKey = getCacheKey(`${API_URL}/progress`, buildHeaders());
  cache.delete(cacheKey);
  
  return apiRequest('/progress', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Level Test API Methods
/**
 * Get level tests with caching
 */
export async function getLevelTests() {
  return apiRequest('/levelTest', {}, true);
}

/**
 * Update level test
 */
export async function updateLevelTest(data: any) {
  return apiRequest('/levelTest', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Admin API Methods
/**
 * Get all non-admin users (for admin approval) with caching
 */
export async function getUsers() {
  return apiRequest('/admin/users', {}, true);
}

/**
 * Reset user data
 */
export async function resetUser(userId: string) {
  return apiRequest(`/admin/user/${userId}/reset`, {
    method: 'POST',
  });
}

/**
 * Approve a user registration (set isSelected to true)
 */
export async function approveUser(userId: string) {
  return apiRequest(`/admin/user/${userId}/approve`, {
    method: 'POST',
  });
}

/**
 * Reject a user registration (delete or mark as rejected)
 */
export async function rejectUser(userId: string) {
  return apiRequest(`/admin/user/${userId}/reject`, {
    method: 'POST',
  });
}

/**
 * Update user details (admin edit)
 */
export async function updateUser(userId: string, data: any) {
  return apiRequest(`/user/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Securely fetch the current user's profile from the backend
 */
export async function getUserProfile() {
  return apiRequest('/user/me/profile', {}, true);
}

/**
 * Mark attendance for event registration
 */
export async function markAttendance(registrationId: string) {
  return apiRequest(`/event-registrations/${registrationId}/attend`, {
    method: 'PUT',
  });
}

/**
 * Bulk approve multiple users
 */
export async function bulkApproveUsers(userIds: string[]) {
  return apiRequest('/admin/users/bulk-approve', {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  });
}

/**
 * Bulk reject multiple users
 */
export async function bulkRejectUsers(userIds: string[]) {
  return apiRequest('/admin/users/bulk-reject', {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  });
}

/**
 * Update the user's profile
 */
export async function updateUserProfile(data: any) {
  // Clear user profile cache when updating
  const cacheKey = getCacheKey(`${API_URL}/user/me/profile`, buildHeaders());
  cache.delete(cacheKey);
  
  return apiRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Export error classes for use in components
export { ApiError, NetworkError, TimeoutError };

// Cache management utilities
export const cacheUtils = {
  clear: () => cache.clear(),
  delete: (key: string) => cache.delete(key),
  size: () => cache.size,
};

// Health check endpoint
export async function healthCheck() {
  return apiRequest('/health', {}, false);
}

