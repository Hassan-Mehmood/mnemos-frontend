import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '@/types/chat';
import StreamingIndicator from './StreamingIndicator';
import { Copy, Check, FileText, Image } from 'lucide-react';
import { useState, useCallback } from 'react';
import { ChatMessages } from '@/api/chats';

interface MessageBubbleProps {
    message: ChatMessages;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
    const [copied, setCopied] = useState(false);
    const isUser = message.sender === 'user';

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [message.content]);

    return (
        <div
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in group`}
        >
            <div className={`max-w-[80%] md:max-w-[70%] relative`}>
                {/* Bubble */}
                <div
                    className={`px-4 py-3 rounded-2xl ${
                        isUser
                            ? 'bg-chat-user-bubble text-chat-user-bubble-fg rounded-br-md'
                            : 'bg-chat-assistant-bubble text-chat-assistant-bubble-fg rounded-bl-md'
                    }`}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                            {message.content}
                        </p>
                    ) : (
                        <div className="markdown-content text-[15px] leading-relaxed">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(
                                            className || '',
                                        );
                                        const codeString = String(
                                            children,
                                        ).replace(/\n$/, '');
                                        if (match) {
                                            return (
                                                <div className="my-3 rounded-lg overflow-hidden">
                                                    <div className="flex items-center justify-between px-4 py-2 bg-chat-code-bg text-xs text-chat-text-muted">
                                                        <span>{match[1]}</span>
                                                        <button
                                                            onClick={() =>
                                                                navigator.clipboard.writeText(
                                                                    codeString,
                                                                )
                                                            }
                                                            className="hover:text-chat-text transition-colors"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <SyntaxHighlighter
                                                        style={oneDark}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        customStyle={{
                                                            margin: 0,
                                                            borderRadius: 0,
                                                            fontSize: '0.85em',
                                                            background:
                                                                'hsl(220 15% 10%)',
                                                        }}
                                                    >
                                                        {codeString}
                                                    </SyntaxHighlighter>
                                                </div>
                                            );
                                        }
                                        return (
                                            <code
                                                className={className}
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                            {message.isStreaming && <StreamingIndicator />}
                        </div>
                    )}
                </div>

                {/* Copy button */}
                {!message.isStreaming && message.content && (
                    <button
                        onClick={handleCopy}
                        className="absolute -bottom-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-chat-text-muted hover:text-chat-text"
                        title="Copy message"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
