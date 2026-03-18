import { useState } from "react";
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { Badge } from "@/components/ui/badge";

export default function SalesLead() {
  const upcoming = "Thu 10:30 AM with Sarah Lee";
  const [checklist, setChecklist] = useState([
    { id: "c1", text: "Review top deal risks and blockers", done: false },
    { id: "c2", text: "Draft agenda with top 3 priorities", done: false },
    { id: "c3", text: "Prepare voice note update on key call", done: false },
    { id: "c4", text: "Compile proof points for decision maker", done: false },
  ]);

  const toggle = (id: string) => {
    setChecklist(list => list.map(i => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  return (
    <div className="h-full bg-white overflow-auto">
      <PageHeader
        title="L — Lead"
        subtitle="Sync 1:1s, deal deep-dives & action management — ~75 min"
        titleClassName="text-2xl font-bold text-gray-900"
      />
      <div className="px-6 pb-6">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
            <div>
              <div className="text-sm font-semibold text-foreground">My 1:1 Prep Brief</div>
              <div className="text-xs text-muted-foreground">Upcoming: {upcoming}</div>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-white p-4">
              <div className="text-sm font-semibold text-foreground mb-2">Checklist</div>
              <ul className="space-y-2">
                {checklist.map(item => (
                  <li key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggle(item.id)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-foreground">Call Coaching Summary</div>
                <Badge variant="outline" className="text-[11px]">Auto-analyzed</Badge>
              </div>
              <ul className="space-y-2 text-sm text-foreground">
                <li>AI Score: 7.2/10</li>
                <li>Talk:Listen: 52:48</li>
                <li>Focus Areas: Discovery depth, Next step clarity</li>
                <li>Strength: Clear reframes to business impact</li>
                <li>Opportunity: Deepen exec alignment before proposing roadmap</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
