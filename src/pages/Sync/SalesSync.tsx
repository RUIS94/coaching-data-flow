import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { useNavigate } from "react-router-dom";
import { mockAEReps, mockDeals, mockTasks, formatCurrency } from "@/data/mock";
import PulseFlow from "@/components/dashboard/PulseFlow";

export default function SalesSync() {
  const navigate = useNavigate();
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
    <div className="h-full bg-white overflow-auto" style={{ scrollbarGutter: 'stable both-edges' }}>
      <div className="sticky top-0 z-20 bg-white">
      <PageHeader
        title="S — Sync"
        subtitle="Team visibility, Pipeline Pulse posts & peer coaching — ~30 min"
        titleClassName="text-2xl font-bold text-gray-900"
        inlineChildren
      >
        <div className="flex items-center w-full justify-end gap-8">
          <div className="flex-shrink-0">
            <PulseFlow
              compact
              completeOnClick
              initialActiveStep="sync"
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
