import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { mockDeals, mockAEReps, formatCurrency } from "@/data/mock";

export default function LeaderSync() {
  const postsReceived = 5;
  const totalReps = mockAEReps.length;

  const commitDeals = mockDeals.filter(d => d.forecast_category === "COMMIT");
  const teamCommitAmt = commitDeals.reduce((sum, d) => sum + d.amount, 0);
  const teamCommitCount = commitDeals.length;

  const redRiskDeals = mockDeals.filter(d => d.risk_level === "RED");
  const topRiskAmt = redRiskDeals.reduce((sum, d) => sum + d.amount, 0);
  const topRiskDealCount = redRiskDeals.length;
  const topRiskReasonCount = redRiskDeals.reduce((sum, d) => sum + (Array.isArray(d.risk_reasons) ? d.risk_reasons.length : 0), 0);

  const winsAmt = 320000;
  const winsDealCount = 3;
  const winsRepCount = 2;

  const helpRequestCount = 4;
  const helpTypes = "Pricing, EB intro";

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
                trend="up"
                trendLabel="+$120K vs last week"
                trendPositive={true}
              />
              <KPICard
                label="Top Risks"
                value={formatCurrency(topRiskAmt)}
                secondaryValue={`${topRiskDealCount} deals · ${topRiskReasonCount} risks`}
                trend="flat"
                trendLabel="Monitoring"
                trendPositive={false}
              />
              <KPICard
                label="Wins This Week"
                value={formatCurrency(winsAmt)}
                secondaryValue={`${winsDealCount} deals · ${winsRepCount} reps`}
                trend="up"
                trendLabel="+2 wins"
                trendPositive={true}
              />
              <KPICard
                label="Help Requests"
                value={`${helpRequestCount}`}
                secondaryValue={helpTypes}
                trend="flat"
                trendLabel="New requests in"
                trendPositive={false}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {talkingPoints.map((tp, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-white p-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Talking Point {idx + 1}</div>
                  <div className="text-sm text-foreground">{tp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
