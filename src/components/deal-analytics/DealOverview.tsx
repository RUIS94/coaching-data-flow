import { DollarSign, Calendar, Users, Activity, Clock, Heart } from "lucide-react";
import type { Deal } from "@/data/dashboardData";
import type { DealAnalytics, EngagementLevel } from "@/data/dealAnalyticsData";
import HealthBadge from "@/components/dashboard/HealthBadge";

interface Props {
  deal: Deal;
  analytics: DealAnalytics | null;
  repName: string;
}

const engagementColor: Record<EngagementLevel, string> = {
  High: "text-success",
  Medium: "text-warning",
  Low: "text-destructive",
  None: "text-muted-foreground",
};

const engagementBg: Record<EngagementLevel, string> = {
  High: "bg-success/10",
  Medium: "bg-warning/10",
  Low: "bg-destructive/10",
  None: "bg-muted",
};

const DealOverview = ({ deal, analytics, repName }: Props) => {
  const qualScore = analytics?.qualificationScore ?? 0;
  const qualColor = qualScore >= 70 ? "text-success" : qualScore >= 40 ? "text-warning" : "text-destructive";

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{deal.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{deal.company}</p>
          </div>
          <HealthBadge level={deal.riskLevel} />
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
        {[
          { icon: Users, label: "Deal Owner", value: repName },
          { icon: Activity, label: "Stage", value: deal.stage },
          { icon: DollarSign, label: "Value", value: `$${(deal.value / 1000).toFixed(0)}K` },
          { icon: Calendar, label: "Expected Close", value: analytics?.expectedCloseDate ?? "—" },
        ].map((m) => (
          <div key={m.label} className="bg-card px-5 py-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <m.icon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{m.label}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Status indicators */}
      <div className="px-6 py-4 flex flex-wrap gap-4">
        <StatusPill label="Stakeholder Engagement" level={analytics?.stakeholderEngagement ?? "None"} />
        <StatusPill label="Communication Activity" level={analytics?.communicationActivity ?? "None"} />
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Last Activity:</span>
          <span className="font-medium text-foreground">{deal.lastActivityDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Heart className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Qualification:</span>
          <span className={`font-bold ${qualColor}`}>{qualScore}%</span>
        </div>
      </div>
    </div>
  );
};

const StatusPill = ({ label, level }: { label: string; level: EngagementLevel }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-muted-foreground">{label}:</span>
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${engagementBg[level]} ${engagementColor[level]}`}>
      {level}
    </span>
  </div>
);

export default DealOverview;
