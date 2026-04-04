import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ChatItem {
  id: string;
  name: string;
}

export interface ChatMessages {
  id?: number | string;
  content: string;
  sender: string;
  isStreaming?: boolean;
}

interface ChatsResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

export async function fetchChats(userId: string): Promise<ChatItem[]> {
  const { data } = await apiClient.get<ChatsResponse<ChatItem>>(`/chats`, { params: { userId } });
  return data.data;
}

export async function fetchChatMessages(id: string): Promise<ChatMessages[]> {
  const { data } = await apiClient.get<ChatsResponse<ChatMessages>>(`/chats/${id}`);
  console.log(data.data);
  return data.data;
}

export async function deleteChat(id: string): Promise<void> {
  await apiClient.delete(`/chats/${id}`);
}
