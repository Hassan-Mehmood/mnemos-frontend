import { useCallback, useRef, useState } from "react";
import type { FileAttachment } from "@/types/chat";
import { generateId } from "@/utils/ids";
import { Paperclip } from "lucide-react";

interface FileUploadButtonProps {
  onFilesSelected: (files: FileAttachment[]) => void;
  disabled?: boolean;
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

function fileToAttachment(file: File): FileAttachment {
  const attachment: FileAttachment = {
    id: generateId(),
    file,
    name: file.name,
    type: file.type,
    size: file.size,
  };
  if (file.type.startsWith("image/")) {
    attachment.previewUrl = URL.createObjectURL(file);
  }
  return attachment;
}

const FileUploadButton = ({ onFilesSelected, disabled }: FileUploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList) return;
      const attachments = Array.from(fileList)
        .filter((f) => ACCEPTED_TYPES.includes(f.type))
        .map(fileToAttachment);
      if (attachments.length) onFilesSelected(attachments);
      e.target.value = "";
    },
    [onFilesSelected]
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="p-2 rounded-lg text-chat-text-muted hover:text-chat-text hover:bg-chat-hover transition-colors disabled:opacity-40"
        title="Upload file"
      >
        <Paperclip className="w-5 h-5" />
      </button>
    </>
  );
};

export default FileUploadButton;
