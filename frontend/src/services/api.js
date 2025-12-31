import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const authApi = {
  signup: async (email, password, name) => {
    const { data } = await api.post('/auth/signup', { email, password, name });
    return data;
  },
  signin: async (email, password) => {
    const { data } = await api.post('/auth/signin', { email, password });
    return data;
  },
  signout: async () => {
    const { data } = await api.post('/auth/signout');
    return data;
  },
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  update: async (name, password) => {
    const { data } = await api.put('/auth/update', { name, password });
    return data;
  },
  delete: async () => {
    const { data } = await api.delete('/auth/delete');
    return data;
  },
};

export const sessionsApi = {
  list: async () => {
    const { data } = await api.get('/sessions');
    return data.sessions;
  },
  getHistory: async (sessionId) => {
    const { data } = await api.get(`/history/${sessionId}`);
    return data.messages;
  },
  delete: async (sessionId) => {
    const { data } = await api.delete(`/sessions/${sessionId}`);
    return data;
  },
};


export async function sendMessage(message, sessionId = null) {
  const { data } = await api.post('/chat', { message, session_id: sessionId });
  return data;
}

export async function resetSession(sessionId) {
  const { data } = await api.post(`/reset/${sessionId}`);
  return data;
}
