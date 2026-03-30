import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { mockDeals, formatCurrency } from "@/data/mock";
import { Textarea } from "@/components/ui/textarea";
import PulseFlow from "@/components/dashboard/PulseFlow";
import { AskSamPopup } from "@/components/CommonComponents/AskSamPopup";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader as SheetHdr, SheetTitle as SheetTtl, SheetFooter as SheetFtr } from "@/components/ui/sheet";

type TrackerRow = {
  rep: string;
  focus: string;
  behaviorChange: string;
  dealOutcomes: string;
  skillRating: string;
  trend: "up" | "down" | "flat";
};

const trackerData: TrackerRow[] = [
  { rep: "Sarah Chen", focus: "Discovery depth", behaviorChange: "More probing qs", dealOutcomes: "+2 advanced", skillRating: "7.8/10", trend: "up" },
  { rep: "Marcus Johnson", focus: "EB access", behaviorChange: "Stakeholder mapping", dealOutcomes: "1 commit at risk", skillRating: "6.5/10", trend: "flat" },
  { rep: "Alex Rivera", focus: "Next step clarity", behaviorChange: "Buyer-confirmed next steps", dealOutcomes: "+1 closed-won", skillRating: "8.6/10", trend: "up" },
  { rep: "Priya Patel", focus: "Value articulation", behaviorChange: "Business impact framing", dealOutcomes: "Pipeline improving", skillRating: "7.2/10", trend: "up" },
];

