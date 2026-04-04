import { useState, useCallback, useRef, useEffect } from "react";
import type { Message, FileAttachment } from "@/types/chat";
import { sendChatMessage } from "@/api/chat";
import { generateId } from "@/utils/ids";
import { useChatContext } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { ChatMessages } from "@/api/chats";
import { useQueryClient } from "@tanstack/react-query";


export function useChat() {

  const { user } = useAuth();

  const { initialMessages, selectedChatId, setSelectedChatId } = useChatContext();
  const [messages, setMessages] = useState<ChatMessages[]>(initialMessages);
  const queryClient = useQueryClient();

  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const skipNextResetRef = useRef(false);
  const isSendingRef = useRef(false);

  const selectedChatIdRef = useRef(selectedChatId);

  useEffect(() => {
    // Always keep the ref synced with the current chat ID so we don't accidentally
    // detect a change delayed by an early return
    const isNewChatNavigation = selectedChatIdRef.current !== selectedChatId;
    selectedChatIdRef.current = selectedChatId;

    if (skipNextResetRef.current) {
      skipNextResetRef.current = false;
      return;
    }

    // If the chat ID changed natively (not via the skipNextReset pathway), reset messages
    if (isNewChatNavigation) {
      setMessages(initialMessages);
      return;
    }

    // Don't overwrite local optimistic state during an active send
    if (isSendingRef.current) return;

    setMessages(initialMessages);
  }, [selectedChatId, initialMessages]);

  const sendMessage = useCallback(
    async (content: string, files?: FileAttachment[]) => {
      if (!content.trim() && (!files || files.length === 0)) return;

      // For new chats, generate an ID and navigate before sending
      const chatId = selectedChatId ?? generateId();
      if (!selectedChatId) {
        skipNextResetRef.current = true; // prevent the navigation-triggered effect from wiping optimistic messages
        setSelectedChatId(chatId);
      }

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
      isSendingRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await sendChatMessage(
          { message: content, files, chatId, userId: user?.id || '' },
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
        // Update local state and the query cache simultaneously!
        setMessages((prev) => {
          const updatedMessages = prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          );

          // Optimistically update React Query cache with the fully streamed message
          // This prevents network race conditions where a fast refetch might get old DB state
          queryClient.setQueryData(['chat', chatId], updatedMessages);
          return updatedMessages;
        });

        setIsStreaming(false);
        isSendingRef.current = false;
        abortRef.current = null;

        // Always refresh the sidebar chat list (creates new entry for new chats)
        queryClient.invalidateQueries({ queryKey: ['chats'] });

        // Mark the chat as stale so it refetches next time it's mounted, but don't force immediate refetch
        queryClient.invalidateQueries({ queryKey: ['chat', chatId], refetchType: 'none' });
      }
    },
    [selectedChatId, setSelectedChatId, queryClient]
  );

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, sendMessage, abortStream };
}
