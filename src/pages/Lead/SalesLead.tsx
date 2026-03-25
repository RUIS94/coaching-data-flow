import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { Badge } from "@/components/ui/badge";
import { mockAEReps, mockDeals } from "@/data/mock";
import PulseFlow from "@/components/dashboard/PulseFlow";

export default function SalesLead() {
  const navigate = useNavigate();
  const me = mockAEReps[0]?.name ?? "Myself";
  const repDeals = useMemo(() => mockDeals.filter(d => d.owner_name === me), [me]);
  const upcomingDeal = useMemo(() => {
    const withNext = repDeals.filter(d => d.next_step && d.next_step.date);
    withNext.sort((a, b) => (a.next_step!.date > b.next_step!.date ? 1 : -1));
    return withNext[0] || null;
  }, [repDeals]);
  const upcoming = upcomingDeal
    ? `${new Date(upcomingDeal.next_step!.date).toLocaleString()} · ${upcomingDeal.account_name}`
    : "—";
  const commitDeals = useMemo(() => repDeals.filter(d => d.forecast_category === "COMMIT"), [repDeals]);
  const ebMissing = useMemo(() => repDeals.find(d => d.risk_reasons.some(r => r.code === "MISSING_EB")) || null, [repDeals]);
  const [checklist, setChecklist] = useState([
    { id: "c1", text: "Review top deal risks and blockers", done: false },
    { id: "c2", text: "Draft agenda with top 3 priorities", done: false },
    { id: "c3", text: commitDeals.length ? "Confirm buyer next steps on all commit deals" : "Prepare voice note update on key call", done: false },
    { id: "c4", text: ebMissing ? `Engage EB/sponsor for ${ebMissing.account_name}` : "Compile proof points for decision maker", done: false },
  ]);

  const toggle = (id: string) => {
    setChecklist(list => list.map(i => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  return (
    <div className="h-full bg-white overflow-auto" style={{ scrollbarGutter: 'stable both-edges' }}>
      <div className="sticky top-0 z-20 bg-white">
      <PageHeader
        title="L — Lead"
        subtitle="Sync 1:1s, deal deep-dives & action management — ~75 min"
        titleClassName="text-2xl font-bold text-gray-900"
        inlineChildren
      >
        <div className="flex items-center w-full justify-end gap-8">
          <div className="flex-shrink-0">
            <PulseFlow
              compact
              completeOnClick
              initialActiveStep="lead"
              onNavigateToStep={(step) => {
                if (step === "prepare") navigate("/sales-prep");
                else if (step === "uncover") navigate("/sales-uncover");
                else if (step === "lead") navigate("/sales-lead");
                else if (step === "sync") navigate("/sales-sync");
                else if (step === "evaluate") navigate("/sales-evaluate");
              }}
            />
          </div>
        </div>
      </PageHeader>
      </div>
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
                <li>
                  AI Score: {(() => {
                    const avgRisk = repDeals.length ? repDeals.reduce((s, d) => s + d.risk_score, 0) / repDeals.length : 20;
                    return `${((100 - avgRisk) / 10).toFixed(1)}/10`;
                  })()}
                </li>
                <li>Talk:Listen: 50:50</li>
                <li>
                  Focus Areas: {(() => {
                    const hasDiscovery = repDeals.some(d => d.risk_reasons.some(r => r.code === "STAGE_STUCK"));
                    const hasNextStep = repDeals.some(d => !d.next_step || !d.next_step.is_buyer_confirmed || d.risk_reasons.some(r => r.code === "NO_NEXT_STEP_DATE"));
                    const areas = [];
                    if (hasDiscovery) areas.push("Discovery depth");
                    if (hasNextStep) areas.push("Next step clarity");
                    if (!areas.length) areas.push("Value articulation");
                    return areas.join(", ");
                  })()}
                </li>
                <li>
                  Strength: {(() => {
                    const confirmed = repDeals.filter(d => d.next_step && d.next_step.is_buyer_confirmed).length;
                    return confirmed ? `Buyer-confirmed next steps on ${confirmed} deals` : "Consistent progress on commit deals";
                  })()}
                </li>
                <li>
                  Opportunity: {(() => {
                    if (repDeals.some(d => d.risk_reasons.some(r => r.code === "MISSING_EB"))) return "Deepen exec alignment";
                    if (repDeals.some(d => d.risk_reasons.some(r => r.code === "COMMIT_AT_RISK"))) return "Stabilize commit risk in key accounts";
                    return "Accelerate stage progression";
                  })()}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
