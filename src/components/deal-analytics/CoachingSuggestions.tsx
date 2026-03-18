import { GraduationCap, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { CoachingSuggestion } from "@/data/dealAnalyticsData";
import { useState } from "react";

interface Props {
  suggestions: CoachingSuggestion[];
  onSelectSuggestion: (topic: string, reason: string) => void;
}

const CoachingSuggestions = ({ suggestions, onSelectSuggestion }: Props) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!suggestions.length) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-accent/10">
          <GraduationCap className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Suggested Coaching Opportunities</h2>
          <p className="text-xs text-muted-foreground">AI-recommended areas for rep development</p>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((s) => {
          const isOpen = expanded === s.id;
          return (
            <div key={s.id} className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : s.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.topic}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.reason}</p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" /> Suggested Coaching Questions
                  </p>
                  <ul className="space-y-1.5 mb-3">
                    {s.questions.map((q, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-primary font-bold text-xs mt-0.5">{i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onSelectSuggestion(s.topic, s.reason)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Use as Coaching Topic
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoachingSuggestions;
