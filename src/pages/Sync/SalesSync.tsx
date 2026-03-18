import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { mockAEReps } from "@/data/mock";

export default function SalesSync() {
  const me = mockAEReps[0]?.name ?? "Myself";
  const pulseDate = new Date().toLocaleDateString();

  const commitText = "Commit: $285K across 2 deals";
  const topRiskText = "Top Risk: Missing EB · Commit at Risk";
  const winLearningText = "Win / Learning: Discovery depth → clearer success criteria";
  const helpNeededText = "Help Needed: EB intro at GlobalTech; pricing guidance for Acme";

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
