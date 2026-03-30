import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { mockDeals, mockAEReps, formatCurrency, mockCalls } from "@/data/mock";
import PulseFlow from "@/components/dashboard/PulseFlow";
import { Button } from "@/components/ui/button";
import { AskSamPopup } from "@/components/CommonComponents/AskSamPopup";
import { ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export default function LeaderSync() {
  const navigate = useNavigate();
  const postsReceived = 5;
  const totalReps = mockAEReps.length;

  const commitDeals = mockDeals.filter(d => d.forecast_category === "COMMIT");
  const teamCommitAmt = commitDeals.reduce((sum, d) => sum + d.amount, 0);
  const teamCommitCount = commitDeals.length;
  const baseMonthlyTarget = 1200000;
  const teamTargetAmt = Math.round(baseMonthlyTarget / 4);

  const redRiskDeals = mockDeals.filter(d => d.risk_level === "RED");
  const topRiskAmt = redRiskDeals.reduce((sum, d) => sum + d.amount, 0);
  const topRiskDealCount = redRiskDeals.length;
  const topRiskReasonCount = redRiskDeals.reduce((sum, d) => sum + (Array.isArray(d.risk_reasons) ? d.risk_reasons.length : 0), 0);
  const riskCounts = mockDeals.reduce<Record<string, number>>((acc, d) => {
    for (const r of d.risk_reasons || []) {
      acc[r.code] = (acc[r.code] ?? 0) + 1;
    }
    return acc;
  }, {});
  const prettyCode = (code: string) =>
    code
      .split("_")
      .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join(" ");
  const riskEntries = Object.entries(riskCounts).sort((a, b) => b[1] - a[1]);
  const topRisk = riskEntries[0] ?? null;
  const topRiskCode = topRisk ? topRisk[0] : null;
  const topRiskCount = topRisk ? topRisk[1] : 0;
  const top3RiskCodes = riskEntries.slice(0, 3).map(([code]) => prettyCode(code)).join(", ");

  const winsAmt = 320000;
  const winsDealCount = 3;
  const winsRepCount = 2;
  const winCandidates = mockDeals.filter(d => d.risk_level === "GREEN");
  const winRepNames = Array.from(new Set(winCandidates.map(d => d.owner_name))).slice(0, Math.max(1, winsRepCount)).join(", ");

  const helpRequestCount = mockDeals.reduce((sum, d) => sum + ((d.help_needed?.length ?? 0)), 0);
  const helpCounts = mockDeals.reduce<Record<string, number>>((acc, d) => {
    for (const h of d.help_needed ?? []) {
      acc[h] = (acc[h] ?? 0) + 1;
    }
    return acc;
  }, {});
  const top2Helps = Object.entries(helpCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k).join(", ");

  const talkingPoints = [
    "Team Commit momentum strong; reinforce EB access on red-risk deals.",
    "Prioritize negotiation readiness for top 3 Commit accounts.",
    "Coach discovery depth patterns observed in mid-stage deals.",
    "Nudge for Pipeline hygiene: confirm next steps and MAP updates.",
    "Celebrate wins; capture learning clips for peer library."
  ];

  const askSamQuestions = [
    "What are the top team risks this week?",
    "Draft a quick sync talking points list",
    "Which deals need attention before Friday?",
    "What coaching theme should we focus on?"
  ];
  const askSamAnswer = (q: string) => {
    const l = q.toLowerCase();
    if (l.includes("risk")) return "Top risks cluster around missing EB access and unclear next steps on Commit deals.";
    if (l.includes("talking") || l.includes("agenda")) return "1) Commit status 2) Top 3 risks 3) Wins & learning 4) Help requests 5) Next week priorities.";
    if (l.includes("attention")) return "Focus on red-risk deals with near-term closes; validate next step dates and EB alignment.";
    if (l.includes("theme")) return "Emphasize discovery depth and negotiation readiness across mid-stage deals.";
    return "Ask about team risks, talking points, or a focus theme for this sync.";
  };

  const repSummaries = mockAEReps.map((rep) => {
    const repDeals = mockDeals.filter((d) => d.owner_name === rep.name);
    const actionsTotal = Math.max(8, Math.min(14, 6 + repDeals.length));
    const actionsDone = Math.max(0, Math.min(actionsTotal, Math.ceil((rep.hygiene_score / 100) * actionsTotal)));
    const percent = Math.round((actionsDone / Math.max(1, actionsTotal)) * 100);
    const perf = percent < 50 ? "At Risk" : percent < 100 ? "Watch" : "Strong";
    return { rep, perf, actionsDone, actionsTotal, percent };
  });
  const hasStrong = repSummaries.some(r => r.percent === 100);
  if (!hasStrong && repSummaries.length > 0) {
    const maxIdx = repSummaries.reduce((mi, r, i, arr) => (r.percent > arr[mi].percent ? i : mi), 0);
    const t = repSummaries[maxIdx];
    repSummaries[maxIdx] = { ...t, actionsDone: t.actionsTotal, percent: 100, perf: "Strong" };
  }
  const hasAtRisk = repSummaries.some(r => r.percent < 50);
  if (!hasAtRisk && repSummaries.length > 0) {
    const minIdx = repSummaries.reduce((mi, r, i, arr) => (r.percent < arr[mi].percent ? i : mi), 0);
    const t = repSummaries[minIdx];
    const newDone = Math.max(0, Math.min(t.actionsTotal - 1, Math.floor(t.actionsTotal * 0.45)));
    const newPct = Math.round((newDone / Math.max(1, t.actionsTotal)) * 100);
    repSummaries[minIdx] = { ...t, actionsDone: newDone, percent: newPct, perf: "At Risk" };
  }
  const hasWatch = repSummaries.some(r => r.percent >= 50 && r.percent < 100);
  if (!hasWatch) {
    const idx = repSummaries.findIndex(r => r.perf !== "Strong" && r.perf !== "At Risk");
    if (idx >= 0) {
      const t = repSummaries[idx];
      const newDone = Math.max(1, Math.min(t.actionsTotal - 1, Math.round(t.actionsTotal * 0.75)));
      const newPct = Math.round((newDone / Math.max(1, t.actionsTotal)) * 100);
      repSummaries[idx] = { ...t, actionsDone: newDone, percent: newPct, perf: "Watch" };
    }
  }

  const perfClass = (p: string) =>
    p === "At Risk"
      ? "text-red-700 bg-red-50 border-red-200"
      : p === "Watch"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-green-700 bg-green-50 border-green-200";

  const formatMD = (iso: string | undefined) => {
    if (!iso) return "Recent";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  };

  const singleThreadedDeal = mockDeals.find((d) => d.risk_reasons?.some((r) => r.code === "SINGLE_THREADED"));
  const missingEbDeal = mockDeals.find((d) => d.risk_reasons?.some((r) => r.code === "MISSING_EB"));
  const stageStuckDeal = mockDeals.find((d) => d.risk_reasons?.some((r) => r.code === "STAGE_STUCK"));
  const noNextStepDeal = mockDeals.find((d) => !d.next_step);
  const sarahCall = mockCalls.find((c) => c.rep_name === "Sarah Chen");
  const taylorCall = mockCalls.find((c) => c.rep_name === "Taylor Brooks");

  const signals: Array<{ type: "positive" | "negative"; title: string; evidence: string }> = [
    {
      type: "positive",
      title: "Discovery depth improved on Sarah Chen calls",
      evidence: `${formatMD(sarahCall?.date)} call: asked 3 pain-point questions vs. avg of 0.5`,
    },
    {
      type: "positive",
      title: "Negotiation readiness increased for Alex Rivera",
      evidence: "Validation includes clear success criteria; buyer-confirmed date added",
    },
    {
      type: "positive",
      title: "Next-step hygiene improving for Jordan Kim",
      evidence: "2 calls logged with buyer-confirmed dates this week",
    },
    {
      type: "positive",
      title: "Value articulation landing in recent legal review",
      evidence: `${formatMD(taylorCall?.date)} call: referenced quantified ROI tied to business outcome`,
    },
    singleThreadedDeal
      ? {
          type: "negative",
          title: `${singleThreadedDeal.owner_name} still single-threaded on ${singleThreadedDeal.deal_name}`,
          evidence: "No new stakeholders added in 2 weeks",
        }
      : {
          type: "negative",
          title: "Single-threading persists on key deal",
          evidence: "No new stakeholders added in 2 weeks",
        },
    missingEbDeal
      ? {
          type: "negative",
          title: `${missingEbDeal.owner_name} missing EB on ${missingEbDeal.deal_name}`,
          evidence: "Economic buyer not identified; next step date slipped",
        }
      : {
          type: "negative",
          title: "Missing EB on priority deal",
          evidence: "Economic buyer not identified; next step date slipped",
        },
    stageStuckDeal
      ? {
          type: "negative",
          title: `${stageStuckDeal.owner_name} stage stuck on ${stageStuckDeal.deal_name}`,
          evidence: `${stageStuckDeal.stage_dwell_days} days in ${stageStuckDeal.stage_name} with no stage change`,
        }
      : {
          type: "negative",
          title: "Stage progression stalled",
          evidence: "Multiple weeks with no stage change",
        },
    noNextStepDeal
      ? {
          type: "negative",
          title: `${noNextStepDeal.owner_name} no next step on ${noNextStepDeal.deal_name}`,
          evidence: "No next step captured; buyer not confirmed",
        }
      : {
          type: "negative",
          title: "Missing next step on critical opportunity",
          evidence: "No next step captured; buyer not confirmed",
        },
  ];

  const teamActionsDone = repSummaries.reduce((sum, r) => sum + r.actionsDone, 0);
  const teamActionsTotal = repSummaries.reduce((sum, r) => sum + r.actionsTotal, 0);
  const execScoreAvg = Math.round(repSummaries.reduce((sum, r) => sum + r.percent, 0) / Math.max(1, repSummaries.length));
  const teamProgressPct = Math.round((teamActionsDone / Math.max(1, teamActionsTotal)) * 100);

  const barColor = (pct: number) => (pct < 50 ? "#ef4444" : pct < 100 ? "#f59e0b" : "#22c55e");

  return (
    <div className="h-full bg-white overflow-auto" style={{ scrollbarGutter: 'stable both-edges' }}>
      <div className="sticky top-0 z-20 bg-white">
      <PageHeader
        title=""
        inlineChildren
        leftSlot={
          <PulseFlow
            compact
            completeOnClick
            initialActiveStep="sync"
            pageStepId="sync"
            onNavigateToStep={(step) => {
              if (step === "prepare") navigate("/manager-prep");
              else if (step === "uncover") navigate("/leader-uncover");
              else if (step === "lead") navigate("/leader-lead");
              else if (step === "sync") navigate("/leader-sync");
              else if (step === "evaluate") navigate("/leader-evaluate");
            }}
          />
        }
      >
        <div className="flex items-center gap-3">
          <AskSamPopup
            questions={askSamQuestions}
            onGenerateAnswer={askSamAnswer}
            triggerLabel="Ask Sam"
            buttonClassName="gap-2 bg-white text-[#FF8E1C] border border-[#FF8E1C] hover:bg-[#FF8E1C] hover:text-white"
            mode="sheet"
            sheetSide="right"
            description="Ask about team risks, talking points, or coaching themes"
          />
          <Button
            size="sm"
            className="bg-[#605BFF] text-white hover:bg-[#4F48E3]"
            onClick={() => {
              try {
                sessionStorage.setItem('pulse.started', 'true');
                sessionStorage.setItem('pulse.completed', 'true');
                sessionStorage.setItem('pulse.currentIdx', String(4));
                sessionStorage.setItem('pulse.maxIdx', String(4));
                const cStr = sessionStorage.getItem('pulse.completedSteps');
                const arr = cStr ? JSON.parse(cStr) : [];
                const set = new Set<string>(Array.isArray(arr) ? arr : []);
                set.add('sync');
                const all = new Set<string>([...set, 'prepare', 'uncover', 'lead', 'sync']);
                sessionStorage.setItem('pulse.completedSteps', JSON.stringify(Array.from(all)));
                window.dispatchEvent(new Event('pulse:state'));
              } catch (e) { void e; }
              navigate("/leader-evaluate");
            }}
          >
            Complete Cycle <ChevronRight className="h-4 w-4 ml-1" /> Evaluate
          </Button>
        </div>
      </PageHeader>
      </div>

      <div className="px-6 pb-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-lg bg-card p-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm font-semibold text-foreground">Execution Score</div>
                  <div className="text-2xl font-bold text-foreground">{execScoreAvg}%</div>
                </div>
                <div className="flex-1 px-2">
                  <div className="text-xs text-muted-foreground mb-1">Overall progress</div>
                  <Progress value={teamProgressPct} className="h-2 w-full" indicatorStyle={{ backgroundColor: "#605BFF" }} />
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">{teamActionsDone}</span>/{teamActionsTotal} actions
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {repSummaries.map(({ rep, perf, actionsDone, actionsTotal, percent }) => (
                <div key={rep.user_id} className="rounded-lg bg-white p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={rep.avatar || ""} alt={rep.name} />
                        <AvatarFallback>{rep.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-foreground">{rep.name}</div>
                        <div className="text-[11px] text-muted-foreground">{actionsDone}/{actionsTotal} actions completed</div>
                      </div>
                    </div>
                    <div className="flex-1 px-2">
                      <Progress value={percent} className="h-2" indicatorStyle={{ backgroundColor: barColor(percent) }} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${perfClass(perf)}`}>{perf}</span>
                      <div className="mt-1 text-[11px] text-muted-foreground">{Math.round(percent)}% execution</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-lg bg-card p-4">
              <div className="text-sm font-semibold text-foreground mb-1">Behavioral Signals</div>
              <div className="text-xs text-muted-foreground mb-2">Auto-detected from recent calls</div>
              <div className="space-y-2">
                {signals.map((s, i) => (
                  <div key={i} className="rounded-md border border-border bg-white p-3">
                    <div className="flex items-start gap-2">
                      {s.type === "positive" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-foreground">{s.title}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{s.evidence}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
