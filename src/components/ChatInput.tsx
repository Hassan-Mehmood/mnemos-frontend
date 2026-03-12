import { useState, useRef, useCallback, useEffect } from "react";
import type { FileAttachment } from "@/types/chat";
import FileUploadButton from "./FileUploadButton";
import { generateId } from "@/utils/ids";
import { Send, Square, X, FileText, Image } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, files?: FileAttachment[]) => void;
  onAbort: () => void;
  isStreaming: boolean;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/json",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

const ChatInput = ({ onSend, onAbort, isStreaming }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, []);

  const handleSend = useCallback(() => {
    if (isStreaming) return;
    if (!input.trim() && files.length === 0) return;
    onSend(input, files.length > 0 ? files : undefined);
    setInput("");
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, files, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const addFiles = useCallback((newFiles: FileAttachment[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files)
        .filter((f) => ACCEPTED_TYPES.includes(f.type))
        .map((file) => {
          const att: FileAttachment = {
            id: generateId(),
            file,
            name: file.name,
            type: file.type,
            size: file.size,
          };
          if (file.type.startsWith("image/")) att.previewUrl = URL.createObjectURL(file);
          return att;
        });
      if (droppedFiles.length) addFiles(droppedFiles);
    },
    [addFiles]
  );

  const canSend = (input.trim().length > 0 || files.length > 0) && !isStreaming;

  return (
    <div className="sticky bottom-0 bg-chat-bg px-4 pb-4 pt-2">
      <div
        className={`max-w-3xl mx-auto border rounded-2xl transition-colors ${
          isDragging ? "border-chat-accent bg-chat-hover" : "border-chat-input-border bg-chat-input-bg"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* File previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-chat-hover text-sm text-chat-text group/file"
              >
                {f.type.startsWith("image/") && f.previewUrl ? (
                  <img src={f.previewUrl} alt={f.name} className="w-8 h-8 object-cover rounded" />
                ) : f.type.startsWith("image/") ? (
                  <Image className="w-4 h-4 text-chat-text-muted" />
                ) : (
                  <FileText className="w-4 h-4 text-chat-text-muted" />
                )}
                <span className="truncate max-w-[100px] text-xs">{f.name}</span>
                <button
                  onClick={() => removeFile(f.id)}
                  className="opacity-0 group-hover/file:opacity-100 transition-opacity text-chat-text-muted hover:text-chat-text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
          <FileUploadButton onFilesSelected={addFiles} disabled={isStreaming} />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); adjustHeight(); }}
            onKeyDown={handleKeyDown}
            placeholder="Message ChatGPT…"
            rows={1}
            className="flex-1 bg-transparent text-chat-text placeholder:text-chat-text-muted resize-none outline-none text-[15px] leading-relaxed max-h-[200px]"
          />
          {isStreaming ? (
            <button
              onClick={onAbort}
              className="p-2 rounded-lg bg-chat-hover text-chat-text hover:bg-chat-accent hover:text-primary-foreground transition-colors"
              title="Stop generating"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="p-2 rounded-lg bg-chat-accent text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-chat-text-muted mt-2">
        ChatGPT can make mistakes. Consider checking important information.
      </p>
    </div>
  );
};

export default ChatInput;
