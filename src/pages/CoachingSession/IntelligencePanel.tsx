import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Shield,
  Calculator,
  BarChart3,
  FileText,
  Swords,
  Target,
  Sparkles,
  Save,
} from "lucide-react";
import { toast } from "sonner";

const agendaItems = [
  { label: "Introduction & Rapport", done: true },
  { label: "Pain Points Discovery", done: true },
  { label: "Security & Compliance Deep Dive", done: false, active: true },
  { label: "Product Demo: Key Features", done: false },
  { label: "Pricing Discussion", done: false },
  { label: "Next Steps & Timeline", done: false },
];

const tools = [
  { label: "Battlecards", icon: Swords },
  { label: "Pricing Calculator", icon: Calculator },
  { label: "ROI Analysis", icon: BarChart3 },
  { label: "Case Studies", icon: FileText },
  { label: "Competitive Intel", icon: Target },
  { label: "Trust Center", icon: Shield },
];

const aiSuggestions = [
  "We're SOC2 Type II certified with annual audits — happy to share our latest report.",
  "Our platform encrypts data at rest (AES-256) and in transit (TLS 1.3).",
  "I can send you a link to our Trust Center for full compliance documentation.",
];

const currentQuestion = '"How does your security stack compare to SOC2 requirements?"';

export default function IntelligencePanel() {
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const insertSuggestion = (text: string) => {
    setNotes((prev) => (prev ? prev + "\n" + text : text));
  };

  const handleSave = () => {
    setSaved(true);
    toast.success("Notes saved successfully");
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <aside className="w-[400px] flex flex-col shrink-0">
      {/* Agenda */}
      <div className="p-6 border-b border-border overflow-y-auto" style={{ height: "25%" }}>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-4">
          Meeting Agenda
        </h3>
        <ul className="space-y-2.5">
          {agendaItems.map((item) => (
            <li
              key={item.label}
              className={`flex items-center gap-3 text-sm transition-opacity ${
                item.done ? "opacity-50" : ""
              } ${item.active ? "text-primary font-medium" : "text-foreground"}`}
            >
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Circle
                  className={`w-4 h-4 shrink-0 ${
                    item.active ? "text-primary" : "text-border"
                  }`}
                />
              )}
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Sales Toolkit */}
      <div className="p-6 border-b border-border" style={{ height: "20%" }}>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-4">
          Sales Toolkit
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.label}
              className="flex flex-col items-center gap-1.5 text-[11px] border border-border py-2.5 px-1 rounded-lg hover:border-primary hover:text-primary transition-all text-foreground"
            >
              <tool.icon className="w-4 h-4" />
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* AI Detection Zone */}
        <div className="bg-secondary p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <p className="text-[10px] font-bold text-accent uppercase tracking-wider">
              Question Detected
            </p>
          </div>
          <p className="text-sm font-medium text-foreground">{currentQuestion}</p>
          <AnimatePresence>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((suggestion, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => insertSuggestion(suggestion)}
                  className="text-[11px] bg-background border border-border px-3 py-1.5 rounded-full hover:border-accent transition-colors text-left leading-snug"
                >
                  {suggestion.slice(0, 50)}…
                </motion.button>
              ))}
            </div>
          </AnimatePresence>
        </div>

        {/* Text Editor */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex-1 p-6 text-sm focus:outline-none placeholder:text-muted resize-none bg-background text-foreground leading-relaxed"
          placeholder="Start typing meeting notes..."
        />

        {/* Save Bar */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {notes.length > 0 ? `${notes.split(/\s+/).filter(Boolean).length} words` : "No notes yet"}
          </span>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              saved
                ? "bg-primary/10 text-primary"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Notes"}
          </button>
        </div>
      </div>
    </aside>
  );
}
