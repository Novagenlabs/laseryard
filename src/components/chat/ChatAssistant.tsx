"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Loader2, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useChat, type ChatMessage } from "@/hooks/useChat";
import { WHATSAPP_NUMBER } from "@/lib/constants";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span
        className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
        style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
      />
      <span
        className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
        style={{ animationDelay: "150ms", animationDuration: "0.6s" }}
      />
      <span
        className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
        style={{ animationDelay: "300ms", animationDuration: "0.6s" }}
      />
    </div>
  );
}

function WhatsAppButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 rounded-full text-white text-[13px] font-semibold no-underline transition-all hover:brightness-110 active:scale-[0.97]"
      style={{
        background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
        boxShadow: "0 2px 8px rgba(37, 211, 102, 0.3)",
      }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Chat on WhatsApp
    </a>
  );
}

function renderMessageContent(content: string) {
  // Strip markdown link syntax around wa.me URLs: [text](https://wa.me/123) → https://wa.me/123
  let cleaned = content.replace(
    /\[([^\]]*)\]\((https?:\/\/wa\.me\/\d+)\)/g,
    "$2"
  );
  // Also strip duplicate wa.me URLs (keep only the first)
  const waUrls: string[] = [];
  cleaned = cleaned.replace(/https?:\/\/wa\.me\/\d+/g, (url) => {
    if (waUrls.includes(url)) return "";
    waUrls.push(url);
    return url;
  });
  // Clean up leftover whitespace from removals
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  // Now render wa.me URLs as buttons
  const waRegex = /https?:\/\/wa\.me\/\d+/g;
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = waRegex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      result.push(cleaned.slice(lastIndex, match.index));
    }
    result.push(<WhatsAppButton key={match.index} url={match[0]} />);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex === 0) return cleaned;
  if (lastIndex < cleaned.length) {
    result.push(cleaned.slice(lastIndex));
  }

  return <>{result}</>;
}

function MessageBubble({ message, isStreaming }: { message: ChatMessage; isStreaming: boolean }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
          isUser
            ? "bg-gray-800 text-white rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        }`}
      >
        {message.content ? (
          isUser ? message.content : renderMessageContent(message.content)
        ) : (isStreaming && (
          <span className="inline-block w-2 h-4 bg-muted-foreground animate-pulse rounded-sm" />
        ))}
      </div>
    </div>
  );
}

export function ChatAssistant() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 2-second appearance delay
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)]">
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          isMobile ? (
            <div
              className="absolute bottom-16 right-0 w-[calc(100vw-1.5rem)] max-w-[400px] flex flex-col bg-card rounded-2xl overflow-hidden transition-all duration-200 ease-out"
              style={{
                height: "min(70dvh, 500px)",
                isolation: "isolate",
                boxShadow:
                  "0 0 0 1px var(--border), 0 4px 16px var(--shadow-color), 0 12px 40px var(--shadow-color)",
              }}
            >
              <ChatPanelContent
                messages={messages}
                isLoading={isLoading}
                error={error}
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                whatsappUrl={whatsappUrl}
                onClose={() => setIsOpen(false)}
                onClear={clearMessages}
                messagesEndRef={messagesEndRef}
                inputRef={inputRef}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute bottom-16 right-0 w-96 h-[500px] flex flex-col bg-card rounded-2xl overflow-hidden"
              style={{
                isolation: "isolate",
                boxShadow:
                  "0 0 0 1px var(--border), 0 4px 16px var(--shadow-color), 0 12px 40px var(--shadow-color)",
              }}
            >
              <ChatPanelContent
                messages={messages}
                isLoading={isLoading}
                error={error}
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                whatsappUrl={whatsappUrl}
                onClose={() => setIsOpen(false)}
                onClear={clearMessages}
                messagesEndRef={messagesEndRef}
                inputRef={inputRef}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {isMobile ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          style={{
            background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)",
            boxShadow:
              "0 2px 8px oklch(from var(--gold) l c h / 30%), 0 8px 24px oklch(from var(--gold) l c h / 25%), inset 0 1px 0 oklch(1 0 0 / 20%)",
            transform: isOpen ? "scale(0.95)" : "scale(1)",
          }}
          aria-label={isOpen ? "Close chat" : "Open chat assistant"}
          aria-expanded={isOpen}
        >
          <div
            className="transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" aria-hidden="true" />
            ) : (
              <MessageCircle className="w-6 h-6 text-white" aria-hidden="true" />
            )}
          </div>
        </button>
      ) : (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          style={{
            background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)",
            boxShadow:
              "0 2px 8px oklch(from var(--gold) l c h / 30%), 0 8px 24px oklch(from var(--gold) l c h / 25%), inset 0 1px 0 oklch(1 0 0 / 20%)",
          }}
          aria-label={isOpen ? "Close chat" : "Open chat assistant"}
          aria-expanded={isOpen}
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" aria-hidden="true" />
            ) : (
              <MessageCircle className="w-6 h-6 text-white" aria-hidden="true" />
            )}
          </motion.div>
        </motion.button>
      )}
    </div>
  );
}

function ChatPanelContent({
  messages,
  isLoading,
  error,
  input,
  setInput,
  handleSubmit,
  whatsappUrl,
  onClose,
  onClear,
  messagesEndRef,
  inputRef,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  input: string;
  setInput: (v: string) => void;
  handleSubmit: (e: FormEvent) => void;
  whatsappUrl: string;
  onClose: () => void;
  onClear: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{
          background: "linear-gradient(135deg, #D4A853 0%, #B8922E 100%)",
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-[14px] leading-tight">
              Laser Yard
            </p>
            <p className="text-[12px] text-white/80 leading-tight">
              AI Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white text-[11px] font-medium"
            title="Talk to a human on WhatsApp"
          >
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
            <span>Human</span>
          </a>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close chat"
          >
            <X className="w-4 h-4 text-white" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain p-4 scrollbar-hide"
      >
        {messages.map((message, i) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={
              isLoading &&
              message.role === "assistant" &&
              i === messages.length - 1
            }
          />
        ))}

        {isLoading &&
          messages[messages.length - 1]?.content === "" &&
          messages[messages.length - 1]?.role === "assistant" && (
            <TypingIndicator />
          )}

        {error && (
          <div className="mb-3 px-4 py-3 bg-red-500/10 rounded-xl text-[13px] text-red-400">
            <p>{error}</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-red-700 font-medium hover:underline"
            >
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
              Chat on WhatsApp instead
            </a>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 p-3 border-t border-border flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about our services..."
          disabled={isLoading}
          className="flex-1 min-w-0 px-4 py-2.5 bg-muted rounded-full text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 shrink-0"
          style={{
            background:
              !isLoading && input.trim()
                ? "linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)"
                : undefined,
          }}
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" aria-hidden="true" />
          ) : (
            <Send className="w-5 h-5 text-white" aria-hidden="true" />
          )}
        </button>
      </form>
    </>
  );
}
