const StreamingIndicator = () => {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <span className="w-1.5 h-1.5 rounded-full bg-chat-accent animate-pulse-dot" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-chat-accent animate-pulse-dot" style={{ animationDelay: "200ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-chat-accent animate-pulse-dot" style={{ animationDelay: "400ms" }} />
    </span>
  );
};

export default StreamingIndicator;
