// context/ChatContext.tsx
import { createContext, useContext, useState } from 'react';
import type { Message } from '@/types/chat';
import { ChatMessages } from '@/api/chats';

interface ChatContextValue {
    selectedChatId: number | null;
    setSelectedChatId: (id: number | null) => void;
    initialMessages: ChatMessages[];
    setInitialMessages: (messages: ChatMessages[]) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [initialMessages, setInitialMessages] = useState<ChatMessages[]>([]);

    return (
        <ChatContext.Provider
            value={{
                selectedChatId,
                setSelectedChatId,
                initialMessages,
                setInitialMessages,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const ctx = useContext(ChatContext);
    if (!ctx)
        throw new Error('useChatContext must be used within ChatProvider');
    return ctx;
}
