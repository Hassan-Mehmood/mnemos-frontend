import axios from "axios";

const API_BASE = "http://localhost:8000";

export interface ChatItem {
  id: number;
  name: string;
}

interface ChatsResponse {
  success: boolean;
  message: string;
  data: ChatItem[];
}

export async function fetchChats(): Promise<ChatItem[]> {
  const { data } = await axios.get<ChatsResponse>(`${API_BASE}/chats`);
  return data.data;
}
