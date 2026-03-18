import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { KPICard } from "@/components/CommonComponents/KPICard";

export default function SalesEvaluate() {
  const myWinRate = "28%";
  const forecastAccuracy = "±9%";
  const actionsCompleted = "8";
  const talkListenTrend = "52:48";

  const history = [
    { date: "Fri, Mar 6", topic: "Discovery Depth", outcome: "Applied 3 probing questions", note: "Improved qualification" },
    { date: "Fri, Mar 13", topic: "Next Step Clarity", outcome: "Buyer-confirmed next steps", note: "Reduced slippage" },
    { date: "Fri, Mar 20", topic: "Value Articulation", outcome: "Framed business impact", note: "Advanced GlobalTech" },
  ];

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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Focus</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Note</th>
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
