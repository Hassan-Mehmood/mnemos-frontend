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
  userId: string;
  chatId: string | null;
  message: string;
  files?: FileAttachment[];

}
