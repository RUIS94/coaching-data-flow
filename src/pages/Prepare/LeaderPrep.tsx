import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { mockAEReps, mockDeals, formatCurrency, type Deal } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { MoreVertical, Mic, MicOff, Wand2, Send, ChevronRight, Filter, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useMemo, useCallback } from "react";
import { useToastContext } from "@/contexts/ToastContext";
import SalesMethodologyCard from "@/components/Modules/SalesMethodologyCard";
import BuyerJourneyCard from "@/components/Modules/BuyerJourneyCard";
import BuyerObjectionsCard from "@/components/Modules/BuyerObjectionsCard";
import BuyerQuestionsCard from "@/components/Modules/BuyerQuestionsCard";
import PulseFlow from "@/components/dashboard/PulseFlow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AskSamPopup } from "@/components/CommonComponents/AskSamPopup";
import { Checkbox } from "@/components/ui/checkbox";

export default function ManagerPrep() {
  const reps = mockAEReps.slice(0, 6);
  const [selectedDealIds, setSelectedDealIds] = useState<Set<string>>(new Set());
  const [onlyInLoop, setOnlyInLoop] = useState(true);
  const [riskNonGreen, setRiskNonGreen] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const toggleSelection = (dealId: string | null | undefined) => {
    if (!dealId) return;
    setSelectedDealIds(prev => {
      const next = new Set(prev);
      if (next.has(dealId)) next.delete(dealId);
      else next.add(dealId);
      return next;
    });
  };
  const applyFilters = useCallback((d: Deal) => {
    if (onlyInLoop && !d.isInLoop) return false;
    if (riskNonGreen && d.risk_level === "GREEN") return false;
    if (stageFilter !== "all" && d.stage_name !== stageFilter) return false;
    return true;
  }, [onlyInLoop, riskNonGreen, stageFilter]);
  const selectedDeals = useMemo(() => mockDeals.filter(d => selectedDealIds.has(d.deal_id)), [selectedDealIds]);
  const selectedTotal = useMemo(() => selectedDeals.reduce((s, d) => s + d.amount, 0), [selectedDeals]);
  const repsInvolved = useMemo(() => {
    const m = new Map<string, number>();
    selectedDeals.forEach(d => m.set(d.owner_name, (m.get(d.owner_name) || 0) + 1));
    return Array.from(m.entries()).map(([name, count]) => ({ name, count }));
  }, [selectedDeals]);
  const visiblePrimaryDealIds = useMemo(() => {
    const ids: string[] = [];
    reps.forEach(rep => {
      const deals = mockDeals.filter(d => d.owner_name === rep.name).filter(applyFilters);
      let primary = deals[0] as Deal | undefined;
      if (!primary) {
        const all = mockDeals.filter(d => d.owner_name === rep.name);
        if (all.length > 0) {
          primary = all.reduce((a, b) => (a.amount > b.amount ? a : b));
        }
      }
      if (primary) ids.push(primary.deal_id);
    });
    return ids;
  }, [applyFilters, reps]);
  const selectAllVisible = () => {
    setSelectedDealIds(new Set(visiblePrimaryDealIds));
  };
  const allVisibleSelected = useMemo(
    () => visiblePrimaryDealIds.length > 0 && visiblePrimaryDealIds.every(id => selectedDealIds.has(id)),
    [visiblePrimaryDealIds, selectedDealIds]
  );
  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedDealIds(new Set());
    } else {
      selectAllVisible();
    }
  };
  const clearAll = () => {
    setSelectedDealIds(new Set());
    setOnlyInLoop(true);
    setRiskNonGreen(false);
    setStageFilter("all");
  };
  const initials = (name: string) => {
    const p = name.split(" ").filter(Boolean);
    if (p.length === 0) return "";
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };
  const getTopDealFor = (repName: string) => {
    const deals = mockDeals.filter(d => d.owner_name === repName);
    if (deals.length === 0) return null;
    return deals.reduce((a, b) => (a.amount > b.amount ? a : b));
  };
  const confidenceFor = (score: number) => `${Math.round(score / 10)}/10`;
  const riskLabelFor = (repName: string) => {
    const deals = mockDeals.filter(d => d.owner_name === repName);
    const risky = deals.find(d => d.risk_reasons && d.risk_reasons.length > 0);
    if (!risky || risky.risk_reasons.length === 0) return "—";
    return risky.risk_reasons[0].label;
  };
  const prettyForecast = (fc?: string | null) =>
    fc === "BEST_CASE" ? "Best Case" : fc === "COMMIT" ? "Commit" : fc === "PIPELINE" ? "Pipeline" : fc === "OMIT" ? "Omit" : fc ?? "—";
  const forecastTagClass = (fc?: string | null) =>
    fc === "COMMIT" ? "bg-status-green/10 text-status-green" :
    fc === "BEST_CASE" ? "bg-[#605BFF]/10 text-[#605BFF]" :
    fc === "PIPELINE" ? "bg-secondary/50 text-muted-foreground" :
    "bg-muted/50 text-muted-foreground";
  const prettyRiskCode = (code?: string | null) => {
    if (!code) return "—";
    const s = String(code).toLowerCase().replace(/_/g, " ");
    return s.replace(/\b\w/g, ch => ch.toUpperCase());
  };
  const formatCloseDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
    return `${month} ${d.getDate()}, ${d.getFullYear()}`;
  };
  const helpNeededTagsFor = (repName: string) => {
    const deals = mockDeals.filter(d => d.owner_name === repName);
    const tags = deals.flatMap(d => Array.isArray(d.help_needed) ? d.help_needed : []);
    const uniq = Array.from(new Set(tags));
    return uniq;
  };
  const shortName = (full: string) => {
    const parts = full.split(" ");
    if (parts.length === 1) return full;
    const last = parts[parts.length - 1];
    return `${parts.slice(0, -1).join(" ")} ${last.charAt(0)}.`;
  };
  const timeWindowDeals = useMemo(() => mockDeals.filter(d => d.staleness_days <= 7), []);
  const repDeals = useMemo(() => timeWindowDeals.filter(d => reps.map(r => r.name).includes(d.owner_name)), [timeWindowDeals, reps]);
  const eligibleDeals = useMemo(() => repDeals.filter(d => !!d.isInLoop), [repDeals]);
  const coachingEligibleLen = eligibleDeals.length;
  const assessmentsSubmittedCur = useMemo(() => eligibleDeals.filter(d => d.self_assessment_status === "SUBMITTED").length, [eligibleDeals]);
  const eligibleRepNames = useMemo(() => Array.from(new Set(eligibleDeals.map(d => d.owner_name))), [eligibleDeals]);
  const submittedRepNames = useMemo(() => Array.from(new Set(eligibleDeals.filter(d => d.self_assessment_status === "SUBMITTED").map(d => d.owner_name))), [eligibleDeals]);
  const pendingRepNames = useMemo(() => Array.from(new Set(eligibleDeals.filter(d => d.self_assessment_status === "PENDING" || d.self_assessment_status === "TODO").map(d => d.owner_name))), [eligibleDeals]);
  const repEligible = (name: string) => eligibleRepNames.includes(name);
  const repHasPending = (name: string) => eligibleDeals.some(d => d.owner_name === name && (d.self_assessment_status === "PENDING" || d.self_assessment_status === "TODO"));
  const repFullySubmitted = (name: string) => {
    const ds = eligibleDeals.filter(d => d.owner_name === name);
    return ds.length > 0 && ds.every(d => d.self_assessment_status === "SUBMITTED");
  };
  const riskCriticalDeals = useMemo(() => repDeals.filter(d => d.risk_level === "RED"), [repDeals]);
  const riskWarningDeals = useMemo(() => repDeals.filter(d => d.risk_level === "AMBER"), [repDeals]);
  const riskInfoDeals = useMemo(() => repDeals.filter(d => d.risk_level === "GREEN" && d.staleness_days >= 7), [repDeals]);
  const avgConfidence = useMemo(() => {
    const scores = reps.map(r => r.hygiene_score / 10);
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, [reps]);
  const navigate = useNavigate();
  const { showSuccess } = useToastContext();
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const [nudgeRepName, setNudgeRepName] = useState<string | null>(null);
  const [nudgeNotes, setNudgeNotes] = useState("");
  const [nudgeQuestions, setNudgeQuestions] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [modulesRep, setModulesRep] = useState<string | null>(null);
  const onModuleDataClick = (title: string, content: string, value: number) => {
    showSuccess(`${title}: ${content} (${value})`);
  };
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunksRef.current = [];
    rec.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      const text = await transcribeAudio(blob);
      const { points, questions } = extractFromText(text);
      setNudgeNotes(points.join("\n"));
      setNudgeQuestions(questions);
      setSelectedQuestions(questions.slice(0, 3));
    };
    recorderRef.current = rec;
    rec.start();
    setIsRecording(true);
  };
  const stopRecording = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
  };
  const transcribeAudio = async (blob: Blob) => {
    await new Promise(res => setTimeout(res, 800));
    return "Key points: need EB support; next step not buyer-confirmed; request help for multi-threading.";
  };
  const extractFromText = (text: string) => {
    const parts = text.replace(/^Key points:\s*/i, "").split(";").map(s => s.trim()).filter(Boolean);
    const points = parts.length ? parts : ["Need EB support", "Next step not buyer-confirmed", "Help with multi-threading stakeholders"];
    const questions = [
      "What is your mitigation plan around the top risk?",
      "Is the next step buyer-confirmed? How will you ensure it?",
      "Which stakeholders should we multi-thread with next?",
      "What is the biggest loss risk you see now?",
      "What support or resources do you need from me?"
    ];
    return { points, questions };
  };
  const openNudge = (repName: string) => {
    setNudgeRepName(repName);
    setNudgeOpen(true);
    const risk = riskLabelFor(repName);
    const help = helpNeededTagsFor(repName);
    const suggestions = [
      `What is your mitigation plan around "${risk}"?`,
      "Please confirm buyer next step and target date",
      "Do you need my help to reach the EB or other stakeholders?",
      ...help.slice(0, 2).map(h => `Regarding "${h}", what is blocking you now?`)
    ];
    setNudgeQuestions(suggestions);
    setSelectedQuestions(suggestions.slice(0, 3));
  };
  const sendNudge = () => {
    if (nudgeRepName) showSuccess(`Reminder sent to ${nudgeRepName}`);
    setNudgeOpen(false);
    setNudgeNotes("");
    setNudgeQuestions([]);
    setSelectedQuestions([]);
    setAudioBlob(null);
    setIsRecording(false);
  };

  const askSamQuestions = [
    "Which reps still have pending self-assessments?",
    "Who has top-risk coaching deals this week?",
    "Which deal should we coach next?",
    "Show coaching-ready deals by rep",
    "Summarize hygiene gaps by rep"
  ];
  const askSamAnswer = (q: string) => {
    if (/pending/i.test(q) || /self[- ]?assess/i.test(q)) {
      return `Pending self-assessments: ${pendingRepNames.join(", ") || "none"}. Submitted: ${submittedRepNames.length}/${eligibleRepNames.length}.`;
    }
    if (/top[- ]?risk/i.test(q) || /risk/i.test(q)) {
      const repsWithRisk = Array.from(new Set([...riskCriticalDeals, ...riskWarningDeals].map(d => d.owner_name)));
      return `Reps with top-risk deals: ${repsWithRisk.join(", ") || "none"}. Critical: ${riskCriticalDeals.length}, Warning: ${riskWarningDeals.length}.`;
    }
    if (/coach next/i.test(q) || /which deal/i.test(q)) {
      const firstRep = reps.find(r => repEligible(r.name));
      const deal = firstRep ? mockDeals.find(d => d.owner_name === firstRep.name && d.need_coaching) : null;
      return deal ? `Recommend coaching: ${deal.account_name} — ${deal.deal_name} (${formatCurrency(deal.amount)}), close ${formatCloseDate(deal.close_date)}.` : "No coaching-ready deals found.";
    }
    if (/hygiene/i.test(q) || /gaps/i.test(q)) {
      const list = reps.map(r => `${r.name}: ${confidenceFor(r.hygiene_score)}`).join("\n");
      return `Hygiene confidence by rep:\n${list}`;
    }
    return "Ask about pending self-assessments, top-risk coaching deals, or which deal to coach next.";
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
              initialActiveStep="prepare"
              pageStepId="prepare"
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
          <div className="flex items-center w-full justify-end gap-3">
            <Select>
              <SelectTrigger className="w-56 h-8 text-xs bg-white">
                <SelectValue placeholder="All Reps" />
              </SelectTrigger>
              <SelectContent>
                {reps.map(r => (
                  <SelectItem
                    key={r.user_id}
                    value={r.name}
                    className="text-xs hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-foreground"
                  >
                    {r.name}
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
              description="Ask about self-assessment status, coaching priorities, or hygiene gaps"
            />
          </div>
        </PageHeader>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {/*
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard
            label="Top Deals — Self-Assessment Completed"
            value={`${assessmentsSubmittedCur}/${coachingEligibleLen}`}
            note={`Nudge sent to ${pendingRepNames.slice(0, 3).map(n => shortName(n)).join(", ")}${pendingRepNames.length > 3 ? ` +${pendingRepNames.length - 3}` : ""}`}
          />
          <KPICard
            label="Top Risk — Self-Assessment Completed"
            value={`${riskCriticalDeals.length + riskWarningDeals.length + riskInfoDeals.length} deals`}
            note={`${riskCriticalDeals.length} critical · ${riskWarningDeals.length} warning · ${riskInfoDeals.length} info`}
          />
          <KPICard
            label="Strategic Deals — Self-Assessment Completed"
            value={`${avgConfidence.toFixed(1)} / 10`}
            trend="flat"
            trendLabel="—"
            trendPositive={true}
          />
        </div>
        */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card lg:col-span-2 h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
              <div className="text-sm font-semibold text-foreground">Select Deals to Focus On</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-7 px-1 text-xs" onClick={toggleSelectAllVisible}>
                  {allVisibleSelected ? "Unselect all" : "Select all"}
                </Button>
                <span className="inline-flex items-center h-7 w-7 justify-center rounded-md hover:bg-[#FF8E1C]/10 transition-colors cursor-default">
                  <Filter className="h-4 w-4" style={{ color: "#FF8E1C" }} />
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearAll} title="Clear filters & selection">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedDeals.length === 0) return;
                    showSuccess(`Selected ${selectedDeals.length} deals (${formatCurrency(selectedTotal)}).`);
                    navigate("/leader-uncover");
                  }}
                  className="text-xs"
                >
                  Confirm Selection
                  <ChevronRight className="h-4 w-4 ml-1" />
                  Uncover
                </Button>
              </div>
            </div>
            <div className="p-3 space-y-2 max-h-[75vh] overflow-y-auto">
              {reps.map((rep) => {
              const top = getTopDealFor(rep.name);
              const helpTags = helpNeededTagsFor(rep.name);
              const eligible = repEligible(rep.name);
              const hasPending = repHasPending(rep.name);
              const fullySubmitted = repFullySubmitted(rep.name);
                  const coachingDealsAll = mockDeals.filter(d => d.owner_name === rep.name).filter(applyFilters);
              const primaryDeal = coachingDealsAll[0] || top || null;
              const statusCls =
                eligible
                  ? hasPending
                    ? "bg-secondary/50 text-muted-foreground"
                    : fullySubmitted
                    ? "bg-status-green/10 text-status-green"
                    : "bg-secondary/50 text-muted-foreground"
                  : "bg-muted/50 text-muted-foreground";
              const statusText =
                eligible
                  ? hasPending
                    ? "Pending"
                    : fullySubmitted
                    ? "Submitted"
                    : "Pending"
                  : "—";
              const riskText =
                primaryDeal && Array.isArray(primaryDeal.risk_reasons) && primaryDeal.risk_reasons.length > 0
                  ? prettyRiskCode(primaryDeal.risk_reasons[0].code)
                  : "—";
                const checked = primaryDeal ? selectedDealIds.has(primaryDeal.deal_id) : false;
                return (
                  <div
                    key={rep.user_id}
                    className="border border-border rounded-lg bg-card p-2 hover:bg-gray-50 cursor-pointer"
                    role="button"
                    onClick={() => toggleSelection(primaryDeal?.deal_id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div onClick={e => e.stopPropagation()}>
                          <Checkbox checked={checked} onCheckedChange={() => toggleSelection(primaryDeal?.deal_id)} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-foreground truncate">
                            {primaryDeal ? `${primaryDeal.account_name} - ${primaryDeal.deal_name}` : "—"}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-gray-100"
                            onClick={e => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setModulesRep(primaryDeal ? `${primaryDeal.account_name} - ${primaryDeal.deal_name}` : rep.name);
                              setModulesOpen(true);
                            }}
                          >
                            Review
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openNudge(rep.name)}>{hasPending ? "Nudge remaining" : "Update Request"}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-1 space-y-1 text-xs">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="inline-flex items-center gap-1">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="text-foreground">{primaryDeal ? formatCurrency(primaryDeal.amount) : "—"}</span>
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <span className="text-muted-foreground">Rep</span>
                          <span className="text-foreground">{rep.name}</span>
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <span className="text-muted-foreground">Stage</span>
                          <span className="text-foreground">{primaryDeal ? primaryDeal.stage_name : "—"}</span>
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <span className="text-muted-foreground">Close Date</span>
                          <span className="text-foreground">{primaryDeal ? formatCloseDate(primaryDeal.close_date) : "—"}</span>
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <span className="text-muted-foreground">Risk</span>
                          <span className="text-foreground">{riskText}</span>
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <span className="text-muted-foreground">Forecast</span>
                          <span className="text-foreground">
                            {primaryDeal ? (
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${forecastTagClass(primaryDeal.forecast_category)}`}>
                                {prettyForecast(primaryDeal.forecast_category)}
                              </span>
                            ) : (
                              "—"
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="inline-flex items-center gap-1">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="text-foreground">{confidenceFor(rep.hygiene_score)}</span>
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <span className="text-muted-foreground">Status</span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${statusCls}`}>{statusText}</span>
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <span className="text-muted-foreground">Help</span>
                        {helpTags.length > 0
                          ? helpTags.map((t) => (
                              <span key={t} className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#605BFF]/10 text-[#605BFF]">
                                {t}
                              </span>
                            ))
                          : <span className="text-muted-foreground">—</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-4 h-full">
            <div className="rounded-lg border border-border bg-card flex flex-col flex-1 overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-gray-50 text-sm font-semibold text-foreground">Why These Deals?</div>
              <div className="p-4 text-sm text-foreground flex-1 overflow-y-auto">
                {selectedDeals.length > 0 ? (
                  <span>These {selectedDeals.length} deals represent {formatCurrency(selectedTotal)} in pipeline and have the highest coaching leverage — small interventions here yield outsized results based on historical patterns.</span>
                ) : (
                  <span>Select deals to see why they are prioritized for coaching.</span>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card flex flex-col flex-1 overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-gray-50 text-sm font-semibold text-foreground">Reps Involved</div>
              <div className="p-4 flex-1 overflow-y-auto">
                {repsInvolved.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {repsInvolved.map(({ name, count }) => (
                      <div key={name} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border">
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs text-foreground">{initials(name)}</div>
                        <div className="text-sm text-foreground">{name}</div>
                        <div className="text-[11px] px-1.5 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">{count}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No reps selected yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Dialog open={nudgeOpen} onOpenChange={setNudgeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{nudgeRepName ? `Send Update Request — ${nudgeRepName}` : "Send Update Request"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setNudgeQuestions(prev => prev.length ? prev : nudgeQuestions)}>
                  <Wand2 className="h-4 w-4 mr-1" />
                  Generate Questions (AI)
                </Button>
                <Button variant="outline" size="sm" onClick={() => (isRecording ? stopRecording() : startRecording())}>
                  {isRecording ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                  {isRecording ? "Stop Recording" : "Voice Note"}
                </Button>
                {audioBlob && <span className="text-xs text-muted-foreground">Recorded</span>}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Notes</div>
                <Textarea value={nudgeNotes} onChange={e => setNudgeNotes(e.target.value)} placeholder="Add notes or key points" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Questions</div>
                <div className="flex flex-wrap gap-2">
                  {nudgeQuestions.map(q => (
                    <button
                      key={q}
                      onClick={() =>
                        setSelectedQuestions(prev =>
                          prev.includes(q) ? prev.filter(i => i !== q) : [...prev, q]
                        )
                      }
                      className={`text-xs px-2 py-1 rounded border ${selectedQuestions.includes(q) ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={sendNudge} className="text-xs">
                <Send className="h-3.5 w-3.5 mr-1" />
                Send Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={modulesOpen} onOpenChange={setModulesOpen}>
          <DialogContent className="max-w-5xl w-[92vw]">
            <DialogHeader>
              <DialogTitle>{modulesRep ? `Coaching Modules — ${modulesRep}` : "Coaching Modules"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SalesMethodologyCard onDataClick={onModuleDataClick} />
              <BuyerJourneyCard onDataClick={onModuleDataClick} />
              <BuyerObjectionsCard onDataClick={onModuleDataClick} />
              <BuyerQuestionsCard onDataClick={onModuleDataClick} />
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-xs hover:bg-muted hover:text-muted-foreground" onClick={() => setModulesOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
