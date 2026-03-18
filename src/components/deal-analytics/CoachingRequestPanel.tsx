import { Send, BookOpen, CalendarPlus, Paperclip, StickyNote, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  dealName: string;
  repName: string;
  prefillTopic?: string;
  prefillReason?: string;
}

const CoachingRequestPanel = ({ dealName, repName, prefillTopic, prefillReason }: Props) => {
  const [topic, setTopic] = useState(prefillTopic ?? "");
  const [notes, setNotes] = useState("");
  const [materials, setMaterials] = useState("");
  const [attachInsights, setAttachInsights] = useState(true);
  const [sent, setSent] = useState(false);

  // Sync prefill
  if (prefillTopic && prefillTopic !== topic && !sent) {
    setTopic(prefillTopic);
    if (prefillReason) setNotes(prefillReason);
  }

  const handleSend = () => {
    if (!topic.trim()) {
      toast.error("Please enter a coaching topic");
      return;
    }
    setSent(true);
    toast.success(`Coaching request sent to ${repName}`, {
      description: `Topic: ${topic}`,
    });
  };

  const handleSchedule = () => {
    toast.info("Coaching session scheduled (demo)");
  };

  const handleMarkCoaching = () => {
    toast.success(`"${dealName}" marked as Needs Coaching`);
  };

  if (sent) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Coaching Request Sent</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {repName} has been notified about coaching on "{topic}"
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setSent(false)}
              className="text-xs px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Send Another
            </button>
            <button
              onClick={handleSchedule}
              className="text-xs px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Schedule Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Coaching Request</h2>
          <p className="text-xs text-muted-foreground">Initiate coaching for {repName} on {dealName}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Topic */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">Coaching Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Expanding Stakeholder Coverage"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            <StickyNote className="h-3 w-3 inline mr-1" />
            Coaching Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add context, observations, or specific areas to focus on..."
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none"
          />
        </div>

        {/* Materials */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">Preparation Materials</label>
          <input
            type="text"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            placeholder="Links to playbooks, case studies, or training resources"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        {/* Attach insights */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={attachInsights}
            onChange={(e) => setAttachInsights(e.target.checked)}
            className="rounded border-input text-primary focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            Attach deal insights & analytics
          </span>
        </label>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={handleSend}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            Send Coaching Request
          </button>
          <button
            onClick={handleMarkCoaching}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Mark as Needs Coaching
          </button>
          <button
            onClick={handleSchedule}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Schedule Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachingRequestPanel;
