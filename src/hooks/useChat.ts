import { useState, useCallback, useRef } from "react";
import type { Message, FileAttachment } from "@/types/chat";
import { sendChatMessageMock } from "@/api/chat";
import { generateId } from "@/utils/ids";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, files?: FileAttachment[]) => {
      if (!content.trim() && (!files || files.length === 0)) return;

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        files,
        timestamp: new Date(),
      };

      const assistantId = generateId();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        await sendChatMessageMock(
          { message: content, files, history },
          (token) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + token }
                  : m
              )
            );
          },
          controller.signal
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content || "Sorry, something went wrong." }
                : m
            )
          );
        }
      } finally {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        );
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages]
  );

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, sendMessage, abortStream };
}
