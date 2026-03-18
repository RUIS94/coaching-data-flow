import { useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { salesReps, getRepDeals } from "@/data/dashboardData";
import HealthBadge from "./HealthBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TeamOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Team Overview</h2>
        <p className="text-sm text-muted-foreground">Performance snapshot across all reps</p>
      </div>
      <div className="divide-y divide-border">
        {salesReps.map((rep) => {
          const repDeals = getRepDeals(rep.id);
          const highRiskCount = repDeals.filter((d) => d.riskLevel === "High").length;
          const hasAlert = highRiskCount >= 2;

          return (
            <Tooltip key={rep.id}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => navigate(`/deal-drilldown/${rep.id}`)}
                  className={`flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-muted/50 transition-colors ${hasAlert ? "bg-destructive/5" : ""}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {rep.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">{rep.name}</span>
                      {hasAlert && <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{rep.role}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{rep.totalDeals}</p>
                      <p className="text-xs text-muted-foreground">Deals</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-destructive">{rep.dealsAtRisk}</p>
                      <p className="text-xs text-muted-foreground">At Risk</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-primary">{rep.dealsInCommit}</p>
                      <p className="text-xs text-muted-foreground">Commit</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-warning">{rep.dealsCommitAtRisk}</p>
                      <p className="text-xs text-muted-foreground">Commit Risk</p>
                    </div>
                  </div>
                  <HealthBadge level={rep.dealHealthScore} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">{rep.name}</p>
                  <p className="text-xs">Pipeline: ${(rep.pipeline / 1000).toFixed(0)}K / Quota: ${(rep.quota / 1000).toFixed(0)}K</p>
                  <p className="text-xs">Coverage: {((rep.pipeline / rep.quota) * 100).toFixed(0)}%</p>
                  <p className="text-xs">{rep.email}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default TeamOverview;
