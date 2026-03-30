import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { mockAEReps, mockDeals, formatCurrency, type Deal, type RiskReason } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Wand2, Send, ChevronRight, Filter, X, Eraser, ArrowUpDown } from "lucide-react";
 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useToastContext } from "@/contexts/ToastContext";
import SalesMethodologyCard from "@/components/Modules/SalesMethodologyCard";
import BuyerJourneyCard from "@/components/Modules/BuyerJourneyCard";
import BuyerObjectionsCard from "@/components/Modules/BuyerObjectionsCard";
import BuyerQuestionsCard from "@/components/Modules/BuyerQuestionsCard";
import PulseFlow from "@/components/dashboard/PulseFlow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AskSamPopup } from "@/components/CommonComponents/AskSamPopup";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader as SheetHdr, SheetTitle as SheetTtl, SheetFooter as SheetFtr } from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ManagerPrep() {
  const reps = mockAEReps;
  const [selectedDealIds, setSelectedDealIds] = useState<Set<string>>(new Set());
  const [onlyInLoop, setOnlyInLoop] = useState(true);
  const [riskNonGreen, setRiskNonGreen] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [repFilter, setRepFilter] = useState<string>("all");
  const [riskLevelFilter, setRiskLevelFilter] = useState<'all'|'RED'|'AMBER'|'GREEN'>('all');
  const [forecastFilter, setForecastFilter] = useState<'all'|'COMMIT'|'BEST_CASE'|'PIPELINE'|'OMIT'>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'risk'|'amount'|'close_date'>('risk');
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
    if (repFilter !== "all" && d.owner_name !== repFilter) return false;
    if (stageFilter !== "all" && d.stage_name !== stageFilter) return false;
    if (riskLevelFilter !== 'all' && d.risk_level !== riskLevelFilter) return false;
    if (forecastFilter !== 'all' && d.forecast_category !== forecastFilter) return false;
    return true;
  }, [onlyInLoop, riskNonGreen, repFilter, stageFilter, riskLevelFilter, forecastFilter]);
  const selectedDeals = useMemo(() => mockDeals.filter(d => selectedDealIds.has(d.deal_id)), [selectedDealIds]);
  const selectedTotal = useMemo(() => selectedDeals.reduce((s, d) => s + d.amount, 0), [selectedDeals]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("uncoverSelectedDealIds");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSelectedDealIds(new Set(parsed));
      }
    } catch { void 0; }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("uncoverSelectedDealIds", JSON.stringify(Array.from(selectedDealIds)));
    } catch { void 0; }
  }, [selectedDealIds]);
  const repsInvolved = useMemo(() => {
    const m = new Map<string, number>();
    selectedDeals.forEach(d => m.set(d.owner_name, (m.get(d.owner_name) || 0) + 1));
    return Array.from(m.entries()).map(([name, count]) => ({ name, count }));
  }, [selectedDeals]);
  const visibleDealIds = useMemo(() => {
    const sorted = mockDeals.filter(applyFilters).slice();
    sorted.sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'close_date') {
        const at = a.close_date ? new Date(a.close_date).getTime() : Number.MAX_SAFE_INTEGER;
        const bt = b.close_date ? new Date(b.close_date).getTime() : Number.MAX_SAFE_INTEGER;
        return at - bt;
      }
      const rank = (lvl?: string | null) => lvl === 'RED' ? 2 : lvl === 'AMBER' ? 1 : lvl === 'GREEN' ? 0 : -1;
      const r = rank(b.risk_level) - rank(a.risk_level);
      if (r !== 0) return r;
      return b.amount - a.amount;
    });
    return sorted.map(d => d.deal_id);
  }, [applyFilters, sortBy]);
  const selectAllVisible = () => {
    setSelectedDealIds(new Set(visibleDealIds));
  };
  const allVisibleSelected = useMemo(
    () => visibleDealIds.length > 0 && visibleDealIds.every(id => selectedDealIds.has(id)),
    [visibleDealIds, selectedDealIds]
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
    try { localStorage.setItem("uncoverSelectedDealIds", JSON.stringify([])); } catch { void 0; }
    setOnlyInLoop(true);
    setRiskNonGreen(false);
    setStageFilter("all");
    setRepFilter("all");
    setRiskLevelFilter("all");
    setForecastFilter("all");
    setSortBy("risk");
    setFilterOpen(false);
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
  const [dealSheetOpen, setDealSheetOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealAnalyticsOpen, setDealAnalyticsOpen] = useState(false);
  const onModuleDataClick = (title: string, content: string, value: number) => {
    showSuccess(`${title}: ${content} (${value})`);
  };
  useEffect(() => {
    if (!dealSheetOpen) setDealAnalyticsOpen(false);
  }, [dealSheetOpen]);
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
  const openDeal = (d: Deal | null | undefined) => {
    if (!d) return;
    setSelectedDeal(d);
    setDealSheetOpen(true);
  };
  const daysTo = (iso?: string | null) => {
    if (!iso) return 0;
    const now = new Date();
    const dt = new Date(iso);
    const ms = dt.getTime() - now.getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  };
  const riskBadgeClass = (d: Deal) => {
    const hasRed = d.risk_level === 'RED' || (Array.isArray(d.risk_reasons) && d.risk_reasons.some((r: RiskReason) => r.severity === 'RED'));
    const hasAmber = d.risk_level === 'AMBER' || (Array.isArray(d.risk_reasons) && d.risk_reasons.some((r: RiskReason) => r.severity === 'AMBER'));
    if (hasRed) return 'bg-status-red/10 text-status-red';
    if (hasAmber) return 'bg-status-amber/10 text-status-amber';
    return 'bg-secondary/60 text-muted-foreground';
  };
  const riskReasonText = (d: Deal) => {
    const first = Array.isArray(d.risk_reasons) && d.risk_reasons[0];
    if (!first) return 'No economic buyer identified';
    const code = first.code;
    if (code === 'MISSING_EB') return 'No economic buyer identified';
    if (code === 'SINGLE_THREADED') return 'Account is single-threaded';
    if (code === 'NO_MAP') return 'No mutual action plan';
    if (code === 'STAGE_STUCK') return 'Deal is stuck in current stage';
    if (code === 'CLOSE_DATE_MOVED') return 'Close date recently moved';
    if (code === 'NO_NEXT_STEP_DATE') return 'No next step date on record';
    if (code === 'WEAK_VALUE') return 'Value proposition is weak';
    if (code === 'COMMIT_AT_RISK') return 'Commit forecast is at risk';
    if (code === 'LOW_ACTIVITY') return 'Low recent activity';
    return first.label || 'Key risk identified';
  };
  const deriveKeyRisks = (d: Deal) => {
    const out: string[] = [];
    if (Array.isArray(d.risk_reasons)) {
      if (d.risk_reasons.some((r: RiskReason) => r.code === 'MISSING_EB')) {
        out.push('No economic buyer identified after 3 meetings');
      }
      if (d.risk_reasons.some((r: RiskReason) => r.code === 'SINGLE_THREADED')) {
        out.push('Champion went silent for 2 weeks');
      }
      if (d.risk_reasons.some((r: RiskReason) => r.code === 'CLOSE_DATE_MOVED')) {
        out.push('Competitor demo scheduled next Tuesday');
      }
    }
    if (out.length === 0) {
      out.push('Champion went silent for 2 weeks');
      out.push('No economic buyer identified after 3 meetings');
    }
    return out.slice(0, 3);
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
            <Select value={repFilter} onValueChange={setRepFilter}>
              <SelectTrigger className="w-56 h-8 text-xs bg-white">
                <SelectValue placeholder="All Reps" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reps</SelectItem>
                {Array.from(new Set(reps.map(r => r.name))).sort().map(name => (
                  <SelectItem
                    key={name}
                    value={name}
                    className="text-xs hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-foreground"
                  >
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
              description="Ask about self-assessment status, coaching priorities, or hygiene gaps"
            />
            <Button
              size="sm"
              className=""
              disabled={selectedDeals.length === 0}
              onClick={() => {
                if (selectedDeals.length === 0) return;
                const ids = Array.from(selectedDealIds);
                localStorage.setItem("uncoverSelectedDealIds", JSON.stringify(ids));
                showSuccess(`Selected ${selectedDeals.length} deals (${formatCurrency(selectedTotal)}).`);
                try {
                  sessionStorage.setItem('pulse.started', 'true');
                  sessionStorage.setItem('pulse.completed', 'false');
                  sessionStorage.setItem('pulse.currentIdx', String(1));
                  const maxStr = sessionStorage.getItem('pulse.maxIdx');
                  const prevMax = maxStr ? parseInt(maxStr, 10) : -1;
                  const newMax = Math.max(prevMax, 1);
                  sessionStorage.setItem('pulse.maxIdx', String(Number.isNaN(newMax) ? 1 : newMax));
                  const cStr = sessionStorage.getItem('pulse.completedSteps');
                  const arr = cStr ? JSON.parse(cStr) : [];
                  const set = new Set<string>(Array.isArray(arr) ? arr : []);
                  set.add('prepare');
                  const stepIds = ['prepare','uncover','lead','sync','evaluate'];
                  if (prevMax >= 0) stepIds.slice(0, Math.min(prevMax + 1, stepIds.length)).forEach(id => set.add(id));
                  sessionStorage.setItem('pulse.completedSteps', JSON.stringify(Array.from(set)));
                  window.dispatchEvent(new Event('pulse:state'));
                } catch (e) { void e; }
                navigate("/leader-uncover");
              }}
            >
              Confirm Selection
              <ChevronRight className="h-4 w-4 ml-1" />
              Uncover
            </Button>
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
                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-[#FF8E1C]/10 transition-colors" title="Filter">
                      <Filter className="h-4 w-4" style={{ color: "#FF8E1C" }} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3">
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-xs text-muted-foreground col-span-1">Stage</div>
                        <div className="col-span-2">
                          <Select value={stageFilter} onValueChange={setStageFilter}>
                            <SelectTrigger className="h-8 text-xs bg-white">
                              <SelectValue placeholder="Stage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Stages</SelectItem>
                              {Array.from(new Set(mockDeals.map(d => d.stage_name))).sort().map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-xs text-muted-foreground col-span-1">Risk Level</div>
                        <div className="col-span-2">
                          <Select value={riskLevelFilter} onValueChange={(v) => setRiskLevelFilter(v as 'all'|'RED'|'AMBER'|'GREEN')}>
                            <SelectTrigger className="h-8 text-xs bg-white">
                              <SelectValue placeholder="Risk Level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Levels</SelectItem>
                              <SelectItem value="RED">High</SelectItem>
                              <SelectItem value="AMBER">Medium</SelectItem>
                              <SelectItem value="GREEN">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-xs text-muted-foreground col-span-1">Forecast</div>
                        <div className="col-span-2">
                          <Select value={forecastFilter} onValueChange={(v) => setForecastFilter(v as 'all'|'COMMIT'|'BEST_CASE'|'PIPELINE'|'OMIT')}>
                            <SelectTrigger className="h-8 text-xs bg-white">
                              <SelectValue placeholder="Forecast" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="COMMIT">Commit</SelectItem>
                              <SelectItem value="BEST_CASE">Best Case</SelectItem>
                              <SelectItem value="PIPELINE">Pipeline</SelectItem>
                              <SelectItem value="OMIT">Omit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setRepFilter('all');
                            setStageFilter('all');
                            setRiskLevelFilter('all');
                            setForecastFilter('all');
                          }}
                        >
                          Reset
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs"
                          onClick={() => setFilterOpen(false)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-gray-100"
                      title="Sort"
                    >
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-xs">
                    <DropdownMenuItem onClick={() => setSortBy('risk')}>Risk priority</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('amount')}>Amount (high → low)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('close_date')}>Close date (soonest)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearAll} title="Clear filters & selection">
                  <Eraser className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <div className="p-3 space-y-2 max-h-[75vh] overflow-y-auto">
              {useMemo(() => {
                const deals = mockDeals.filter(applyFilters).slice();
                deals.sort((a, b) => {
                  if (sortBy === 'amount') return b.amount - a.amount;
                  if (sortBy === 'close_date') {
                    const at = a.close_date ? new Date(a.close_date).getTime() : Number.MAX_SAFE_INTEGER;
                    const bt = b.close_date ? new Date(b.close_date).getTime() : Number.MAX_SAFE_INTEGER;
                    return at - bt;
                  }
                  const rank = (lvl?: string | null) => lvl === 'RED' ? 2 : lvl === 'AMBER' ? 1 : lvl === 'GREEN' ? 0 : -1;
                  const r = rank(b.risk_level) - rank(a.risk_level);
                  if (r !== 0) return r;
                  return b.amount - a.amount;
                });
                return deals;
              }, [applyFilters, sortBy]).map((deal) => {
                const checked = selectedDealIds.has(deal.deal_id);
                const dtc = daysTo(deal.close_date);
                return (
                  <div
                    key={deal.deal_id}
                    className="border border-border rounded-lg bg-card p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => openDeal(deal)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="self-center" onClick={e => e.stopPropagation()}>
                          <Checkbox className="h-6 w-6 rounded-[4px]" checked={checked} onCheckedChange={() => toggleSelection(deal.deal_id)} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {deal.deal_name}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground truncate">
                            {deal.stage_name} · {deal.owner_name} · {dtc >= 0 ? `${dtc}d to close` : `${Math.abs(dtc)}d overdue`}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2 self-center">
                        <div className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {formatCurrency(deal.amount)}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                            deal.risk_level === 'RED'
                              ? 'bg-status-red/10 text-status-red'
                              : deal.risk_level === 'AMBER'
                              ? 'bg-status-amber/10 text-status-amber'
                              : 'bg-status-green/10 text-status-green'
                          }`}
                        >
                          {deal.risk_level === 'RED' ? 'High' : deal.risk_level === 'AMBER' ? 'Medium' : 'Low'}
                        </span>
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
                {(() => {
                  const rows = visibleDealIds
                    .map(id => mockDeals.find(d => d.deal_id === id))
                    .filter(Boolean) as Deal[];
                  if (rows.length === 0) {
                    return <div className="text-muted-foreground">No deals match current filters.</div>;
                  }
                  const total = rows.reduce((s, d) => s + d.amount, 0);
                  const highRisk = rows.filter(d => d.risk_level === 'RED').length;
                  const topValue = rows.filter(d => d.forecast_category === 'COMMIT' || d.forecast_category === 'BEST_CASE').length;
                  const nearClose = rows.filter(d => daysTo(d.close_date) <= 21).length;
                  const reps = Array.from(new Set(rows.map(d => d.owner_name))).length;
                  return (
                    <div>
                      <div>These {rows.length} deals represent {formatCurrency(total)} in pipeline and have the highest coaching leverage — small interventions here yield outsized results based on historical patterns.</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {highRisk} High-risk · {topValue} Top value · {nearClose} Near close (≤21d) · {reps} reps involved
                      </div>
                    </div>
                  );
                })()}
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
        <Sheet open={dealSheetOpen} onOpenChange={setDealSheetOpen}>
          <SheetContent
            side="right"
            className={`${dealAnalyticsOpen ? 'sm:max-w-[60rem] sm:w-[60rem] w-full' : 'sm:max-w-lg w-full'} p-0 [&>button]:hidden`}
          >
            <div className="flex w-full h-full">
              {dealAnalyticsOpen && (
                <div className="w-full border-r border-border bg-white flex flex-col">
                  <div className="px-4 py-3 border-b border-border bg-gray-50 text-sm font-semibold text-foreground flex items-center justify-between">
                    <div>Deal Analytics</div>
                    <button type="button" className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-gray-100" onClick={() => setDealAnalyticsOpen(false)} aria-label="Close analytics">
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    <SalesMethodologyCard onDataClick={onModuleDataClick} />
                    <BuyerJourneyCard onDataClick={onModuleDataClick} />
                    <BuyerObjectionsCard onDataClick={onModuleDataClick} />
                    <BuyerQuestionsCard onDataClick={onModuleDataClick} />
                  </div>
                </div>
              )}
              <div className="flex-1 w-full flex flex-col">
                <SheetHdr className="px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <SheetTtl>{selectedDeal ? `${selectedDeal.account_name} / ${selectedDeal.deal_name}` : ""}</SheetTtl>
                    <button type="button" className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-gray-100" onClick={() => setDealSheetOpen(false)} aria-label="Close">
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </SheetHdr>
                {selectedDeal && (
                  <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Amount</div>
                        <div className="text-sm font-medium text-foreground">{formatCurrency(selectedDeal.amount)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Stage</div>
                        <div className="text-sm font-medium text-foreground">{selectedDeal.stage_name}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Close date</div>
                        <div className="text-sm font-medium text-foreground">
                          {new Date(selectedDeal.close_date).toLocaleDateString()}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {(() => { const dtc = daysTo(selectedDeal.close_date); return dtc >= 0 ? `in ${dtc} days` : `${Math.abs(dtc)} days overdue`; })()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Risk level</div>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${selectedDeal.risk_level === 'RED' ? 'border-status-red text-status-red' : selectedDeal.risk_level === 'AMBER' ? 'border-status-amber text-status-amber' : 'border-status-green text-status-green'}`}>
                          {selectedDeal.risk_level === 'RED' ? 'High' : selectedDeal.risk_level === 'AMBER' ? 'Medium' : 'Low'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Risk Signal</div>
                        <div>
                          {(() => {
                            const sig = Array.isArray(selectedDeal.risk_reasons) && selectedDeal.risk_reasons.length > 0
                              ? (selectedDeal.risk_reasons[0].label ?? String(selectedDeal.risk_reasons[0].code).replace(/[_-]/g, ' ').toLowerCase())
                              : 'Low Activity';
                            return <span className={`inline-flex items-center justify-center text-center px-2 py-0.5 rounded-md text-[11px] font-medium ${riskBadgeClass(selectedDeal)}`}>{sig}</span>;
                          })()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Forecast</div>
                        <div className="text-sm font-medium text-foreground">{prettyForecast(selectedDeal.forecast_category)}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Categories</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(() => {
                            const cs: Array<{ label: string; cls: string }> = [];
                            const isTopRisk = selectedDeal.risk_level === 'RED' || (Array.isArray(selectedDeal.risk_reasons) && selectedDeal.risk_reasons.some((r: RiskReason) => r.severity === 'RED'));
                            if (isTopRisk) cs.push({ label: 'Top Risk', cls: 'bg-status-red/10 text-status-red' });
                            if (selectedDeal.forecast_category === 'COMMIT' || selectedDeal.forecast_category === 'BEST_CASE') cs.push({ label: 'Top Value', cls: 'bg-[#605BFF]/10 text-[#605BFF]' });
                            return cs.map((c, i) => <span key={i} className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${c.cls}`}>{c.label}</span>);
                          })()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Risk Reason</div>
                      <div className="text-sm text-foreground">{riskReasonText(selectedDeal)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[11px] font-semibold text-foreground">
                        {initials(selectedDeal.owner_name)}
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Rep</div>
                        <div className="text-sm font-medium text-foreground">{selectedDeal.owner_name}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Key Risks</div>
                      <ul className="list-disc pl-5 text-sm text-foreground">
                        {deriveKeyRisks(selectedDeal).map((r, i) => (<li key={i}>{r}</li>))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Confidence</div>
                        <div className="text-sm font-medium text-foreground">
                          {(() => { const owner = mockAEReps.find(r => r.name === selectedDeal.owner_name); return owner ? confidenceFor(owner.hygiene_score) : "—"; })()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Status</div>
                        <div className="text-sm font-medium text-foreground">
                          {selectedDeal.self_assessment_status ? selectedDeal.self_assessment_status : "—"}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Help</div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {Array.isArray(selectedDeal.help_needed) && selectedDeal.help_needed.length > 0 ? (
                            selectedDeal.help_needed.map(h => (
                              <span key={h} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#605BFF]/10 text-[#605BFF]">{h}</span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <SheetFtr className="px-6 py-3 border-t justify-start sm:justify-start gap-2">
                  {selectedDeal && (
                    <>
                      <Button className="bg-[#605BFF] hover:bg-[#4F48E3]" size="sm" onClick={() => navigate('/leader-uncover')}>Uncover this deal</Button>
                      <Button variant="outline" size="sm" className="hover:bg-muted hover:text-muted-foreground" onClick={() => selectedDeal && openNudge(selectedDeal.owner_name)}>
                        Update Request
                      </Button>
                      <Button
                        size="sm"
                        className=""
                        onClick={() => {
                          if (selectedDeal) {
                            setModulesRep(`${selectedDeal.account_name} - ${selectedDeal.deal_name}`);
                            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                              setModulesOpen(true);
                            } else {
                              setDealAnalyticsOpen(true);
                            }
                          }
                        }}
                      >
                        View Analytics
                      </Button>
                    </>
                  )}
                </SheetFtr>
              </div>
            </div>
          </SheetContent>
        </Sheet>

    </div>
  );
}
