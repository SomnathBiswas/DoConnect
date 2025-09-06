import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5081/api'
});

// attach token (use adminToken or authToken)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const adminToken = localStorage.getItem('adminToken');
  const authToken = localStorage.getItem('authToken');
  const t = adminToken || authToken;
  if (t && config.headers) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

export interface NotificationDto {
  type: 'Question' | 'Answer';
  id: number;
  title: string;
  username: string;
  createdAt: string;
}

export interface NotificationSummaryDto {
  pendingCount: number;
  recent: NotificationDto[];
}

export const Notification = {
  getPendingSummary: async (take = 10) => {
    const res = await api.get(`/NotificationApi/pending?take=${take}`);
    return res.data as NotificationSummaryDto;
  }
};