export default function LeaderEvaluate() {
  const navigate = useNavigate();
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const handleWeeklySubmit = () => {
    setWeeklyOpen(false);
  };
  const coachingCadence = "100%";
  const winRatePrev = 29;
  const winRateCur = 31;
  const winRateImpactValue = `${winRatePrev}% → ${winRateCur}%`;
  const winRateImpactNote = `${winRateCur - winRatePrev} percentage points`;
  const coachedConversion = "43%";
  const revenueInfluenced = formatCurrency(
    mockDeals.filter(d => d.need_coaching).reduce((sum, d) => sum + d.amount, 0)
  );
  const impactForRow = (row: TrackerRow) => row.trend === "up" ? 8 : row.trend === "down" ? -5 : 0;
  const parsedRows = [...trackerData]
    .map(r => ({ ...r, rating: parseFloat((r.skillRating.split("/")[0] || "0")) }))
    .sort((a, b) => b.rating - a.rating);
  const coachCount = Math.max(1, Math.floor(parsedRows.length / 2));
  const coaches = parsedRows.slice(0, coachCount);
  const mentees = parsedRows.slice(coachCount).sort((a, b) => a.rating - b.rating);
  const pairings = mentees.map((m, i) => ({ coach: coaches[i % coaches.length], mentee: m }));
  const topUpReps = trackerData.filter(r => r.trend === "up").map(r => r.rep).slice(0, 2);
  const insights = [
    {
      type: "Pattern",
      title: "Top reps multi-thread early",
      desc: `Reps who engage 3+ stakeholders before Stage 3 close 2.4x more often. ${topUpReps.join(" and ")} consistently do this.`,
      tone: "blue",
    },
    {
      type: "Risk",
      title: "Weak discovery is the #1 deal killer",
      desc: "68% of lost deals had below-average discovery scores. Most common miss: not identifying economic buyer by Stage 2.",
      tone: "red",
    },
    {
      type: "Trend",
      title: "Pricing objection handling improved 34%",
      desc: "After targeted coaching in weeks 2-4, team pricing objection scores went from 4.2 to 5.6 average.",
      tone: "amber",
    },
  ];
  const snippets = [
    {
      title: "1. Multi-threading playbook",
      desc: "How top reps engage 3+ stakeholders before Stage 3",
    },
    {
      title: "2. Discovery question framework",
      desc: "5-question sequence for uncovering economic buyer",
    },
    {
      title: "3. Pricing objection responses",
      desc: "3 tested rebuttals for \"your competitor is cheaper\"",
    },
  ];

  const askSamQuestions = [
    "What team metrics improved this week?",
    "Summarize key coaching outcomes",
    "Where did forecast variance originate?",
    "Which reps need focus next cycle?",
  ];
  const askSamAnswer = (q: string) => {
    const l = q.toLowerCase();
    if (l.includes("improved")) return "Discovery depth and negotiation readiness showed the largest gains vs. last week.";
    if (l.includes("coaching")) return "Focus areas drove +2 advanced stages; prioritize EB access and next-step clarity next cycle.";
    if (l.includes("forecast")) return "Variance concentrated in late-stage slippage; confirm buyer-confirmed dates earlier.";
    if (l.includes("reps")) return "Prioritize Marcus (EB access) and Jordan (next-step hygiene) for next cycle.";
    return "Ask about improvements, coaching outcomes, forecast variance, or next-cycle focus.";
  };

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
              initialActiveStep="evaluate"
              pageStepId="evaluate"
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
            description="Ask about improvements, outcomes, or next-cycle focus"
          />
          <Button
            size="sm"
            variant="outline"
            className="bg-white text-[#605BFF] border border-[#605BFF] hover:bg-[#605BFF] hover:text-white hover:border-white"
            onClick={() => setWeeklyOpen(true)}
          >
            Weekly Reflection
          </Button>
          <Button
            size="sm"
            className="bg-[#605BFF] text-white hover:bg-[#4F48E3]"
            onClick={() => navigate("/manager-prep")}
          >
            Start New Pulse Loop
          </Button>
        </div>
      </PageHeader>
      </div>
      <Sheet open={weeklyOpen} onOpenChange={setWeeklyOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-[90vw] p-0 flex flex-col [&>button]:hidden">
          <SheetHdr className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTtl>Weekly Reflection</SheetTtl>
              <button type="button" className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-gray-100" onClick={() => setWeeklyOpen(false)} aria-label="Close">
                <Share2 className="h-5 w-5 opacity-0" />
              </button>
            </div>
          </SheetHdr>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-foreground">1. Which coaching theme drove measurable deal movement?</div>
                <Textarea placeholder="Write your reflection..." className="mt-1" />
              </div>
              <div>
                <div className="text-sm text-foreground">2. Where did forecast variance originate this week?</div>
                <Textarea placeholder="Write your reflection..." className="mt-1" />
              </div>
              <div>
                <div className="text-sm text-foreground">3. What pattern in discovery depth needs reinforcement?</div>
                <Textarea placeholder="Write your reflection..." className="mt-1" />
              </div>
              <div>
                <div className="text-sm text-foreground">4. Which rep should present a win/learning clip to peers?</div>
                <Textarea placeholder="Write your reflection..." className="mt-1" />
              </div>
              <div>
                <div className="text-sm text-foreground">5. What is the single highest-impact hygiene improvement next week?</div>
                <Textarea placeholder="Write your reflection..." className="mt-1" />
              </div>
            </div>
          </div>
          <SheetFtr className="px-6 py-3 border-t justify-start sm:justify-start gap-2">
            <Button size="sm" className="bg-[#605BFF] text-white hover:bg-[#4F48E3]" onClick={handleWeeklySubmit}>Submit</Button>
            <Button variant="outline" size="sm" onClick={() => setWeeklyOpen(false)}>Close</Button>
          </SheetFtr>
        </SheetContent>
      </Sheet>
      <div className="px-6 pb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Win Rate Impact" value={winRateImpactValue} note={winRateImpactNote} />
          <KPICard label="Coached Deal Conversion" value={coachedConversion} note="vs. uncoached deals" />
          <KPICard label="Revenue Influenced" value={revenueInfluenced} note="This quarter" />
          <KPICard label="Coaching Cadence" value={coachingCadence} trend="up" trendLabel="All reps coached this week" trendPositive={true} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">
          <div className="lg:col-span-7 h-full">
            <div className="rounded-lg border border-border bg-card h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
                <div className="text-sm font-semibold text-foreground">4-Week Coaching Tracker</div>
              </div>
              <div className="rounded overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground bg-secondary/40">
                      <th className="text-left px-4 py-2 font-medium">Rep</th>
                      <th className="text-left px-3 py-2 font-medium">Coaching Focus</th>
                      <th className="text-left px-3 py-2 font-medium">Behavior Change</th>
                      <th className="text-left px-3 py-2 font-medium">Deal Outcomes</th>
                      <th className="text-left px-3 py-2 font-medium">Skill Rating</th>
                      <th className="text-left px-3 py-2 font-medium">Impact</th>
                      <th className="text-left px-3 py-2 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackerData.map((row, i) => (
                      <tr key={i} className="border-t border-border hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">{row.rep}</td>
                        <td className="py-3 px-4">{row.focus}</td>
                        <td className="py-3 px-4">{row.behaviorChange}</td>
                        <td className="py-3 px-4">{row.dealOutcomes}</td>
                        <td className="py-3 px-4">{row.skillRating}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs ${impactForRow(row) > 0 ? "text-status-green" : impactForRow(row) < 0 ? "text-status-red" : "text-muted-foreground"}`}>
                            {impactForRow(row) > 0 ? `+${impactForRow(row)}%` : `${impactForRow(row)}%`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs ${row.trend === "up" ? "text-status-green" : row.trend === "down" ? "text-status-red" : "text-muted-foreground"}`}>
                            {row.trend === "up" ? "Improving" : row.trend === "down" ? "Declining" : "Flat"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 h-full">
            <div className="rounded-lg border border-border bg-card p-4 h-full flex flex-col">
              <div className="text-sm font-semibold text-foreground mb-2">Suggested Pairings</div>
              <div className="text-xs text-muted-foreground mb-3">Leverage strong peers to coach specific skills</div>
              <div className="space-y-2">
                {pairings.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={""} alt={p.coach.rep} />
                        <AvatarFallback>{p.coach.rep.split(" ").map(s => s[0]).join("").slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold">{p.coach.rep}</span>
                      <span className="mx-1 text-muted-foreground">→ Coach</span>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={""} alt={p.mentee.rep} />
                        <AvatarFallback>{p.mentee.rep.split(" ").map(s => s[0]).join("").slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold">{p.mentee.rep}</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">{p.mentee.focus}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-semibold text-foreground mb-2">Team Insights</div>
            <div className="space-y-3">
              {insights.map((i, idx) => {
                const tagClass =
                  i.tone === "blue"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : i.tone === "red"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-amber-200 bg-amber-50 text-amber-700";
                return (
                  <div key={idx} className="relative rounded-md border border-border bg-white p-3">
                    <span className={`absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-full border ${tagClass}`}>{i.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{i.title}</span>
                      <button aria-label="Share insight" className="p-0 h-auto text-[#605BFF]">
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">{i.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-foreground">Coaching Snippets</div>
              <Button variant="ghost" size="sm" className="text-[#605BFF] hover:bg-transparent">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
            <div className="space-y-2">
              {snippets.map((s, idx) => (
                <div key={idx} className="rounded-md border border-border bg-white p-3">
                  <div className="text-xs font-semibold text-foreground">{s.title}</div>
                  <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
