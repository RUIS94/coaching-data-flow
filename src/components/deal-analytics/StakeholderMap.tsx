import { Users, Crown, Star, Shield, Briefcase, Wrench, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Stakeholder, StakeholderRole, EngagementLevel } from "@/data/dealAnalyticsData";

interface Props {
  stakeholders: Stakeholder[];
  missingStakeholders: string[];
}

const roleIcon: Record<StakeholderRole, typeof Crown> = {
  "Decision Maker": Crown,
  Influencer: Star,
  Champion: Shield,
  "Economic Buyer": Briefcase,
  "Technical Evaluator": Wrench,
};

const engagementStyles: Record<EngagementLevel, { ring: string; bg: string; text: string }> = {
  High: { ring: "ring-success/40", bg: "bg-success/10", text: "text-success" },
  Medium: { ring: "ring-warning/40", bg: "bg-warning/10", text: "text-warning" },
  Low: { ring: "ring-destructive/40", bg: "bg-destructive/10", text: "text-destructive" },
  None: { ring: "ring-muted-foreground/20", bg: "bg-muted", text: "text-muted-foreground" },
};

const StakeholderMap = ({ stakeholders, missingStakeholders }: Props) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Stakeholder Engagement Map</h2>
          <p className="text-xs text-muted-foreground">{stakeholders.length} identified · {missingStakeholders.length} missing</p>
        </div>
      </div>

      {/* Missing stakeholders alert */}
      {missingStakeholders.length > 0 && (
        <div className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-lg p-3 mb-4">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-destructive mb-1">Missing Stakeholders</p>
            <div className="flex flex-wrap gap-1.5">
              {missingStakeholders.map((s) => (
                <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stakeholder cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {stakeholders.map((sh) => {
          const RoleIcon = roleIcon[sh.role];
          const eng = engagementStyles[sh.engagement];
          return (
            <div key={sh.id} className={`rounded-lg border border-border p-4 ring-2 ${eng.ring} transition-all hover:shadow-sm`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full ${eng.bg} flex items-center justify-center flex-shrink-0`}>
                  <RoleIcon className={`h-4 w-4 ${eng.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{sh.name}</p>
                  <p className="text-xs text-muted-foreground">{sh.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{sh.role}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${eng.bg} ${eng.text}`}>{sh.engagement}</span>
                  </div>
                  {sh.lastActive && (
                    <p className="text-[11px] text-muted-foreground mt-1.5">Last active: {sh.lastActive}</p>
                  )}
                  {!sh.lastActive && (
                    <p className="text-[11px] text-destructive mt-1.5 font-medium">Never engaged</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
        {(["High", "Medium", "Low", "None"] as EngagementLevel[]).map((level) => (
          <div key={level} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={`w-2.5 h-2.5 rounded-full ${engagementStyles[level].bg} ring-2 ${engagementStyles[level].ring}`} />
            {level} Engagement
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakeholderMap;
