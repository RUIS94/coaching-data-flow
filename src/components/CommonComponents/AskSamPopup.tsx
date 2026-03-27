import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Bot, Send } from "lucide-react";

type ChatMessage = { id: string; type: "user" | "sam"; content: string; timestamp: string };

interface AskSamPopupProps {
  questions: string[];
  onGenerateAnswer: (q: string) => string;
  triggerLabel?: string;
  buttonClassName?: string;
  description?: string;
  mode?: "dialog" | "sheet";
  sheetSide?: "right" | "left" | "top" | "bottom";
}

export function AskSamPopup({
  questions,
  onGenerateAnswer,
  triggerLabel = "Ask Sam",
  buttonClassName,
  description = "Choose a question or ask directly to get deal and coaching insights.",
  mode = "dialog",
  sheetSide = "right",
}: AskSamPopupProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "sam",
      content: "Hi, I’m Sam. Ask about deals, coaching actions, or pipeline insights.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, open]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = { id: String(Date.now()), type: "user", content: text, timestamp: now };
    setChatHistory((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsSending(true);
    const answer = onGenerateAnswer(text);
    const samMsg: ChatMessage = { id: String(Date.now() + 1), type: "sam", content: answer, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setChatHistory((prev) => [...prev, samMsg]);
    setIsSending(false);
  };

  const content = (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-3 space-y-4">
        {chatHistory.map((m) => (
          <div key={m.id} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${m.type === "user" ? "order-2" : "order-1"}`}>
              <div className={`rounded-lg px-4 py-3 ${m.type === "user" ? "bg-[#E0E6FF] text-gray-900" : "bg-white border border-border text-foreground"}`}>
                <div className="text-sm whitespace-pre-wrap">{m.content}</div>
              </div>
              <div className={`mt-1 text-[11px] text-muted-foreground ${m.type === "user" ? "text-right" : ""}`}>{m.timestamp}</div>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="rounded-lg px-4 py-3 bg-white border border-border">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t px-6 py-3 bg-white">
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputValue);
              }
            }}
            placeholder="Ask about risky deals, coaching actions, or pipeline value…"
            className="w-full px-3 py-3 pr-12 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={3}
          />
          <button
            aria-label="Send"
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim()}
            className="absolute right-2 bottom-2 p-2 text-[#FF8E1C] disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="border-t px-6 py-3 bg-muted/20">
        <div className="text-xs text-muted-foreground mb-2">Recommended Questions</div>
        <div className="flex flex-wrap gap-2 pb-2">
          {questions.map((q) => (
            <button
              key={q}
              onClick={() => {
                setInputValue(q);
                sendMessage(q);
              }}
              className="text-[11px] bg-background border border-border px-3 py-1.5 rounded-full hover:border-primary transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (mode === "sheet") {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="sm"
            className={buttonClassName ?? "gap-2 bg-white text-[#FF8E1C] border border-[#FF8E1C] hover:bg-[#FF8E1C] hover:text-white"}
          >
            <Bot className="h-4 w-4" />
            {triggerLabel}
          </Button>
        </SheetTrigger>
        <SheetContent side={sheetSide} className="p-0 sm:max-w-[560px] flex flex-col h-full">
          <SheetHeader className="px-6 pt-5 pb-3 border-b shrink-0">
            <SheetTitle>Ask Sam</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col flex-1 min-h-0">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={buttonClassName ?? "gap-2 bg-white text-[#FF8E1C] border border-[#FF8E1C] hover:bg-[#FF8E1C] hover:text-white"}
        >
          <Bot className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px] p-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b">
          <DialogTitle>Ask Sam</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col max-h-[70vh]">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
