import axios from "axios";
import type { ChatRequest } from "@/types/chat";

export async function sendChatMessage(
  request: ChatRequest,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const formData = new FormData();
  formData.append("message", request.message);
  formData.append("history", JSON.stringify(request.history));

  if (request.files) {
    request.files.forEach((f) => {
      formData.append("files", f.file, f.name);
    });
  }

  const response = await axios.post("/api/chat", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "stream",
    signal,
    adapter: "fetch",
  });

  const reader = (response.data as ReadableStream).getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    onToken(chunk);
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
