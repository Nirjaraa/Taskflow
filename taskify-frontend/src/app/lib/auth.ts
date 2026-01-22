import api from './axios';

// ---- Register ----
export const register = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post('/auth/register', data);

// ---- Login ----
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

// ---- Get current user ----
export const getMe = () => api.get('/auth/me');

// ---- Update profile ----
export const updateProfile = (data: { name?: string; email?: string }) =>
  api.patch('/auth/profile', data);

// ---- Forgot / Reset password ----
export const forgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (token: string, newPassword: string) =>
  api.post('/auth/reset-password', { token, newPassword });

// ---- Token helpers ----

// Save JWT token in localStorage and set default header
export const setToken = (token: string) => {
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Load token from localStorage (on page load)
export const loadToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return token;
};

// Remove token (logout)
export const removeToken = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};
