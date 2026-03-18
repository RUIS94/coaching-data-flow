import { Users, AlertTriangle, TrendingUp, ShieldAlert, DollarSign, Target } from "lucide-react";
import { getTeamSummary } from "@/data/dashboardData";

const riskColor = {
  High: "text-risk-low",
  Medium: "text-risk-medium",
  Low: "text-risk-high",
};

const SummaryCards = () => {
  const summary = getTeamSummary();

  const cards = [
    {
      label: "Team Members",
      value: summary.repCount,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Avg Deal Health",
      value: summary.teamAvgHealth,
      icon: TrendingUp,
      color: riskColor[summary.teamAvgHealth],
      bg: summary.teamAvgHealth === "High" ? "bg-success/10" : summary.teamAvgHealth === "Medium" ? "bg-warning/10" : "bg-destructive/10",
    },
    {
      label: "Total Deals",
      value: summary.totalDeals,
      icon: Target,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "High-Risk Deals",
      value: summary.highRiskDeals,
      icon: ShieldAlert,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Needs Attention",
      value: summary.dealsNeedingAttention,
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Total Pipeline",
      value: `$${(summary.totalPipeline / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`${card.bg} rounded-lg p-2`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{card.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
