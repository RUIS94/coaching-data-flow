import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bot, Send } from "lucide-react";

interface AskSamPopupProps {
  questions: string[];
  onGenerateAnswer: (q: string) => string;
  triggerLabel?: string;
  buttonClassName?: string;
  description?: string;
}

export function AskSamPopup({
  questions,
  onGenerateAnswer,
  triggerLabel = "Ask Sam",
  buttonClassName,
  description = "Choose a question or ask directly to get deal and coaching insights.",
}: AskSamPopupProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={
            buttonClassName ??
            "gap-2 bg-white text-[#FF8E1C] border border-[#FF8E1C] hover:bg-[#FF8E1C] hover:text-white"
          }
        >
          <Bot className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Ask Sam</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">Recommended Questions</div>
          <div className="flex flex-wrap gap-2">
            {questions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuestion(q);
                  setAnswer(onGenerateAnswer(q));
                }}
                className="text-[11px] bg-background border border-border px-3 py-1.5 rounded-full hover:border-primary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Question</label>
            <div className="relative">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && question.trim()) {
                    const a = onGenerateAnswer(question);
                    setAnswer(a);
                  }
                }}
                placeholder="e.g., List deals that need coaching"
                className="w-full rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                aria-label="Send"
                onClick={() => {
                  if (!question.trim()) return;
                  const a = onGenerateAnswer(question);
                  setAnswer(a);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FF8E1C] hover:opacity-80"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sam's Answer</label>
            <div className="min-h-[96px] rounded-md border border-border bg-muted/30 p-3 text-sm text-foreground whitespace-pre-wrap">
              {answer || "—"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
