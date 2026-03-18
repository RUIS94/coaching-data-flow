import { useMemo, useState } from "react";
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { mockAEReps } from "@/data/mock";
import { Badge } from "@/components/ui/badge";

interface FlaggedCall {
  id: string;
  callName: string;
  dateTime: string;
  duration: string;
  focus: string[];
  aiScore: number;
  talkListen: string;
  questions: number;
  nextSteps: string;
  focusEval: string;
}

function makeFlaggedCalls(repName: string): FlaggedCall[] {
  return [
    {
      id: "f-1",
      callName: `${repName.split(" ")[0]}'s Discovery with Apex`,
      dateTime: "Tue 2:00 PM",
      duration: "38:26",
      focus: ["Discovery depth", "Next step clarity"],
      aiScore: 6.9,
      talkListen: "54:46",
      questions: 12,
      nextSteps: "EB intro by Friday",
      focusEval: "Depth improved mid-call; next step lacked buyer alignment.",
    },
  ];
}

export default function SalesUncover() {
  const me = mockAEReps[0].name;
  const calls = useMemo(() => makeFlaggedCalls(me), [me]);
  const [selfReflection, setSelfReflection] = useState("");

  return (
    <div className="h-full bg-white overflow-auto">
      <PageHeader
        title="U — Uncover"
        subtitle="Call coaching, skill diagnosis & voice note delivery — ~60 min"
        titleClassName="text-2xl font-bold text-gray-900"
      />
      <div className="px-6 pb-6 space-y-4">
        {calls.map(c => (
          <div key={c.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">{c.callName}</div>
                <div className="text-xs text-muted-foreground">{c.dateTime} · {c.duration}</div>
              </div>
              <div className="flex items-center gap-2">
                {c.focus.map(f => (
                  <span key={f} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#605BFF]/10 text-[#605BFF]">{f}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
              <div className="rounded-lg border border-border bg-white p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Talk:Listen</div>
                <div className="text-sm font-medium text-foreground">{c.talkListen}</div>
              </div>
              <div className="rounded-lg border border-border bg-white p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Questions Asked</div>
                <div className="text-sm font-medium text-foreground">{c.questions}</div>
              </div>
              <div className="rounded-lg border border-border bg-white p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Next Steps</div>
                <div className="text-sm font-medium text-foreground">{c.nextSteps}</div>
              </div>
              <div className="rounded-lg border border-border bg-white p-3 col-span-2">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Focus Area Evaluation</div>
                <div className="text-sm text-foreground">{c.focusEval}</div>
              </div>
              <div className="rounded-lg border border-border bg-white p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">AI Score</div>
                <div className="text-sm font-medium text-foreground">{c.aiScore.toFixed(1)}/10</div>
              </div>
            </div>
          </div>
        ))}

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-foreground">Self-Coaching Prompt</div>
            <Badge variant="outline" className="text-[11px]">Reflect first</Badge>
          </div>
          <div className="text-sm text-muted-foreground mb-3">
            Before your leader reviews, reflect: What would you do differently at minute 18?
          </div>
          <textarea
            value={selfReflection}
            onChange={e => setSelfReflection(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
            placeholder="Type your thoughts here..."
          />
        </div>
      </div>
    </div>
  );
}
