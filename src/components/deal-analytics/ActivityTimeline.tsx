import { Video, Mail, Phone, MessageSquare, Clock } from "lucide-react";
import type { TimelineEntry, InteractionType } from "@/data/dealAnalyticsData";

interface Props {
  entries: TimelineEntry[];
}

const typeConfig: Record<InteractionType, { icon: typeof Video; color: string; bg: string }> = {
  Meeting: { icon: Video, color: "text-primary", bg: "bg-primary/10" },
  Email: { icon: Mail, color: "text-accent", bg: "bg-accent/10" },
  "Phone Call": { icon: Phone, color: "text-success", bg: "bg-success/10" },
  "Slack Message": { icon: MessageSquare, color: "text-warning", bg: "bg-warning/10" },
};

const ActivityTimeline = ({ entries }: Props) => {
  if (!entries.length) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Interaction Timeline</h2>
        <p className="text-sm text-muted-foreground">No interactions recorded for this deal.</p>
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Interaction Timeline</h2>
          <p className="text-xs text-muted-foreground">{entries.length} recorded interactions</p>
        </div>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-4">
          {sorted.map((entry, idx) => {
            const cfg = typeConfig[entry.type];
            const Icon = cfg.icon;
            return (
              <div key={entry.id} className="relative flex gap-4">
                {/* Dot */}
                <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{entry.type}</span>
                    <span className="text-xs text-muted-foreground">{entry.date} · {entry.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1.5">{entry.summary}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.participants.map((p) => (
                      <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;
