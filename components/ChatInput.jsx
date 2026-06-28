'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowUp, ImageIcon, Video, FileText } from 'lucide-react';

// Max height (px) the textarea is allowed to auto-grow to before it
// switches to an internal scrollbar instead of growing further.
const MAX_TEXTAREA_HEIGHT = 150;

export default function ChatInput({ onSendMessage, isLoading, onStop }) {
  const [value, setValue] = useState('');
  const [attachmentOpen, setAttachmentOpen] = useState(false);

  const textareaRef = useRef(null);
  const attachmentRef = useRef(null);

  // Auto-expanding textarea logic:
  // 1. Reset height to 'auto' so scrollHeight reflects the natural content height.
  // 2. Read scrollHeight (the height needed to fit all content without scrolling).
  // 3. Clamp that value to MAX_TEXTAREA_HEIGHT and apply it as the new height.
  // 4. If content exceeds the max, overflowY becomes 'auto' so a scrollbar appears.
  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  };

  useEffect(() => {
    resizeTextarea();
  }, [value]);

  // Close the attachment menu when clicking outside of it.
  useEffect(() => {
    function handleClickOutside(event) {
      if (attachmentRef.current && !attachmentRef.current.contains(event.target)) {
        setAttachmentOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setValue('');
    // Reset textarea height back to its single-line default after sending.
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const attachmentOptions = [
    { label: 'Image', icon: ImageIcon },
    { label: 'Video', icon: Video },
    { label: 'Document', icon: FileText },
  ];

  return (
    <div className="px-4 pb-6 pt-2 sm:px-6 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent relative z-10">
      <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-[2rem] bg-[#1A1A1A]/70 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl border border-white/10 ring-1 ring-inset ring-white/5 transition-all focus-within:shadow-[0_8px_40px_rgba(245,158,11,0.2)] focus-within:border-amber-500/40">
        {/* Attachment '+' button and popup menu */}
        <div className="relative" ref={attachmentRef}>
          <AnimatePresence>
            {attachmentOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute bottom-14 left-0 z-30 w-44 rounded-2xl border border-border bg-surface/95 backdrop-blur-xl p-1.5 shadow-2xl"
              >
                {attachmentOptions.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => setAttachmentOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="h-4 w-4 text-amber-500/70" />
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setAttachmentOpen((prev) => !prev)}
            aria-label="Add attachment"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-amber-500"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Auto-expanding textarea */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Dhandho AI..."
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-3.5 text-sm font-medium text-white placeholder-gray-500 outline-none"
            style={{ maxHeight: `${MAX_TEXTAREA_HEIGHT}px` }}
          />
        </div>

        {/* Send / Stop button */}
        {isLoading ? (
          <button
            onClick={onStop}
            aria-label="Stop generating"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-500 transition-all hover:bg-red-500/30"
          >
            <div className="h-3.5 w-3.5 bg-current rounded-[2px]" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] disabled:scale-100 disabled:cursor-not-allowed disabled:from-border disabled:to-border disabled:text-gray-500 disabled:shadow-none"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
