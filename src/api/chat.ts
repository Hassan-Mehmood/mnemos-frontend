import type { ChatRequest } from "@/types/chat";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function sendChatMessage(
  request: ChatRequest,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<void> {

  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/chats/invoke`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      user_id: request.userId,
      chat_id: request.chatId,
      message: request.message,
    }),
    signal,
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onToken(decoder.decode(value, { stream: true }));
  }
}

// Mock streaming for demo when no backend is available
export async function sendChatMessageMock(
  request: ChatRequest,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const responses = [
    `Sure! Here's a quick overview:\n\n## Response to your message\n\nI received your message: **"${request.message}"**\n\n`,
    `Here are some key points:\n\n- First, I processed your request\n- Then, I analyzed the content\n- Finally, I generated this response\n\n`,
    `\`\`\`typescript\n// Example code block\nconst greeting = "Hello!";\nconsole.log(greeting);\n\`\`\`\n\n`,
    `> This is a blockquote to demonstrate markdown rendering.\n\nFeel free to ask me anything else! 🚀`,
  ];

  const fullResponse = responses.join("");
  const words = fullResponse.split(/(?<=\s)/);

  for (const word of words) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 40));
    onToken(word);
  }
}
