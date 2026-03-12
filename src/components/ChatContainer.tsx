import { useChat } from "@/hooks/useChat";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const ChatContainer = () => {
  const { messages, isStreaming, sendMessage, abortStream } = useChat();

  return (
    <div className="flex flex-col h-screen bg-chat-bg">
      <MessageList messages={messages} />
      <ChatInput onSend={sendMessage} onAbort={abortStream} isStreaming={isStreaming} />
    </div>
  );
};

export default ChatContainer;
