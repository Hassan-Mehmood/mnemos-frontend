export type Role = "user" | "assistant";

export interface FileAttachment {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  files?: FileAttachment[];
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatRequest {
  userId: number;
  chatId: number;
  message: string;
  files?: FileAttachment[];

}
