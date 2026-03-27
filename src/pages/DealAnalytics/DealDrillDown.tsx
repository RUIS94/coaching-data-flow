import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, TrendingUp, AlertTriangle, DollarSign, Calendar, Users, Clock, BookOpen } from "lucide-react";
import { salesReps, getRepDeals, type Deal } from "@/data/dashboardData";
import HealthBadge from "@/components/dashboard/HealthBadge";
import { useToastContext } from "@/contexts/ToastContext";
import { useState } from "react";

const DealDrillDown = () => {
  const { repId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightDeal = searchParams.get("deal");
  const { showSuccess, showInfo } = useToastContext();

  const rep = salesReps.find((r) => r.id === repId);
  const repDeals = getRepDeals(repId ?? "");
  const [coachingSet, setCoachingSet] = useState<Set<string>>(
    new Set(repDeals.filter((d) => d.markedForCoaching).map((d) => d.id))
  );

  if (!rep) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Rep not found</p>
          <button onClick={() => navigate("/")} className="text-primary font-medium hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const toggleCoaching = (dealId: string) => {
    setCoachingSet((prev) => {
      const next = new Set(prev);
      if (next.has(dealId)) {
        next.delete(dealId);
        showInfo("Removed from coaching");
      } else {
        next.add(dealId);
        showSuccess("Marked for coaching");
      }
      return next;
    });
  };

  const coverage = ((rep.pipeline / rep.quota) * 100).toFixed(0);
  const highRiskDeals = repDeals.filter((d) => d.riskLevel === "High");
  const commitDeals = repDeals.filter((d) => d.commitStatus === "Commit" || d.commitStatus === "Commit at Risk");

  const stageOrder = ["Discovery", "Qualification", "Proposal", "Negotiation", "Commit", "Closed Won"];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {rep.avatar}
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{rep.name}</h1>
              <p className="text-xs text-muted-foreground">{rep.role} · {rep.email}</p>
            </div>
          </div>
          <HealthBadge level={rep.dealHealthScore} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Rep metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, label: "Pipeline", value: `$${(rep.pipeline / 1000).toFixed(0)}K`, color: "text-success", bg: "bg-success/10" },
            { icon: TrendingUp, label: "Coverage", value: `${coverage}%`, color: "text-primary", bg: "bg-primary/10" },
            { icon: AlertTriangle, label: "At Risk", value: rep.dealsAtRisk, color: "text-destructive", bg: "bg-destructive/10" },
            { icon: Users, label: "Total Deals", value: rep.totalDeals, color: "text-primary", bg: "bg-primary/10" },
          ].map((m) => (
            <div key={m.label} className="bg-card rounded-xl border border-border p-4">
              <div className={`${m.bg} rounded-lg p-2 w-fit mb-2`}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Pipeline stages */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Pipeline by Stage</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {stageOrder.map((stage) => {
              const stageDeals = repDeals.filter((d) => d.stage === stage);
              const stageValue = stageDeals.reduce((a, b) => a + b.value, 0);
              return (
                <div key={stage} className="flex-1 min-w-[120px] bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{stage}</p>
                  <p className="text-lg font-bold text-foreground">{stageDeals.length}</p>
                  <p className="text-xs text-muted-foreground">${(stageValue / 1000).toFixed(0)}K</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deal cards */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">All Deals ({repDeals.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {repDeals
              .sort((a, b) => {
                const ro = { High: 0, Medium: 1, Low: 2 };
                return ro[a.riskLevel] - ro[b.riskLevel];
              })
              .map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => navigate(`/deal-analytics/${deal.id}`)}
                  className={`bg-card rounded-xl border p-5 transition-all hover:shadow-md cursor-pointer ${
                    highlightDeal === deal.id
                      ? "border-primary ring-2 ring-primary/20"
                      : deal.riskLevel === "High"
                      ? "border-destructive/30"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{deal.name}</h3>
                      <p className="text-sm text-muted-foreground">{deal.company}</p>
                    </div>
                    <HealthBadge level={deal.riskLevel} />
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>${(deal.value / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{deal.lastActivityDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{deal.daysInStage}d in {deal.stage}</span>
                    </div>
                    {deal.commitStatus && (
                      <div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          deal.commitStatus === "Commit" ? "bg-success/10 text-success"
                          : deal.commitStatus === "Commit at Risk" ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                        }`}>
                          {deal.commitStatus}
                        </span>
                      </div>
                    )}
                  </div>
                  {deal.missingStakeholders.length > 0 && (
                    <div className="flex items-start gap-1.5 text-warning text-xs mb-3">
                      <Users className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span>Missing: {deal.missingStakeholders.join(", ")}</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mb-1">
                    <strong>Last:</strong> {deal.lastInteraction}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    <strong>Next:</strong> {deal.nextSteps}
                  </div>
                  <button
                    onClick={() => toggleCoaching(deal.id)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      coachingSet.has(deal.id)
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    {coachingSet.has(deal.id) ? "Coaching" : "Mark for Coaching"}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DealDrillDown;
