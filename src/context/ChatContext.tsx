// context/ChatContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { ChatMessages } from '@/api/chats';
import { useParams, useNavigate } from 'react-router-dom';

interface ChatContextValue {
    selectedChatId: string | null;
    setSelectedChatId: (id: string | null) => void;
    initialMessages: ChatMessages[];
    setInitialMessages: (messages: ChatMessages[]) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { chatId } = useParams<{ chatId?: string }>();
    const navigate = useNavigate();

    const parsedChatId = chatId ?? null;

    const [initialMessages, setInitialMessages] = useState<ChatMessages[]>([]);

    useEffect(() => {
        // Clear out messages if we navigated back to "New Chat" (/)
        if (parsedChatId === null) {
            setInitialMessages([]);
        }
    }, [parsedChatId]);

    const setSelectedChatId = (id: string | null) => {
        if (id !== null) {
            navigate(`/${id}`);
        } else {
            navigate(`/`);
        }
    };

    return (
        <ChatContext.Provider
            value={{
                selectedChatId: parsedChatId,
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
