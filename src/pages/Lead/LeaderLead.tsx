import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { mockAEReps, mockDeals, formatCurrency } from "@/data/mock";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PulseFlow from "@/components/dashboard/PulseFlow";
import { AskSamPopup } from "@/components/CommonComponents/AskSamPopup";
import { Badge } from "@/components/ui/badge";

export default function LeaderLead() {
  const navigate = useNavigate();
  const selectedIdsFromUncover = useMemo<string[]>(() => {
    try {
      const raw = localStorage.getItem("uncoverSelectedDealIds");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);
  const selectedDealsFromUncover = useMemo(() => {
    const list = Array.isArray(mockDeals) ? mockDeals : [];
    return list.filter(d => selectedIdsFromUncover.includes(d.deal_id));
  }, [selectedIdsFromUncover]);
  const repOptions = useMemo(() => {
    const names = Array.from(new Set(selectedDealsFromUncover.map(d => d.owner_name).filter(Boolean) as string[]));
    return names.length ? names : mockAEReps.map(r => r.name);
  }, [selectedDealsFromUncover]);
  const [repName, setRepName] = useState<string>(repOptions[0] || mockAEReps[0]?.name || "Alex Rodriguez");
  useEffect(() => {
    if (repOptions.length > 0 && !repOptions.includes(repName)) {
      setRepName(repOptions[0]);
    }
  }, [repOptions, repName]);
  const deals = useMemo(() => {
    return selectedDealsFromUncover.filter(d => d.owner_name === repName);
  }, [selectedDealsFromUncover, repName]);
  const [idx, setIdx] = useState(0);
  const selected = deals[idx];
  useEffect(() => {
    setIdx(0);
  }, [repName, deals.length]);

  const actionsDone = 8;
  const actionsTotal = 10;
  const dealsProgressed = 3;
  const coachingScore = 7.5;
  const confidence = 7.0;
  const coachStart = "Today 2:00 PM";
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [didWell, setDidWell] = useState("");
  const [lossRisk, setLossRisk] = useState<"low" | "medium" | "high">("low");
  const [devSkills, setDevSkills] = useState<string[]>([]);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const skillOptions = [
    "Discovery depth",
    "Executive alignment",
    "Multi-threading",
    "Value articulation",
    "Negotiation",
    "Qualification rigor",
    "Objection handling",
    "MAP creation",
    "Proof points",
    "Time management",
    "Next step clarity",
    "Risk identification",
    "Stakeholder mapping",
    "Listening discipline"
  ];
  const [checkItems, setCheckItems] = useState(
    [
      "Opening",
      "Building Rapport",
      "Listening",
      "Questioning",
      "Discovery Depth",
      "Value Articulation",
      "Objection Handling",
      "Next Step Clarity",
      "Stakeholder Mapping",
      "Executive Alignment",
      "Negotiation Readiness",
      "Proof Points",
      "Risk Identification",
      "Activity Hygiene"
    ].map((label, i) => ({ id: `c${i}`, label, done: false, rating: 0 }))
  );
  const toggleItemDone = (id: string) => {
    setCheckItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const nextDone = !it.done;
      return { ...it, done: nextDone, rating: nextDone ? it.rating : 0 };
    }));
  };
  const setItemRating = (id: string, rating: number) => {
    setCheckItems(prev => prev.map(it => it.id === id ? { ...it, rating, done: true } : it));
  };
  const completedCount = checkItems.filter(i => i.done).length;
  const avgRating = checkItems.length ? (checkItems.reduce((s, i) => s + i.rating, 0) / checkItems.length).toFixed(1) : "0.0";
  const toggleDevSkill = (sk: string) => {
    setDevSkills(prev => prev.includes(sk) ? prev.filter(x => x !== sk) : [...prev, sk]);
  };
  const askSamQuestions = useMemo(() => {
    const name = selected?.deal_name ?? "this deal";
    return [
      `What are the top risks for ${name}?`,
      `What coaching actions would move ${name} forward this week?`,
      `Which stakeholder should we engage next for ${name}?`,
      `Draft a 30-min coaching agenda for ${repName}`,
    ];
  }, [selected, repName]);
  const askSamAnswer = (q: string) => {
    if (!selected) return "No active deal selected. Pick a deal first.";
    const lower = q.toLowerCase();
    if (lower.includes("risk")) {
      return `Key risks for ${selected.deal_name}: decision process clarity and stakeholder coverage. Align next step with explicit date.`;
    }
    if (lower.includes("action") || lower.includes("move")) {
      return `Recommend: confirm next step date, validate value metrics, and add a finance touchpoint for ${selected.deal_name}.`;
    }
    if (lower.includes("stakeholder") || lower.includes("engage")) {
      return `Engage an executive sponsor and finance counterpart to accelerate approval for ${selected.deal_name}.`;
    }
    if (lower.includes("agenda")) {
      return `Agenda: 1) Deal update (10m) 2) Risk deep-dive (10m) 3) Actions and owners (10m).`;
    }
    return "Ask about risks, coaching actions, next stakeholder, or an agenda.";
  };
  useEffect(() => {
    setViewedIds(new Set());
  }, [repName]);
  useEffect(() => {
    if (!selected?.deal_id) return;
    setViewedIds(prev => {
      if (prev.has(selected.deal_id)) return prev;
      const next = new Set(prev);
      next.add(selected.deal_id);
      return next;
    });
  }, [selected?.deal_id]);
  const allViewed = useMemo(
    () => (deals.length > 0) && deals.every(d => viewedIds.has(d.deal_id)),
    [deals, viewedIds]
  );
  const daysToClose = useMemo(() => {
    if (!selected?.close_date) return null;
    const now = new Date();
    const close = new Date(selected.close_date);
    const diff = Math.ceil((close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff < 0 ? 0 : diff;
  }, [selected]);
  const nextStepDays = useMemo(() => {
    if (!selected?.next_step?.date) return null;
    const now = new Date();
    const n = new Date(selected.next_step.date);
    const diff = Math.ceil((n.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff < 0 ? 0 : diff;
  }, [selected]);
  const suggestedSkill = useMemo(() => {
    const codes = (selected?.risk_reasons || []).map(r => r.code);
    if (codes.includes('WEAK_VALUE')) return 'Discovery depth';
    if (codes.includes('MISSING_EB')) return 'Executive alignment';
    if (codes.includes('SINGLE_THREADED')) return 'Multi-threading';
    if (codes.includes('NO_NEXT_STEP_DATE')) return 'Next step clarity';
    if (codes.includes('STAGE_STUCK')) return 'Next step clarity';
    return 'Objection handling';
  }, [selected]);

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
            initialActiveStep="lead"
            pageStepId="lead"
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
            <Select value={repName} onValueChange={setRepName}>
              <SelectTrigger className="w-56 h-8 text-xs bg-white">
                <SelectValue placeholder="Select Rep" />
              </SelectTrigger>
              <SelectContent>
                {repOptions.map(name => (
                  <SelectItem key={name} value={name} className="text-xs hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-foreground">
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AskSamPopup
              questions={askSamQuestions}
              onGenerateAnswer={askSamAnswer}
              triggerLabel="Ask Sam"
              buttonClassName="gap-2 bg-white text-[#FF8E1C] border border-[#FF8E1C] hover:bg-[#FF8E1C] hover:text-white"
              mode="sheet"
              sheetSide="right"
              description="Ask about deal risks, next actions, or a quick coaching agenda"
            />
            {idx === deals.length - 1 && (
              <Button
                size="sm"
                variant="outline"
                className="bg-white text-[#605BFF] border border-[#605BFF] hover:bg-[#605BFF] hover:text-white hover:border-white"
                onClick={() => setFeedbackOpen(true)}
              >
                360° feedback
              </Button>
            )}
            <Button
              size="sm"
              className={`bg-[#605BFF] text-white hover:bg-[#4F48E3] ${allViewed ? "" : "opacity-50 cursor-not-allowed"}`}
              disabled={!allViewed}
              onClick={() => {
                if (!allViewed) return;
                try {
                  sessionStorage.setItem('pulse.started', 'true');
                  sessionStorage.setItem('pulse.completed', 'false');
                  sessionStorage.setItem('pulse.currentIdx', String(3));
                  const maxStr = sessionStorage.getItem('pulse.maxIdx');
                  const prevMax = maxStr ? parseInt(maxStr, 10) : -1;
                  const newMax = Math.max(prevMax, 3);
                  sessionStorage.setItem('pulse.maxIdx', String(Number.isNaN(newMax) ? 3 : newMax));
                  const cStr = sessionStorage.getItem('pulse.completedSteps');
                  const arr = cStr ? JSON.parse(cStr) : [];
                  const set = new Set<string>(Array.isArray(arr) ? arr : []);
                  set.add('lead');
                  const stepIds = ['prepare','uncover','lead','sync','evaluate'];
                  if (prevMax >= 0) stepIds.slice(0, Math.min(prevMax + 1, stepIds.length)).forEach(id => set.add(id));
                  sessionStorage.setItem('pulse.completedSteps', JSON.stringify(Array.from(set)));
                  window.dispatchEvent(new Event('pulse:state'));
                } catch (e) { void e; }
                navigate("/leader-sync");
              }}
            >
              Begin Tracking <ChevronRight className="h-4 w-4 ml-1" /> Sync
            </Button>
        </div>
      </PageHeader>
      </div>
      <div className="px-6 pb-6 space-y-4">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
            <div>
              <div className="text-sm font-semibold text-foreground">1:1 — {repName}</div>
              <div className="text-xs text-muted-foreground">Coaching session starts {coachStart}</div>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">Edit Agenda</Button>
              {idx > 0 && (
                <Button size="sm" variant="secondary" onClick={() => setIdx(i => Math.max(0, i - 1))}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous Deal
                </Button>
              )}
              {idx < deals.length - 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white text-[#605BFF] border border-[#605BFF] hover:bg-[#605BFF] hover:text-white hover:border-white"
                  onClick={() => setIdx(i => Math.min(deals.length - 1, i + 1))}
                >
                  Next Deal
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
              <div className="lg:col-span-6 space-y-4">
                <div className="rounded-lg border border-border bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-foreground">
                      {selected ? `${selected.account_name} (${formatCurrency(selected.amount)})` : "—"}
                    </div>
                    {selected && (
                      <Badge
                        variant="outline"
                        className={
                          selected.risk_level === "RED"
                            ? "border-red-300 text-red-700 bg-red-50"
                            : selected.risk_level === "AMBER"
                            ? "border-amber-300 text-amber-700 bg-amber-50"
                            : "border-green-300 text-green-700 bg-green-50"
                        }
                      >
                        {selected.risk_level === "RED" ? "high" : selected.risk_level === "AMBER" ? "medium" : "low"}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {deals.length > 0 ? `${idx + 1} of ${deals.length}` : "0 of 0"}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="rounded-md bg-muted/30 p-2">
                    <div className="text-[11px] text-muted-foreground">Actions last week</div>
                    <div className="text-sm font-medium text-foreground">{actionsDone}/{actionsTotal}</div>
                  </div>
                  <div className="rounded-md bg-muted/30 p-2">
                    <div className="text-[11px] text-muted-foreground">Call coaching score</div>
                    <div className="text-sm font-medium text-foreground">{coachingScore.toFixed(1)} / 10</div>
                  </div>
                  <div className="rounded-md bg-muted/30 p-2">
                    <div className="text-[11px] text-muted-foreground">Confidence</div>
                    <div className="text-sm font-medium text-foreground">{confidence.toFixed(1)} / 10</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Decision Maker</div>
                    <div className="text-sm text-foreground">CFO — TBD</div>
                    <div className="text-xs text-muted-foreground">Champion</div>
                    <div className="text-sm text-foreground">Ops Director — engaged</div>
                    <div className="text-xs text-muted-foreground">Pain</div>
                    <div className="text-sm text-foreground">Manual reporting delays impacting quarter close</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Compelling Event</div>
                    <div className="text-sm text-foreground">{selected?.next_step?.date || "Quarter end"}</div>
                    <div className="text-xs text-muted-foreground">Competition</div>
                    <div className="text-sm text-foreground">Incumbent + new entrant</div>
                    <div className="text-xs text-muted-foreground">Next Step</div>
                    <div className="text-sm text-foreground">
                      {selected?.next_step ? `${selected.next_step.description}` : "Align success criteria"}
                    </div>
                  </div>
                </div>
                </div>
                <div className="rounded-lg border border-border bg-white p-4">
                  <div className="text-sm font-semibold text-foreground mb-2">Suggested Coaching Questions</div>
                  <div className="space-y-3">
                    {[
                      "What outcome would make this a must-do this quarter for the EB",
                      "Which stakeholder has the strongest influence and how can we engage",
                      "What risk is most likely to delay close and how do we mitigate it",
                      "What proof point will accelerate confidence for the decision maker",
                    ].map((q, i) => (
                      <label key={i} className="flex items-start gap-2 text-sm">
                        <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300" />
                        <span className="text-foreground">{q}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 p-4">
                <div className="text-sm font-semibold text-foreground mb-2">AI Nudges</div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-md border border-border p-3 bg-gray-50">
                    <div className="text-xs font-semibold text-foreground mb-1">
                      Prioritize {selected?.account_name ?? "this account"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selected?.risk_reasons?.some(r => r.code === 'MISSING_EB')
                        ? `Economic buyer still unidentified with ${daysToClose ?? "--"} days to close. Highest revenue impact if lost.`
                        : `High-impact opportunity with ${daysToClose ?? "--"} days to close. Ensure EB mapped and engaged.`}
                    </div>
                  </div>
                  <div className="rounded-md border border-border p-3 bg-gray-50">
                    <div className="text-xs font-semibold text-foreground mb-1">
                      {repName} needs {suggestedSkill} coaching
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last 3 calls show pattern of skipping pain-point exploration. Suggest role-play exercise.
                    </div>
                  </div>
                  <div className="rounded-md border border-border p-3 bg-gray-50">
                    <div className="text-xs font-semibold text-foreground mb-1">
                      {selected?.deal_name ?? "This deal"} decision timeline
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {`Board meeting in ${nextStepDays ?? 10} days. If budget not confirmed by Friday, deal likely pushes to Q3.`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-w-4xl w-[90vw] p-0">
          <div className="h-[80vh] flex flex-col">
            <div className="flex-none border-b px-4 py-3">
              <div className="text-sm font-semibold text-foreground">360° Feedback — {repName}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-sm font-semibold text-foreground">Overview</div>
                <div className="text-xs text-muted-foreground mt-1">Completed {completedCount}/{checkItems.length} · Avg rating {avgRating}/5</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-sm font-semibold text-foreground mb-3">Coaching Session Checklist</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {checkItems.map(item => (
                    <div key={item.id} className="rounded-lg border border-border bg-white p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => toggleItemDone(item.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} className="p-0.5" onClick={() => setItemRating(item.id, n)} aria-label={`${item.label} rating ${n}`}>
                            <Star className={`h-4 w-4 ${item.rating >= n ? "text-yellow-500" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-sm font-semibold text-foreground mb-2">What did {repName} do well?</div>
                <textarea
                  value={didWell}
                  onChange={e => setDidWell(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                  placeholder="Write specific observations and impact..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-card p-4 md:col-span-2">
                  <div className="text-sm font-semibold text-foreground mb-2">Future development — What skills should {repName} be developing and practicing?</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {skillOptions.map(sk => (
                      <label key={sk} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={devSkills.includes(sk)}
                          onChange={() => toggleDevSkill(sk)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-foreground">{sk}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 md:col-span-1">
                  <div className="text-sm font-semibold text-foreground">Potential loss of the employee - What is the employee's work risk of loss?</div>
                  <div className="text-[11px] text-muted-foreground mb-2">Visible to Admins only</div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="lossRisk" checked={lossRisk === "low"} onChange={() => setLossRisk("low")} />
                      <span>low</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="lossRisk" checked={lossRisk === "medium"} onChange={() => setLossRisk("medium")} />
                      <span>medium</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="lossRisk" checked={lossRisk === "high"} onChange={() => setLossRisk("high")} />
                      <span>high</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-none border-t px-4 py-3">
              <div className="flex justify-end">
                <Button size="sm" variant="secondary" onClick={() => setFeedbackOpen(false)}>Close</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
