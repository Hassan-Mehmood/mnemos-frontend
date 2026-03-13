import { useState, useCallback, useRef, useEffect } from "react";
import type { Message, FileAttachment } from "@/types/chat";
import { sendChatMessage } from "@/api/chat";
import { generateId } from "@/utils/ids";
import { useChatContext } from "@/context/ChatContext";
import { ChatMessages } from "@/api/chats";
import { useQueryClient } from "@tanstack/react-query";


export function useChat() {

  const { initialMessages, selectedChatId } = useChatContext();
  const [messages, setMessages] = useState<ChatMessages[]>(initialMessages);
  const queryClient = useQueryClient();

  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [selectedChatId, initialMessages]);

  const sendMessage = useCallback(
    async (content: string, files?: FileAttachment[]) => {
      if (!content.trim() && (!files || files.length === 0)) return;

      const userMessage: ChatMessages = {
        id: generateId(),
        sender: "user",
        content: content.trim(),
      };

      const assistantId = generateId();
      const assistantMessage: ChatMessages = {
        id: assistantId,
        sender: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await sendChatMessage(
          { message: content, files, chatId: selectedChatId, userId: 1 },
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
        console.log(err);
      } finally {
        // Update local state
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        );

        setIsStreaming(false);
        abortRef.current = null;

        // Always refresh the sidebar chat list (creates new entry for new chats)
        queryClient.invalidateQueries({ queryKey: ['chats'] });

        // Invalidate the cache so navigating back to this chat always fetches fresh messages
        if (selectedChatId) {
          queryClient.invalidateQueries({ queryKey: ['chat', selectedChatId] });
        }
      }
    },
    [selectedChatId, initialMessages, queryClient]
  );

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, sendMessage, abortStream };
}
