import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAEReps } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type QueueStatus = "review" | "queued";

interface CallItem {
  id: string;
  rep: string;
  callName: string;
  duration: string;
  focus: string[];
  aiScore: number;
  talkListen: string;
  status: QueueStatus;
  dateTime: string;
}

const FOCUS_AREAS = ["Objection handling", "Discovery depth", "Next step clarity", "Value articulation", "Negotiation"];

function makeQueue(): CallItem[] {
  const reps = mockAEReps.slice(0, 6).map(r => r.name);
  const list: CallItem[] = [];
  let idx = 1;
  for (const r of reps) {
    list.push({
      id: `c-${idx++}`,
      rep: r,
      callName: `${r.split(" ")[0]}'s Discovery Call with Acme`,
      duration: "43:12",
      focus: [FOCUS_AREAS[idx % FOCUS_AREAS.length], FOCUS_AREAS[(idx + 2) % FOCUS_AREAS.length]],
      aiScore: 7 + ((idx % 4) - 2) * 0.5,
      talkListen: `${45 + (idx % 8)}:${55 - (idx % 8)}`,
      status: idx % 3 === 0 ? "queued" as const : "review" as const,
      dateTime: "Mon 10:00 AM",
    });
  }
  return list;
}

export default function LeaderUncover() {
  const navigate = useNavigate();
  const [repFilter, setRepFilter] = useState<string>("all");
  const [selectedCall, setSelectedCall] = useState<CallItem | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);

  const reps = useMemo(() => ["all", ...mockAEReps.map(r => r.name)], []);
  const queue = useMemo(() => makeQueue(), []);
  const filtered = useMemo(
    () => (repFilter === "all" ? queue : queue.filter(q => q.rep === repFilter)),
    [repFilter, queue]
  );

  const handleFocusClick = (call: CallItem, focus: string) => {
    setSelectedCall(call);
    setSelectedFocus(focus);
  };

  return (
    <div className="h-full bg-white overflow-auto">
      <PageHeader
        title="U — Uncover"
        subtitle="Call coaching, skill diagnosis & voice note delivery — ~60 min"
        titleClassName="text-2xl font-bold text-gray-900"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Reps</span>
          <Select value={repFilter} onValueChange={setRepFilter}>
            <SelectTrigger className="w-56 h-8 text-xs bg-white">
              <SelectValue placeholder="All Reps" />
            </SelectTrigger>
            <SelectContent>
              {reps.map(name => (
                <SelectItem
                  key={name}
                  value={name}
                  className="text-xs hover:bg-gray-100"
                >
                  {name === "all" ? "All Reps" : name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>
      <div className="px-6 pb-6 space-y-4">

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
            <div className="text-sm font-semibold text-foreground">Call Review Queue</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  {repFilter === "all" && <th className="py-3 px-4">Rep name</th>}
                  <th className="py-3 px-4">Call name</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Focus Area</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4">Talk:Listen</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(call => (
                  <tr key={call.id} className="border-t border-border hover:bg-gray-50 transition-colors">
                    {repFilter === "all" && (
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">{call.rep}</span>
                      </td>
                    )}
                    <td className="py-3 px-4">{call.callName}</td>
                    <td className="py-3 px-4">{call.duration}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {call.focus.map(f => (
                          <button
                            key={f}
                            className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#605BFF]/10 text-[#605BFF] hover:bg-[#605BFF]/20 transition-colors"
                            onClick={() => handleFocusClick(call, f)}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">{call.aiScore.toFixed(1)}/10</td>
                    <td className="py-3 px-4">{call.talkListen}</td>
                    <td className="py-3 px-4">
                      {call.status === "review" ? (
                        <Badge variant="outline" className="text-[11px] bg-status-green/10 text-status-green border-none">review</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px] bg-secondary/50 text-muted-foreground border-none">queued</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate("/meeting-intelligence")}>
                            Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border bg-gray-50">
            <div className="text-sm font-semibold text-foreground">
              Voice Note Coaching — {selectedCall ? selectedCall.callName : "—"}
            </div>
            <div className="text-xs text-muted-foreground">
              Pre-drafted using P-O-Q formula from AI call analysis
            </div>
          </div>
          <div className="p-4">
            {!selectedCall || !selectedFocus ? (
              <div className="text-sm text-muted-foreground">
                Please click a Focus Area above to load details.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Positive</div>
                  <div className="text-sm text-foreground">
                    {selectedCall.rep.split(" ")[0]}, you did a great job handling the initial pushback on timeline. Your reframe to business impact was smooth.
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Observation</div>
                  <div className="text-sm text-foreground">
                    Around minute 18, the {selectedFocus.toLowerCase()} could go deeper. Consider asking a probing question to uncover the why behind the concern.
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Question</div>
                  <div className="text-sm text-foreground">
                    Next time, how would you guide the buyer to articulate success criteria before positioning options?
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
