import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { mockAEReps, mockDeals, mockTasks, mockDecisions } from "@/data/mock";

export default function SalesEvaluate() {
  const me = mockAEReps[0]?.name ?? "Myself";
  const repDeals = mockDeals.filter(d => d.owner_name === me);
  const commitDeals = repDeals.filter(d => d.forecast_category === "COMMIT");
  const myWinRate = repDeals.length ? `${Math.round((commitDeals.length / repDeals.length) * 100)}%` : "0%";
  const repDecisions = mockDecisions.filter(dec => {
    const deal = mockDeals.find(d => d.deal_name === dec.deal_name);
    return deal && deal.owner_name === me;
  });
  const noChange = repDecisions.filter(d => d.decision_type === "NO_CHANGE").length;
  const accuracy = repDecisions.length ? noChange / repDecisions.length : 0.9;
  const forecastAccuracy = `±${Math.round((1 - accuracy) * 100)}%`;
  const actionsCompleted = mockTasks.filter(t => t.owner_name === me && t.status === "DONE").length.toString();
  const talkListenTrend = "50:50";

  const riskTopicMap: Record<string, { topic: string; outcome: string; note: (deal: typeof repDeals[number]) => string }> = {
    STAGE_STUCK: { topic: "Discovery Depth", outcome: "Applied probing questions", note: (deal) => "Improved qualification" },
    NO_NEXT_STEP_DATE: { topic: "Next Step Clarity", outcome: "Buyer-confirmed next steps", note: (deal) => "Reduced slippage" },
    WEAK_VALUE: { topic: "Value Articulation", outcome: "Framed business impact", note: (deal) => `Advanced ${deal.account_name}` },
  };
  const history = (() => {
    const entries: { date: string; topic: string; outcome: string; note: string }[] = [];
    const seen: Set<string> = new Set();
    repDeals.forEach(deal => {
      deal.risk_reasons.forEach(r => {
        if (riskTopicMap[r.code] && !seen.has(r.code)) {
          seen.add(r.code);
          const m = riskTopicMap[r.code];
          entries.push({
            date: new Date().toLocaleDateString(),
            topic: m.topic,
            outcome: m.outcome,
            note: m.note(deal),
          });
        }
      });
    });
    while (entries.length < 3 && repDeals.length) {
      const deal = repDeals[entries.length % repDeals.length];
      entries.push({
        date: new Date().toLocaleDateString(),
        topic: "Commit Hygiene",
        outcome: "Stabilized forecast",
        note: `Focused ${deal.account_name}`,
      });
    }
    return entries.slice(0, 3);
  })();

  return (
    <div className="h-full bg-white overflow-auto">
      <PageHeader
        title="E — Evaluate"
        subtitle="Measurement, pattern recognition & continuous improvement — ~15 min Friday"
        titleClassName="text-2xl font-bold text-gray-900"
      />
      <div className="px-6 pb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="My Win Rate" value={myWinRate} trend="up" trendLabel="+1% WoW" trendPositive={true} />
          <KPICard label="Forecast Accuracy" value={forecastAccuracy} trend="flat" trendLabel="Stable" trendPositive={false} />
          <KPICard label="Actions Completed" value={actionsCompleted} trend="up" trendLabel="+3 tasks" trendPositive={true} />
          <KPICard label="Talk:Listen Trend" value={talkListenTrend} trend="flat" trendLabel="Balanced" trendPositive={true} />
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
            <div className="text-sm font-semibold text-foreground">My Coaching History</div>
          </div>
          <div className="rounded overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground bg-secondary/40">
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-3 py-2 font-medium">Focus</th>
                  <th className="text-left px-3 py-2 font-medium">Outcome</th>
                  <th className="text-left px-3 py-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-t border-border hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">{h.date}</td>
                    <td className="py-3 px-4">{h.topic}</td>
                    <td className="py-3 px-4">{h.outcome}</td>
                    <td className="py-3 px-4">{h.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
