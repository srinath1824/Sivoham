const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 *
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 *
 * @param extra
 */
function buildHeaders(extra: Record<string, string> = {}) {
  const token = getToken();
  const headers: Record<string, string> = { ...extra };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// Auth
/**
 * Login with mobile and OTP
 * @param mobile
 * @param otp
 */
export async function login(mobile: string, otp: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ mobile, otp }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
  return res.json();
}

/**
 * Register with all user fields as top-level properties
 * @param userData
 */
export async function register(userData: any) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
  return res.json();
}

/**
 * Check if a user exists and is registered by mobile number
 */
export async function checkMobileRegistered(mobile: string) {
  const res = await fetch(`${API_URL}/auth/check-mobile`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ mobile }),
  });
  if (!res.ok) throw new Error('Failed to check mobile');
  return res.json();
}

// Progress
/**
 *
 */
export async function getProgress() {
  const res = await fetch(`${API_URL}/progress`, { headers: buildHeaders() });
  if (!res.ok) throw new Error('Failed to fetch progress');
  return res.json();
}

/**
 *
 * @param data
 */
export async function updateProgress(data: any) {
  const res = await fetch(`${API_URL}/progress`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update progress');
  return res.json();
}

// LevelTest
/**
 *
 */
export async function getLevelTests() {
  const res = await fetch(`${API_URL}/levelTest`, { headers: buildHeaders() });
  if (!res.ok) throw new Error('Failed to fetch level tests');
  return res.json();
}

/**
 *
 * @param data
 */
export async function updateLevelTest(data: any) {
  const res = await fetch(`${API_URL}/levelTest`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update level test');
  return res.json();
}

// Admin
/**
 * Get all non-admin users (for admin approval)
 */
export async function getUsers() {
  const res = await fetch(`${API_URL}/admin/users`, { headers: buildHeaders() });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

/**
 *
 * @param userId
 */
export async function resetUser(userId: string) {
  const res = await fetch(`${API_URL}/admin/user/${userId}/reset`, {
    method: 'POST',
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error('Failed to reset user');
  return res.json();
}

/**
 * Approve a user registration (set isSelected to true)
 * @param userId
 */
export async function approveUser(userId: string) {
  const res = await fetch(`${API_URL}/admin/user/${userId}/approve`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
  });
  if (!res.ok) throw new Error('Failed to approve user');
  return res.json();
}

/**
 * Reject a user registration (delete or mark as rejected)
 * @param userId
 */
export async function rejectUser(userId: string) {
  const res = await fetch(`${API_URL}/admin/user/${userId}/reject`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
  });
  if (!res.ok) throw new Error('Failed to reject user');
  return res.json();
}

/**
 * Update user details (admin edit)
 * @param userId
 * @param data
 */
export async function updateUser(userId: string, data: any) {
  const res = await fetch(`${API_URL}/user/${userId}`, {
    method: 'PUT',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

/**
 * Securely fetch the current user's profile from the backend
 */
export async function getUserProfile() {
  const res = await fetch(`${API_URL}/user/me/profile`, { headers: buildHeaders() });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

/**
 * Mark attendance for event registration
 * @param registrationId
 */
export async function markAttendance(registrationId: string) {
  const res = await fetch(`${API_URL}/event-registrations/${registrationId}/attend`, {
    method: 'PUT',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to mark attendance');
  return res.json();
}

/**
 * Bulk approve multiple users
 * @param userIds
 */
export async function bulkApproveUsers(userIds: string[]) {
  const res = await fetch(`${API_URL}/admin/users/bulk-approve`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ userIds }),
  });
  if (!res.ok) throw new Error('Failed to bulk approve users');
  return res.json();
}

/**
 * Bulk reject multiple users
 * @param userIds
 */
export async function bulkRejectUsers(userIds: string[]) {
  const res = await fetch(`${API_URL}/admin/users/bulk-reject`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ userIds }),
  });
  if (!res.ok) throw new Error('Failed to bulk reject users');
  return res.json();
}
