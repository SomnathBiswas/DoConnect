import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5081/api'
});

// attach token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// adjust this base host if needed
const API_HOST = 'http://localhost:5081';

export interface CreateQuestionPayload {
  questionTitle: string;
  questionText: string;
}

export interface CreateAnswerPayload {
  questionId: number;
  answerText: string;
}

export interface QuestionDto {
  questionId: number;
  questionTitle: string;
  questionText: string;
  status: string;
  createdAt: string;
  username?: string;
  imagePaths?: string[]; // if your DTO returns this
  answers?: any[];
}

export const Question = {
  // --- Existing ones ---
  createQuestion: async (data: CreateQuestionPayload) => {
    const res = await api.post('/QuestionApi', data);
    return res.data; 
  },

  searchQuestions: async (query: string): Promise<QuestionDto[]> => {
    const res = await api.get('/QuestionApi/search', {
      params: { q: query }
    });
    return res.data;
  },


  uploadQuestionImage: async (questionId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/ImageApi/upload/question/${questionId}`, formData,{
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data; 
  },

  createQuestionWithImage: async (title: string, text: string, file?: File) => {
  const fd = new FormData();
  fd.append('QuestionTitle', title);
  fd.append('QuestionText', text);
  if (file) fd.append('ImageFile', file);

  const res = await api.post('/QuestionApi/with-image', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
},

  

  // --- New methods to add ---

  // Get all questions
  getAllQuestions: async (): Promise<QuestionDto[]> => {
    const res = await api.get('/QuestionApi');
    return res.data;
  },

  // Get single question by id (returns full DTO)
  getQuestionById: async (id: number): Promise<QuestionDto | null> => {
    const res = await api.get(`/QuestionApi/${id}`);
    return res.data;
  },

  // Create an answer (backend should mark it "Pending")
  createAnswer: async (payload: CreateAnswerPayload) => {
    const res = await api.post('/AnswerApi', payload);
    return res.data;
  },

  // Upload answer image (multipart)
  uploadAnswerImage: async (answerId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/ImageApi/upload/answer/${answerId}`, formData);
    return res.data; 
  },

  // Optional helper to get full url for image path returned by backend (if backend returns '/uploads/xxx')
  getImageUrl: (path?: string | null) => {
    if (!path) return null;
    // If path is already full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // Otherwise prefix with host
    return API_HOST + path;
  }
};