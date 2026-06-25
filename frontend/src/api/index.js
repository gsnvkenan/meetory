import api from './axios.js';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const userApi = {
  getUser: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  toggleFollow: (id) => api.post(`/users/${id}/follow`),
  getFollowers: (id) => api.get(`/users/${id}/followers`),
  getFollowing: (id) => api.get(`/users/${id}/following`),
  getUserPosts: (id, params) => api.get(`/users/${id}/posts`, { params }),
  searchUsers: (params) => api.get('/users/search', { params }),
  getNotifications: () => api.get('/users/notifications'),
};

export const postApi = {
  getFeed: (params) => api.get('/posts', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  addComment: (id, data) => api.post(`/posts/${id}/comment`, data),
  deleteComment: (id, commentId) => api.delete(`/posts/${id}/comment/${commentId}`),
  toggleBookmark: (id) => api.post(`/posts/${id}/bookmark`),
};

export const discoverApi = {
  getRecommendations: (params) => api.get('/discover/recommendations', { params }),
  getNearby: (params) => api.get('/discover/nearby', { params }),
};

export const chatApi = {
  getConversations: () => api.get('/chat/conversations'),
  getOrCreateConversation: (userId) => api.post('/chat/conversations', { userId }),
  getMessages: (conversationId, params) => api.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) => api.post(`/chat/conversations/${conversationId}/messages`, data),
};

export const eventApi = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  toggleAttend: (id) => api.post(`/events/${id}/attend`),
};

export const marketApi = {
  getListings: (params) => api.get('/market', { params }),
  getListing: (id) => api.get(`/market/${id}`),
  createListing: (data) => api.post('/market', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateListing: (id, data) => api.put(`/market/${id}`, data),
  deleteListing: (id) => api.delete(`/market/${id}`),
  expressInterest: (id) => api.post(`/market/${id}/interest`),
};
