import { AlertTriangle, Lightbulb, TrendingDown } from "lucide-react";
import type { RiskInsight } from "@/data/dealAnalyticsData";
import type { RiskLevel } from "@/data/dashboardData";

interface Props {
  insights: RiskInsight[];
}

const severityConfig: Record<RiskLevel, { border: string; bg: string; text: string; icon: string }> = {
  High: { border: "border-destructive/30", bg: "bg-destructive/5", text: "text-destructive", icon: "bg-destructive/10" },
  Medium: { border: "border-warning/30", bg: "bg-warning/5", text: "text-warning", icon: "bg-warning/10" },
  Low: { border: "border-success/30", bg: "bg-success/5", text: "text-success", icon: "bg-success/10" },
};

const RiskAnalysis = ({ insights }: Props) => {
  if (!insights.length) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Deal Risk & Gap Analysis</h2>
          <p className="text-xs text-muted-foreground">AI-generated insights on deal health</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const cfg = severityConfig[insight.severity];
          return (
            <div key={insight.id} className={`rounded-lg border ${cfg.border} ${cfg.bg} p-4`}>
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-md ${cfg.icon} mt-0.5 flex-shrink-0`}>
                  <AlertTriangle className={`h-3.5 w-3.5 ${cfg.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{insight.description}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.icon} ${cfg.text} uppercase tracking-wide`}>
                      {insight.severity}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-2">
                    <TrendingDown className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Impact:</strong> {insight.impact}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs text-primary">
                    <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Next Step:</strong> {insight.suggestedStep}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskAnalysis;
