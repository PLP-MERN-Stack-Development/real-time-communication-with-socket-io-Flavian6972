import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const fetchMessages = (roomId) =>
  axios.get(`${API_BASE}/rooms/${roomId}/messages`).then(res => res.data);

export const reactToMessage = (messageId, userId, reaction) =>
  axios.post(`${API_BASE}/messages/${messageId}/react`, { userId, reaction });

export const markMessageRead = (messageId, userId) =>
  axios.post(`${API_BASE}/messages/${messageId}/read`, { userId });
