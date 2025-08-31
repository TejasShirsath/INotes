import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth0_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  getOrCreateProfile: (token: string) =>
    apiClient.post('/auth0/profile', {}, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getProfile: (token: string) =>
    apiClient.get('/auth0/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }),
};

export const notesAPI = {
  getNotes: () => apiClient.get('/notes'),
  createNote: (noteData: { title: string; description: string }) =>
    apiClient.post('/notes', noteData),
  updateNote: (id: string, noteData: { title?: string; description?: string }) =>
    apiClient.put(`/notes/${id}`, noteData),
  deleteNote: (id: string) => apiClient.delete(`/notes/${id}`),
  getNoteById: (id: string) => apiClient.get(`/notes/${id}`),
};
