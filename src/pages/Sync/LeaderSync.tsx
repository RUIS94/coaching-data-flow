import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { mockDeals, mockAEReps, formatCurrency } from "@/data/mock";

export default function LeaderSync() {
  const postsReceived = 5;
  const totalReps = mockAEReps.length;

  const commitDeals = mockDeals.filter(d => d.forecast_category === "COMMIT");
  const teamCommitAmt = commitDeals.reduce((sum, d) => sum + d.amount, 0);
  const teamCommitCount = commitDeals.length;
  const baseMonthlyTarget = 1200000;
  const teamTargetAmt = Math.round(baseMonthlyTarget / 4);

  const redRiskDeals = mockDeals.filter(d => d.risk_level === "RED");
  const topRiskAmt = redRiskDeals.reduce((sum, d) => sum + d.amount, 0);
  const topRiskDealCount = redRiskDeals.length;
  const topRiskReasonCount = redRiskDeals.reduce((sum, d) => sum + (Array.isArray(d.risk_reasons) ? d.risk_reasons.length : 0), 0);
  const riskCounts = mockDeals.reduce<Record<string, number>>((acc, d) => {
    for (const r of d.risk_reasons || []) {
      acc[r.code] = (acc[r.code] ?? 0) + 1;
    }
    return acc;
  }, {});
  const riskEntries = Object.entries(riskCounts).sort((a, b) => b[1] - a[1]);
  const topRisk = riskEntries[0] ?? null;
  const topRiskCode = topRisk ? topRisk[0] : null;
  const topRiskCount = topRisk ? topRisk[1] : 0;
  const prettyCode = (code: string) =>
    code
      .split("_")
      .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join(" ");

  const winsAmt = 320000;
  const winsDealCount = 3;
  const winsRepCount = 2;

  const helpRequestCount = mockDeals.reduce((sum, d) => sum + ((d.help_needed?.length ?? 0)), 0);

  const talkingPoints = [
    "Team Commit momentum strong; reinforce EB access on red-risk deals.",
    "Prioritize negotiation readiness for top 3 Commit accounts.",
    "Coach discovery depth patterns observed in mid-stage deals.",
    "Nudge for Pipeline hygiene: confirm next steps and MAP updates.",
    "Celebrate wins; capture learning clips for peer library."
  ];

  return (
    <div className="h-full bg-white overflow-auto">
      <PageHeader
        title="S — Sync"
        subtitle="Team visibility, Pipeline Pulse posts & peer coaching — ~30 min"
        titleClassName="text-2xl font-bold text-gray-900"
      />

      <div className="px-6 pb-6 space-y-4">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
            <div>
              <div className="text-sm font-semibold text-foreground">Pipeline Pulse — Team Summary</div>
              <div className="text-xs text-muted-foreground">
                {postsReceived}/{totalReps} posts received this week
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                label="Team Commit"
                value={formatCurrency(teamCommitAmt)}
                secondaryValue={`${teamCommitCount} deals`}
                trend={teamCommitAmt >= teamTargetAmt ? "up" : "down"}
                trendLabel={`vs. ${formatCurrency(teamTargetAmt)} target`}
                trendPositive={teamCommitAmt >= teamTargetAmt}
              />
              <KPICard
                label="Top Risks"
                value={`${topRiskCount}`}
                note={topRiskCode ? `${prettyCode(topRiskCode)}: ${topRiskCount}` : "—"}
              />
              <KPICard
                label="Wins This Week"
                value={formatCurrency(winsAmt)}
                secondaryValue={`${winsDealCount} deals · ${winsRepCount} reps`}
                note={`Wins: ${winsDealCount}`}
              />
              <KPICard
                label="Help Requests"
                value={`${helpRequestCount}`}
                note={`Help Needed: ${helpRequestCount}`}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border bg-gray-50">
            <div className="text-sm font-semibold text-foreground">AUTO-DRAFTED SYNTHESIS VIDEO TALKING POINTS</div>
            <div className="text-xs text-muted-foreground">Generated from Pipeline Pulse posts and CRM signals</div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <div className="text-sm text-foreground">1. Commit status: We're at {formatCurrency(teamCommitAmt)} vs {formatCurrency(teamTargetAmt)} target</div>
              <div className="text-sm text-foreground">2. Wins: {winsDealCount} deals this week</div>
              <div className="text-sm text-foreground">3. Common theme: {topRiskCode ? prettyCode(topRiskCode) : "—"}</div>
              <div className="text-sm text-foreground">4. Priority for next week: Map stakeholders and secure EB access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
