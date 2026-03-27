import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, AlertCircle, UserX, Clock } from "lucide-react";
import { deals, salesReps, type Deal, type RiskLevel, type DealStage } from "@/data/dashboardData";
import HealthBadge from "./HealthBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToastContext } from "@/contexts/ToastContext";

const stages: DealStage[] = ["Discovery", "Qualification", "Proposal", "Negotiation", "Commit"];
const riskLevels: RiskLevel[] = ["High", "Medium", "Low"];

const DealsAttention = () => {
  const navigate = useNavigate();
  const [filterRep, setFilterRep] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterCommit, setFilterCommit] = useState("all");
  const [coachingDeals, setCoachingDeals] = useState<Set<string>>(
    new Set(deals.filter((d) => d.markedForCoaching).map((d) => d.id))
  );
  const { showInfo, showSuccess } = useToastContext();

  const filtered = deals
    .filter((d) => {
      if (filterRep !== "all" && d.repId !== filterRep) return false;
      if (filterStage !== "all" && d.stage !== filterStage) return false;
      if (filterRisk !== "all" && d.riskLevel !== filterRisk) return false;
      if (filterCommit === "commit" && d.commitStatus !== "Commit") return false;
      if (filterCommit === "commit-at-risk" && d.commitStatus !== "Commit at Risk") return false;
      return true;
    })
    .sort((a, b) => {
      const riskOrder = { High: 0, Medium: 1, Low: 2 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });

  const toggleCoaching = (dealId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCoachingDeals((prev) => {
      const next = new Set(prev);
      if (next.has(dealId)) {
        next.delete(dealId);
        showInfo("Deal removed from coaching list");
      } else {
        next.add(dealId);
        showSuccess("Deal marked for coaching");
      }
      return next;
    });
  };

  const getRepName = (repId: string) => salesReps.find((r) => r.id === repId)?.name ?? "";

  const selectClass =
    "text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Deals Requiring Attention</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} deals match your filters</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className={selectClass} value={filterRep} onChange={(e) => setFilterRep(e.target.value)}>
            <option value="all">All Reps</option>
            {salesReps.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <select className={selectClass} value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
            <option value="all">All Stages</option>
            {stages.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className={selectClass} value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
            <option value="all">All Risk Levels</option>
            {riskLevels.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select className={selectClass} value={filterCommit} onChange={(e) => setFilterCommit(e.target.value)}>
            <option value="all">All Commit Status</option>
            <option value="commit">Commit</option>
            <option value="commit-at-risk">Commit at Risk</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Deal</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Rep</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stage</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risk</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Last Activity</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Missing Stakeholders</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Coach</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((deal) => (
              <Tooltip key={deal.id}>
                <TooltipTrigger asChild>
                  <tr
                    onClick={() => navigate(`/deal-drilldown/${deal.repId}?deal=${deal.id}`)}
                    className={`cursor-pointer hover:bg-muted/30 transition-colors ${
                      deal.riskLevel === "High" ? "bg-destructive/[0.03]" : ""
                    }`}
                  >
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-medium text-foreground">{deal.name}</p>
                        <p className="text-xs text-muted-foreground">{deal.company} · ${(deal.value / 1000).toFixed(0)}K</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{getRepName(deal.repId)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground">{deal.stage}</span>
                        {deal.daysInStage > 20 && <Clock className="h-3.5 w-3.5 text-warning" />}
                      </div>
                      {deal.commitStatus && (
                        <span className={`text-xs ${deal.commitStatus === "Commit at Risk" ? "text-warning" : deal.commitStatus === "Commit" ? "text-success" : "text-muted-foreground"}`}>
                          {deal.commitStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <HealthBadge level={deal.riskLevel} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{deal.lastActivityDate}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {deal.missingStakeholders.length > 0 ? (
                        <div className="flex items-center gap-1 text-warning">
                          <UserX className="h-3.5 w-3.5" />
                          <span className="text-xs">{deal.missingStakeholders.join(", ")}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-success">All present</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => toggleCoaching(deal.id, e)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          coachingDeals.has(deal.id)
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <BookOpen className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm">
                  <div className="space-y-1">
                    <p className="font-medium">{deal.name}</p>
                    <p className="text-xs">Owner: {getRepName(deal.repId)}</p>
                    <p className="text-xs">Last: {deal.lastInteraction}</p>
                    <p className="text-xs">Next: {deal.nextSteps}</p>
                    <p className="text-xs">{deal.daysInStage} days in {deal.stage}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-sm">No deals match the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsAttention;
