import type { RiskLevel } from "@/data/dashboardData";

const config: Record<RiskLevel, { bg: string; text: string; dot: string }> = {
  High: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  Medium: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  Low: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
};

const HealthBadge = ({ level }: { level: RiskLevel }) => {
  const c = config[level];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {level}
    </span>
  );
};

export default HealthBadge;
