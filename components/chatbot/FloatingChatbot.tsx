"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import {
  Bot,
  User,
  X,
  Send,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

function getContextLabel(pathname: string): string | null {
  const match = pathname.match(/\/learn\/([^/]+)\/([^/]+)/);
  if (match) {
    return `Chatting about: Lesson in ${decodeURIComponent(match[1]).replace(/-/g, " ")}`;
  }

  const courseMatch = pathname.match(/\/learn\/([^/]+)/);
  if (courseMatch) {
    return `Helping with: ${decodeURIComponent(courseMatch[1]).replace(/-/g, " ")}`;
  }

  if (pathname.startsWith("/practice")) {
    return "Practice help";
  }

  return null;
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      <span className="text-sm text-muted-foreground">Astra is thinking</span>
      <span className="flex gap-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/40 animate-bounce [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/40 animate-bounce [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/40 animate-bounce [animation-delay:300ms]" />
      </span>
    </div>
  );
}

function CodeBlock({
  language,
  children,
}: {
  language: string;
  children: string;
}) {
  return (
    <div className="my-2 rounded-lg overflow-hidden text-xs [&_div::-webkit-scrollbar]:hidden [&_div]:[-ms-overflow-style:none] [&_div]:[scrollbar-width:none]">
      <div className="flex items-center justify-between bg-[#3a3f4b] px-3 py-1.5">
        <span className="text-[11px] text-gray-400 font-mono">
          {language || "code"}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(children)}
          className="text-[11px] text-gray-400 hover:text-white transition-colors"
        >
          Copy
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || "text"}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, padding: "12px" }}
        showLineNumbers={false}
      >
        {children.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-2.5 w-full",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
          isUser
            ? "bg-brand-primary/10"
            : "bg-linear-to-br from-brand-primary to-brand-accent",
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-brand-primary" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-white" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-brand-primary text-white rounded-tr-md"
            : "bg-muted/60 text-foreground rounded-tl-md",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-headings:font-heading prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-code:text-brand-primary prose-code:bg-brand-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-ul:text-foreground prose-ol:text-foreground prose-li:leading-relaxed max-w-none [&_pre]:bg-transparent! [&_pre]:p-0!">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeStr = String(children).replace(/\n$/, "");

                  if (match) {
                    return (
                      <CodeBlock language={match[1]}>
                        {codeStr}
                      </CodeBlock>
                    );
                  }

                  return (
                    <code
                      className="bg-brand-primary/10 text-brand-primary px-1 py-0.5 rounded text-xs font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre({ children }) {
                  return <>{children}</>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FloatingChatbot() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async () => {
    setInitialLoading(true);
    try {
      const res = await fetch("/api/chat?limit=50");
      if (res.ok) {
        const data = await res.json();
        setMessages(
          (data.messages || []).map(
            (m: { id: string; role: string; content: string }) => ({
              id: m.id,
              role: m.role === "USER" ? "user" : "assistant",
              content: m.content,
            }),
          ),
        );
      }
    } catch {
      console.error("Failed to load chat history");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !initialLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, initialLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    try {
      const context = getContextLabel(pathname) || undefined;

      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context, history }),
      });

      if (!res.ok) throw new Error("API error");

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "" },
      ]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No stream reader available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: newMessages[lastIndex].content + chunkText,
          };
          return newMessages;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't reach Astra right now. Please try again!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClear() {
    setMessages([]);
    setInitialLoading(true);
    try {
      const res = await fetch("/api/chat?limit=0");
      if (res.ok) {
        setMessages([]);
      }
    } catch {
      //
    } finally {
      setInitialLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const contextLabel = getContextLabel(pathname);
  const isAuthenticated = !!session?.user;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:bg-transparent lg:pointer-events-none"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed z-50 transition-all duration-300 ease-in-out",
          isOpen
            ? "bottom-0 right-0 lg:bottom-24 lg:right-6 lg:w-100 lg:h-145 lg:rounded-2xl lg:shadow-2xl"
            : "bottom-6 right-6",
        )}
      >
        {isOpen ? (
          <div className="flex flex-col h-full bg-background border border-border/60 lg:rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-linear-to-r from-brand-primary/3 to-brand-accent/3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-primary to-brand-accent shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-semibold text-foreground leading-tight">
                    Astra
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Your AI Coding Buddy
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {initialLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-xs">Loading chat history...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-primary/10 to-brand-accent/10">
                    <Sparkles className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground text-sm">
                      Hi, I&apos;m Astra!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      I&apos;m your AI coding buddy. Ask me anything about
                      coding, your lessons, or how things work!
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 w-full mt-1">
                    {[
                      "What is a variable?",
                      "How do loops work?",
                      "Explain functions simply",
                      "Help me debug my code",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setInput(q);
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                        className="text-xs text-left px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <ChatMessage key={msg.id || i} message={msg} />
                ))
              )}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand-primary to-brand-accent">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-muted/60 px-3.5 py-2.5">
                    <LoadingDots />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {contextLabel && (
              <div className="shrink-0 px-4 py-1.5 border-t border-border/50 bg-muted/30">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/5 px-2.5 py-0.5 text-[10px] font-medium text-brand-primary">
                  <Sparkles className="h-3 w-3" />
                  {contextLabel}
                </span>
              </div>
            )}

            <div className="shrink-0 border-t border-border bg-background px-3 py-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Astra anything..."
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-primary to-brand-accent text-white hover:from-brand-primary/90 hover:to-brand-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-center text-xs text-muted-foreground py-2">
                  Sign in to chat with Astra
                </p>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setIsOpen(true);
              if (session?.user) fetchMessages();
            }}
            className="group flex items-center gap-2 rounded-2xl bg-linear-to-br from-brand-accent to-pink-500 text-white px-4 py-3 shadow-xl shadow-brand-accent/30 hover:shadow-2xl hover:shadow-brand-accent/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <Bot className="h-5 w-5" />
            <span className="font-heading text-sm font-semibold">
              Ask Astra
            </span>
          </button>
        )}
      </div>
    </>
  );
}
