import axios from "axios";

const API_BASE = "http://localhost:8000";

export interface ChatItem {
  id: number;
  name: string;
}

export interface ChatMessages {
  id?: number;
  content: string;
  sender: string;
}

interface ChatsResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}


export async function fetchChats(): Promise<ChatItem[]> {
  const { data } = await axios.get<ChatsResponse<ChatItem>>(`${API_BASE}/chats`);
  return data.data;
}

export async function fetchChatMessages(id: number): Promise<ChatMessages[]> {
  const { data } = await axios.get<ChatsResponse<ChatMessages>>(`${API_BASE}/chats/${id}`);

  console.log(data.data)
  return data.data;
}