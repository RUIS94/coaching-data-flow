import { useMemo, useState } from "react";
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { mockAEReps, mockDeals, mockTasks, formatCurrency } from "@/data/mock";

export default function SalesCoachingDashboard() {
  const me = mockAEReps[0]?.name ?? "Sales Rep";
  const myDeals = useMemo(() => mockDeals.filter(d => d.owner_name === me), [me]);
  const today = new Date().toLocaleDateString();

  const pipelineAmt = useMemo(() => myDeals.reduce((sum, d) => sum + d.amount, 0), [myDeals]);
  const weeklyCommitAmt = useMemo(() => myDeals.filter(d => d.forecast_category === "COMMIT").reduce((sum, d) => sum + d.amount, 0), [myDeals]);
  const myRedRisks = useMemo(() => myDeals.filter(d => d.risk_level === "RED"), [myDeals]);
  const myTopRiskAmt = useMemo(() => myRedRisks.reduce((sum, d) => sum + d.amount, 0), [myRedRisks]);
  const topDeal = useMemo(() => myDeals.slice().sort((a, b) => b.amount - a.amount)[0], [myDeals]);
  const actionsDone = useMemo(() => mockTasks.filter(t => t.owner_name === me && t.status === "DONE").length, [me]);
  const coachingScore = mockAEReps.find(r => r.name === me)?.hygiene_score ?? 75;

  const [checklist, setChecklist] = useState([
    { id: "w1", text: "Review top risk deal and unblock", done: false },
    { id: "w2", text: "Confirm buyer next steps on all commit deals", done: false },
    { id: "w3", text: "Draft voice note update for leader", done: false },
    { id: "w4", text: "Capture win/learning clip for peers", done: false },
  ]);
  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  };

  const [reflection, setReflection] = useState("");
  const peers = useMemo(() => mockAEReps.filter(r => r.name !== me).slice(0, 6), [me]);
  const peerHighlights = useMemo(() => {
    const presets = [
      { problem: "Single-threaded risk", action: "Mapped stakeholders, engaged champion", outcome: "Secured EB intro & buyer-confirmed next step" },
      { problem: "Missing EB access", action: "Built sponsor, crafted EB-ready narrative", outcome: "EB meeting scheduled" },
      { problem: "Stage dwell too long", action: "Defined clear exit criteria in MAP", outcome: "Progressed stage" },
      { problem: "Budget timing objection", action: "Framed ROI and phased plan", outcome: "Agreed path to commit" },
      { problem: "No buyer-confirmed next step", action: "Closed with mutual action plan", outcome: "Next step confirmed" },
      { problem: "Low stakeholder engagement", action: "Used relevant customer story", outcome: "Re-engaged decision group" },
    ];
    return peers.map((r, idx) => {
      const p = presets[idx % presets.length];
      return { id: `ph-${r.user_id}`, peer: r.name, ...p };
    });
  }, [peers]);

  return (
    <div className="h-full bg-white overflow-auto">
      <PageHeader
        title="Coaching Dashboard"
        subtitle="Personal pipeline, coaching insights & weekly progress"
        titleClassName="text-2xl font-bold text-gray-900"
      />

      <div className="px-6 pb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <KPICard
            label="My Pipeline"
            value={formatCurrency(pipelineAmt)}
            trend="flat"
            trendLabel="Current"
            trendPositive={true}
          />
          <KPICard
            label="Weekly Commit"
            value={formatCurrency(weeklyCommitAmt)}
            trend="up"
            trendLabel="+$25K WoW"
            trendPositive={true}
          />
          <KPICard
            label="My Top Risk"
            value={formatCurrency(myTopRiskAmt)}
            secondaryValue={`${myRedRisks.length} deals`}
            trend="flat"
            trendLabel="Focus this week"
            trendPositive={false}
          />
          <KPICard
            label="My Top Deal"
            value={topDeal ? formatCurrency(topDeal.amount) : "$0"}
            note={topDeal ? topDeal.account_name + " / " + topDeal.deal_name : "—"}
          />
          <KPICard
            label="Actions Done"
            value={`${actionsDone}`}
            trend="up"
            trendLabel="+2 tasks"
            trendPositive={true}
          />
          <KPICard
            label="Coaching Score"
            value={`${coachingScore}/100`}
            trend="flat"
            trendLabel="Balanced"
            trendPositive={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-semibold text-foreground mb-2">My Weekly Checklist</div>
            <div className="space-y-2">
              {checklist.map(item => (
                <label key={item.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleChecklist(item.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className={item.done ? "line-through text-muted-foreground" : "text-foreground"}>{item.text}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="px-4 py-3 border-b border-border bg-gray-50">
              <div className="text-sm font-semibold text-foreground">
                Coaching Voice Note (From your leader — received {today})
              </div>
            </div>
            <div className="p-4 space-y-4">
              <audio controls className="w-full">
                <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
              </audio>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">COACHING FORMULA: P-O-Q</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-border bg-white p-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Positive</div>
                  <div className="text-sm text-foreground">Great framing of business impact in discovery.</div>
                </div>
                <div className="rounded-lg border border-border bg-white p-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Observation</div>
                  <div className="text-sm text-foreground">Next step clarity can be buyer-confirmed earlier.</div>
                </div>
                <div className="rounded-lg border border-border bg-white p-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Question</div>
                  <div className="text-sm text-foreground">How will you secure EB access next call?</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground mb-2">YOUR REFLECTION</div>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                  placeholder="Write your reflection and intended actions..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
            <div className="text-sm font-semibold text-foreground">My Deals — Health Check</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">Deal name</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Health</th>
                  <th className="py-3 px-4">Next Step</th>
                  <th className="py-3 px-4">Days in Stage</th>
                </tr>
              </thead>
              <tbody>
                {myDeals.map(d => (
                  <tr key={d.deal_id} className="border-t border-border hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">{d.account_name} / {d.deal_name}</td>
                    <td className="py-3 px-4">{formatCurrency(d.amount)}</td>
                    <td className="py-3 px-4">{d.stage_name}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium ${d.risk_level === "RED" ? "text-status-red" : d.risk_level === "AMBER" ? "text-yellow-600" : "text-status-green"}`}>
                        {d.risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {d.next_step ? d.next_step.description : "—"}
                    </td>
                    <td className="py-3 px-4">{d.stage_dwell_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
            <div className="text-sm font-semibold text-foreground">Peers Highlights — Learn from Others</div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {peerHighlights.map(h => (
                <div key={h.id} className="rounded-lg border border-border bg-white p-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{h.peer}</div>
                  <div className="mt-1">
                    <div className="text-xs text-muted-foreground">Problem</div>
                    <div className="text-sm text-foreground">{h.problem}</div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground">Action</div>
                    <div className="text-sm text-foreground">{h.action}</div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground">Outcome</div>
                    <div className="text-sm text-foreground">{h.outcome}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
