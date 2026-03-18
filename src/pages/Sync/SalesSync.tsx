import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { mockAEReps, mockDeals, mockTasks, formatCurrency } from "@/data/mock";

export default function SalesSync() {
  const me = mockAEReps[0]?.name ?? "Myself";
  const pulseDate = new Date().toLocaleDateString();
  const repDeals = mockDeals.filter(d => d.owner_name === me);
  const commitDeals = repDeals.filter(d => d.forecast_category === "COMMIT");
  const commitAmt = commitDeals.reduce((s, d) => s + d.amount, 0);
  const commitText = `Commit: ${formatCurrency(commitAmt)} across ${commitDeals.length} deals`;
  const riskCounts: Record<string, number> = {};
  repDeals.forEach(d => d.risk_reasons.forEach(r => {
    const k = r.label;
    riskCounts[k] = (riskCounts[k] || 0) + (r.severity === "RED" ? 2 : 1);
  }));
  const topRisks = Object.entries(riskCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([label]) => label);
  const topRiskText = topRisks.length ? `Top Risk: ${topRisks.join(" · ")}` : "Top Risk: GREEN";
  const nextStepGaps = repDeals.filter(d => !d.next_step || !d.next_step.is_buyer_confirmed).length;
  const winLearningText = nextStepGaps > 0 ? "Win / Learning: Discovery depth → clearer success criteria" : "Win / Learning: Buyer-confirmed next steps across key deals";
  const ebMissing = repDeals.find(d => d.risk_reasons.some(r => r.code === "MISSING_EB"));
  const commitAtRisk = repDeals.find(d => d.risk_reasons.some(r => r.code === "COMMIT_AT_RISK"));
  const helpNeededText = [
    ebMissing ? `EB intro at ${ebMissing.account_name}` : null,
    commitAtRisk ? `Support on ${commitAtRisk.account_name}` : null,
  ].filter(Boolean).join("; ") || "Help Needed: —";

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
              <div className="text-sm font-semibold text-foreground">My Pipeline Pulse Post</div>
              <div className="text-xs text-muted-foreground">{pulseDate} update — auto-drafted from CRM</div>
            </div>
            <div className="text-[11px] text-muted-foreground">{me}</div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg border border-border bg-white p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">COMMIT</div>
                <div className="text-sm text-foreground">{commitText}</div>
              </div>
              <div className="rounded-lg border border-border bg-white p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">TOP RISK</div>
                <div className="text-sm text-foreground">{topRiskText}</div>
              </div>
              <div className="rounded-lg border border-border bg-white p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">WIN / LEARNING</div>
                <div className="text-sm text-foreground">{winLearningText}</div>
              </div>
              <div className="rounded-lg border border-border bg-white p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">HELP NEEDED</div>
                <div className="text-sm text-foreground">{helpNeededText}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
