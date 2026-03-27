import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Play, FileDown, AlertCircle, AlertTriangle, CheckCircle, ChartNoAxesCombined, ChevronLeft, ChevronRight, Filter, X, XCircle, MoreVertical, Star, ArrowUpDown, BookOpen, Eraser, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { AskSamPopup } from "@/components/CommonComponents/AskSamPopup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { DealRow } from "@/components/CommonComponents/DealRow";
import { StatusDot } from "@/components/CommonComponents/StatusDot";
import { mockDeals, mockAEReps, mockCalls, formatCurrency, type Deal, type RiskReason } from "@/data/mock";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import SalesMethodologyCard from "@/components/Modules/SalesMethodologyCard";
import BuyerObjectionsCard from "@/components/Modules/BuyerObjectionsCard";
import BuyerQuestionsCard from "@/components/Modules/BuyerQuestionsCard";
import EmptyPopup from "@/components/CommonComponents/EmptyPopup";
import IndividualView from "@/pages/ManagerDashboard/IndividualView";
import { useToastContext } from "@/contexts/ToastContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Sheet, SheetContent, SheetHeader as SheetHdr, SheetTitle as SheetTtl, SheetFooter as SheetFtr } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent as AlertContent, AlertDialogDescription, AlertDialogHeader as AlertHdr, AlertDialogTitle } from "@/components/ui/alert-dialog";

class KpiContentBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message?: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }
  static getDerivedStateFromError(error: unknown) {
    const msg = typeof error === 'object' && error !== null && 'message' in error ? String((error as { message?: unknown }).message ?? '') : undefined;
    return { hasError: true, message: msg };
  }
  componentDidCatch(error: unknown) {
    console.error("KPI content render error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-sm text-red-600">
          Failed to render content.{this.state.message ? ` ${this.state.message}` : ''}
        </div>
      );
    }
    return this.props.children;
  }
}

function ManagerViewContent() {
  const [timeRange, setTimeRange] = useState("This week");
  const updateDealIsInLoop = (id: string, val: boolean) => {
    const idx = mockDeals.findIndex(md => md.deal_id === id);
    if (idx >= 0) {
      (mockDeals[idx] as Deal).isInLoop = val;
    }
  };
  const [stageDialog, setStageDialog] = useState<{ stage: string } | null>(null);
  const [analyticsDeal, setAnalyticsDeal] = useState<Deal | null>(null);
  const [eaPopupOpen, setEaPopupOpen] = useState(false);
  const [eaPopupData, setEaPopupData] = useState<{ title: string; content: string; value: number } | null>(null);
  const [kpiDialog, setKpiDialog] = useState<{ label: string; content: JSX.Element; size?: 'default' | 'large'; headerRight?: JSX.Element } | null>(null);
  const [selectedAE, setSelectedAE] = useState<string | null>(null);
  const [segment, setSegment] = useState('all');
  const [agendaAdjustOpen, setAgendaAdjustOpen] = useState(false);
  const [tierAdjustOpen, setTierAdjustOpen] = useState(false);
  const [tierOverrides, setTierOverrides] = useState<Record<string, 'sync' | 'async' | 'stretch'>>({});
  const [nudgeTarget, setNudgeTarget] = useState<{ repId: string; name: string } | null>(null);
  const { showSuccess } = useToastContext();
  const [dealSheetOpen, setDealSheetOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [pendingRemoveDeal, setPendingRemoveDeal] = useState<Deal | null>(null);
  const [pulseStarted, setPulseStarted] = useState(false);
  const [pulseCurrentIdx, setPulseCurrentIdx] = useState(-1);
  const [pulseCompleted, setPulseCompleted] = useState(false);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stepIdToRoute = (id?: string) => {
    if (!id) return null;
    if (id === 'prep') return '/manager-prep';
    if (id.startsWith('uncover')) return '/leader-uncover';
    if (id === 'lead') return '/leader-lead';
    if (id === 'sync') return '/leader-sync';
    if (id === 'eval') return '/leader-evaluate';
    return null;
  };
  const startOrResumePulse = () => {
    const steps = agendaItems.filter(i => i.included);
    const go = (id?: string) => {
      const path = stepIdToRoute(id);
      if (path) navigate(path);
    };
    if (!pulseStarted) {
      setPulseStarted(true);
      setPulseCurrentIdx(0);
      localStorage.setItem('pulse.started', 'true');
      localStorage.setItem('pulse.currentIdx', '0');
      localStorage.setItem('pulse.completed', 'false');
      const id = steps[0]?.id;
      setTimeout(() => {
        if (id && stepRefs.current[id]) stepRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 0);
      go(id);
    } else {
      const idx = Math.max(0, pulseCurrentIdx);
      const id = steps[idx]?.id;
      setTimeout(() => {
        if (id && stepRefs.current[id]) stepRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 0);
      go(id);
    }
  };
  type AgendaItem = { id: string; status: 'done' | 'current' | 'pending'; time: string; title: string; sub: string; minutes: number; included: boolean };
  const makeAgendaTemplate = (range: string): AgendaItem[] => [
    { id: 'prep', status: 'done', time: 'MON — Prepare', title: 'Review CRM alerts, self-assessments, tier reps', sub: '6/8 assessments received · 5 CRM alerts flagged', minutes: 30, included: true },
    { id: 'uncover1', status: 'current', time: 'MON-TUE — Uncover', title: 'Review 4 flagged calls at 2x speed', sub: 'Sarah: objection handling · James: discovery · Lisa: closing · Tom: intro', minutes: 60, included: true },
    { id: 'uncover2', status: 'pending', time: 'TUE — Uncover', title: 'Send 4 coaching voice notes (P-O-Q formula)', sub: 'Positive → Observation → Question per rep', minutes: 20, included: true },
    { id: 'lead', status: 'pending', time: 'TUE-THU — Lead', title: '4 sync 1:1s (15-20 min each)', sub: 'Sarah: pipeline recovery · James: deal strategy · Lisa: $85K deal · Tom: ramp check', minutes: 75, included: true },
    { id: 'sync', status: 'pending', time: 'WED — Sync', title: 'Review Pipeline Pulse posts + record synthesis video', sub: 'Team commit, wins, common themes, priorities', minutes: 30, included: true },
    { id: 'eval', status: 'pending', time: 'FRI — Evaluate', title: 'Review KPIs + weekly reflection', sub: '5 reflection questions · feed into next week\'s Prepare', minutes: 15, included: true },
  ];
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(() => makeAgendaTemplate(timeRange));
  useEffect(() => {
    setAgendaItems(makeAgendaTemplate(timeRange));
  }, [timeRange]);
  const navigate = useNavigate();
  useEffect(() => {
    const started = localStorage.getItem('pulse.started') === 'true';
    const idxStr = localStorage.getItem('pulse.currentIdx');
    const idx = idxStr ? parseInt(idxStr, 10) : -1;
    const comp = localStorage.getItem('pulse.completed') === 'true';
    setPulseStarted(started);
    setPulseCurrentIdx(Number.isNaN(idx) ? -1 : idx);
    setPulseCompleted(comp);
  }, []);
  useEffect(() => {
    localStorage.setItem('pulse.started', String(pulseStarted));
    localStorage.setItem('pulse.currentIdx', String(pulseCurrentIdx));
  }, [pulseStarted, pulseCurrentIdx]);
  useEffect(() => {
    const syncFromStorage = () => {
      const started = localStorage.getItem('pulse.started') === 'true';
      const idxStr = localStorage.getItem('pulse.currentIdx');
      const idx = idxStr ? parseInt(idxStr, 10) : -1;
      const comp = localStorage.getItem('pulse.completed') === 'true';
      setPulseStarted(started);
      setPulseCurrentIdx(Number.isNaN(idx) ? -1 : idx);
      setPulseCompleted(comp);
    };
    const onVisibility = () => { if (document.visibilityState === 'visible') syncFromStorage(); };
    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('focus', syncFromStorage);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('focus', syncFromStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  const topDeals = mockDeals.slice(0, 6);
  const cfg =
    timeRange === "This week"
      ? { curMax: 7, prevMin: 8, prevMax: 14, unit: "week", staleCur: 7, stalePrevMin: 8, stalePrevMax: 14 }
      : timeRange === "This quarter"
      ? { curMax: 90, prevMin: 91, prevMax: 180, unit: "quarter", staleCur: 90, stalePrevMin: 91, stalePrevMax: 180 }
      : timeRange === "This year"
      ? { curMax: 365, prevMin: 366, prevMax: 730, unit: "year", staleCur: 365, stalePrevMin: 366, stalePrevMax: 730 }
      : { curMax: 30, prevMin: 31, prevMax: 60, unit: "month", staleCur: 30, stalePrevMin: 31, stalePrevMax: 60 };
  const currentWindowDeals = mockDeals.filter(d => d.staleness_days <= cfg.staleCur);
  const previousWindowDeals = mockDeals.filter(d => d.staleness_days >= cfg.stalePrevMin && d.staleness_days <= cfg.stalePrevMax);
  const commitCurrent = currentWindowDeals.filter(d => d.forecast_category === 'COMMIT').reduce((s, d) => s + d.amount, 0);
  const commitPrev = previousWindowDeals.filter(d => d.forecast_category === 'COMMIT').reduce((s, d) => s + d.amount, 0);
  const commitCountCurrent = currentWindowDeals.filter(d => d.forecast_category === 'COMMIT').length;
  const bestCaseTopCur = currentWindowDeals
    .filter(d => d.forecast_category === 'BEST_CASE')
    .slice()
    .sort((a, b) => b.amount - a.amount)[0] || null;
  const bestCaseTopPrev = previousWindowDeals
    .filter(d => d.forecast_category === 'BEST_CASE')
    .slice()
    .sort((a, b) => b.amount - a.amount)[0] || null;
  const bestCaseCurrent = currentWindowDeals.filter(d => d.forecast_category === 'BEST_CASE').reduce((s, d) => s + d.amount, 0);
  const bestCasePrev = previousWindowDeals.filter(d => d.forecast_category === 'BEST_CASE').reduce((s, d) => s + d.amount, 0);
  const bestCaseCountCurrent = currentWindowDeals.filter(d => d.forecast_category === 'BEST_CASE').length;
  const bestCaseAECountCurrent = new Set(currentWindowDeals.filter(d => d.forecast_category === 'BEST_CASE').map(d => d.owner_name)).size;
  const slippageCurrent = currentWindowDeals.filter(d => Array.isArray(d.risk_reasons) && d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).length;
  const slippagePrev = previousWindowDeals.filter(d => Array.isArray(d.risk_reasons) && d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).length;
  const slippageAmountCurrent = currentWindowDeals.filter(d => Array.isArray(d.risk_reasons) && d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).reduce((s, d) => s + d.amount, 0);
  const slippageAmountPrev = previousWindowDeals.filter(d => Array.isArray(d.risk_reasons) && d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).reduce((s, d) => s + d.amount, 0);
  const newlyCommittedCurrent = mockDeals.filter(d => d.forecast_category === 'COMMIT' && d.staleness_days <= cfg.staleCur).length;
  const newlyCommittedPrev = mockDeals.filter(d => d.forecast_category === 'COMMIT' && d.staleness_days >= cfg.stalePrevMin && d.staleness_days <= cfg.stalePrevMax).length;
  const newlyCommittedAmountCurrent = mockDeals.filter(d => d.forecast_category === 'COMMIT' && d.staleness_days <= cfg.staleCur).reduce((s, d) => s + d.amount, 0);
  const newlyCommittedAmountPrev = mockDeals.filter(d => d.forecast_category === 'COMMIT' && d.staleness_days >= cfg.stalePrevMin && d.staleness_days <= cfg.stalePrevMax).reduce((s, d) => s + d.amount, 0);
  const currentCommitSet = currentWindowDeals.filter(d => d.forecast_category === 'COMMIT');
  const prevCommitSet = previousWindowDeals.filter(d => d.forecast_category === 'COMMIT');
  const forecastAccuracyCurrent = currentCommitSet.length ? Math.round((currentCommitSet.filter(d => d.risk_level !== 'RED').length / currentCommitSet.length) * 100) : 0;
  const forecastAccuracyPrev = prevCommitSet.length ? Math.round((prevCommitSet.filter(d => d.risk_level !== 'RED').length / prevCommitSet.length) * 100) : 0;
  const unitLabel = cfg.unit === 'week' ? 'week' : cfg.unit === 'month' ? 'month' : cfg.unit === 'quarter' ? 'quarter' : 'year';
  const trendTextSame = `Same as last ${unitLabel}`;
  const formatDeltaCurrency = (delta: number) => {
    const sign = delta > 0 ? '+' : '-';
    const abs = Math.abs(delta);
    return `${sign}${formatCurrency(abs)}`;
  };
  const formatDeltaCount = (delta: number) => {
    if (delta === 0) return trendTextSame;
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta} vs last ${unitLabel}`;
  };
  const formatDeltaPercent = (delta: number) => {
    if (delta === 0) return trendTextSame;
    const sign = delta > 0 ? '+' : '';
    return `${sign}${Math.abs(delta)}% vs last ${unitLabel}`;
  };
  const commitDelta = commitCurrent - commitPrev;
  const bestCaseDelta = bestCaseCurrent - bestCasePrev;
  const slippageDelta = slippageCurrent - slippagePrev;
  const newlyCommittedDelta = newlyCommittedCurrent - newlyCommittedPrev;
  const slippageAmountDelta = slippageAmountCurrent - slippageAmountPrev;
  const newlyCommittedAmountDelta = newlyCommittedAmountCurrent - newlyCommittedAmountPrev;
  const forecastDelta = forecastAccuracyCurrent - forecastAccuracyPrev;
  const commitDealsCur = currentWindowDeals.filter(d => d.forecast_category === 'COMMIT');
  const atRiskDealsCur = commitDealsCur.filter(isAtRiskCommit);
  const atRiskAmtCurrent = atRiskDealsCur.reduce((s, d) => s + d.amount, 0);
  const atRiskCountCurrent = atRiskDealsCur.length;
  const commitDealsPrev = previousWindowDeals.filter(d => d.forecast_category === 'COMMIT');
  const atRiskDealsPrev = commitDealsPrev.filter(isAtRiskCommit);
  const atRiskAmtPrev = atRiskDealsPrev.reduce((s, d) => s + d.amount, 0);
  const atRiskDeltaAmt = atRiskAmtCurrent - atRiskAmtPrev;
  const topDealsAmtCurrent = commitCurrent + bestCaseCurrent;
  const topDealsAmtPrev = commitPrev + bestCasePrev;
  const topDealsCountCurrent = commitCountCurrent + bestCaseCountCurrent;
  const topDealsDeltaAmt = topDealsAmtCurrent - topDealsAmtPrev;
  const pipelineFilterAll = (d: Deal) => d.forecast_category === 'PIPELINE' || d.forecast_category === 'COMMIT' || d.forecast_category === 'BEST_CASE';
  const hygieneEligibleCntAllCur = currentWindowDeals.filter(pipelineFilterAll).length;
  const hygieneGapCntAllCur = currentWindowDeals.filter(d => pipelineFilterAll(d) && isHygieneGap(d)).length;
  const actionsCompletedPctCur = hygieneEligibleCntAllCur ? Math.round(((hygieneEligibleCntAllCur - hygieneGapCntAllCur) * 100) / hygieneEligibleCntAllCur) : 0;
  const hygieneEligibleCntAllPrev = previousWindowDeals.filter(pipelineFilterAll).length;
  const hygieneGapCntAllPrev = previousWindowDeals.filter(d => pipelineFilterAll(d) && isHygieneGap(d)).length;
  const actionsCompletedPctPrev = hygieneEligibleCntAllPrev ? Math.round(((hygieneEligibleCntAllPrev - hygieneGapCntAllPrev) * 100) / hygieneEligibleCntAllPrev) : 0;
  const actionsCompletedDeltaPct = actionsCompletedPctCur - actionsCompletedPctPrev;
  const coachingEligibleCur = currentWindowDeals.filter(d => d.need_coaching);
  const assessmentsSubmittedCur = coachingEligibleCur.filter(d => d.self_assessment_status === 'SUBMITTED').length;
  const coachingEligiblePrev = previousWindowDeals.filter(d => d.need_coaching);
  const assessmentsSubmittedPrev = coachingEligiblePrev.filter(d => d.self_assessment_status === 'SUBMITTED').length;
  const assessmentsPending = coachingEligibleCur.filter(d => d.self_assessment_status === 'PENDING' || d.self_assessment_status === 'TODO').length;
  const assessmentsDelta = assessmentsSubmittedCur - assessmentsSubmittedPrev;
  const completedCoachingReps = Array.from(new Set(coachingEligibleCur.filter(d => d.self_assessment_status === 'SUBMITTED').map(d => d.owner_name)));
  const upcomingCoachingReps = Array.from(new Set(coachingEligibleCur.filter(d => d.self_assessment_status === 'PENDING' || d.self_assessment_status === 'TODO').map(d => d.owner_name)));
  const completedNote = (completedCoachingReps.length ? completedCoachingReps.join(', ') : 'No sessions completed') + ' →';
  const completedNoteShort = (() => {
    if (!completedCoachingReps.length) return 'No sessions completed →';
    const maxNames = 1;
    const names = completedCoachingReps.slice(0, maxNames);
    const more = completedCoachingReps.length - names.length;
    return more > 0 ? `${names.join(', ')} +${more} more →` : `${names.join(', ')} →`;
  })();
  const upcomingNote = (upcomingCoachingReps.length ? upcomingCoachingReps.join(', ') : 'No upcoming sessions') + ' →';
  const worstCaseTopCur = currentWindowDeals
    .filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED')
    .slice()
    .sort((a, b) => b.amount - a.amount)[0] || null;
  const worstCaseTopPrev = previousWindowDeals
    .filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED')
    .slice()
    .sort((a, b) => b.amount - a.amount)[0] || null;
  const worstCaseCurrent = currentWindowDeals.filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED').reduce((s, d) => s + d.amount, 0);
  const worstCasePrev = previousWindowDeals.filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED').reduce((s, d) => s + d.amount, 0);
  const worstCaseCountCurrent = currentWindowDeals.filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED').length;
  const worstCaseDelta = worstCaseCurrent - worstCasePrev;
  const attentionQueueDeals = currentWindowDeals
    .slice()
    .sort((a, b) => {
      const ar = a.risk_reasons.length > 0 ? 1 : 0;
      const br = b.risk_reasons.length > 0 ? 1 : 0;
      if (ar !== br) return br - ar;
      const rank: Record<string, number> = { RED: 0, AMBER: 1, GREEN: 2 };
      const ra = rank[a.risk_level] ?? 3;
      const rb = rank[b.risk_level] ?? 3;
      if (ra !== rb) return ra - rb;
      if (a.risk_score !== b.risk_score) return b.risk_score - a.risk_score;
      return b.amount - a.amount;
    })
    .slice(0, 6);
  const commitQueueDeals = currentWindowDeals
    .filter((d) => d.forecast_category === 'COMMIT')
    .slice()
    .sort((a, b) => {
      const rank: Record<string, number> = { RED: 0, AMBER: 1, GREEN: 2 };
      const ra = rank[a.risk_level] ?? 3;
      const rb = rank[b.risk_level] ?? 3;
      if (ra !== rb) return ra - rb;
      const da = new Date(a.close_date).getTime();
      const db = new Date(b.close_date).getTime();
      if (da !== db) return da - db;
      return b.amount - a.amount;
    });
  function isAtRiskCommit(d: Deal): boolean {
    const nonGreen = d.risk_level !== 'GREEN';
    const slippage = Array.isArray(d.risk_reasons) && d.risk_reasons.some((r) => r.code === 'CLOSE_DATE_MOVED');
    const missingEB = Array.isArray(d.risk_reasons) && d.risk_reasons.some((r) => r.code === 'MISSING_EB');
    const noMap = Array.isArray(d.risk_reasons) && d.risk_reasons.some((r) => r.code === 'NO_MAP');
    const singleThread = Array.isArray(d.risk_reasons) && d.risk_reasons.some((r) => r.code === 'SINGLE_THREADED');
    const days = Math.ceil((new Date(d.close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const nextStepRisk = (!d.next_step || !d.next_step.is_buyer_confirmed) && days <= 21;
    return nonGreen || slippage || missingEB || noMap || singleThread || nextStepRisk;
  }
  function isHygieneGap(d: Deal): boolean {
    const missingEB = Array.isArray(d.risk_reasons) && d.risk_reasons.some((r) => r.code === 'MISSING_EB');
    const noMap = Array.isArray(d.risk_reasons) && d.risk_reasons.some((r) => r.code === 'NO_MAP');
    const singleThread = Array.isArray(d.risk_reasons) && d.risk_reasons.some((r) => r.code === 'SINGLE_THREADED');
    const days = Math.ceil((new Date(d.close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const nextStepRisk = (!d.next_step || !d.next_step.is_buyer_confirmed) && days <= 21;
    return missingEB || noMap || singleThread || nextStepRisk;
  }
  const commitCoverage = commitQueueDeals.reduce((s, d) => s + d.amount, 0);
  const atRiskCount = commitQueueDeals.filter(isAtRiskCommit).length;
  const baseMonthlyTarget = 1200000;
  const targetAmount = timeRange === 'This week'
    ? Math.round(baseMonthlyTarget / 4)
    : timeRange === 'This quarter'
    ? baseMonthlyTarget * 3
    : timeRange === 'This year'
    ? baseMonthlyTarget * 12
    : baseMonthlyTarget;
  const perRepAgg = mockAEReps.map((rep) => {
    const ds = currentWindowDeals.filter(d => d.owner_name === rep.name);
    const pipelineFilter = (d: Deal) => d.forecast_category === 'PIPELINE' || d.forecast_category === 'COMMIT' || d.forecast_category === 'BEST_CASE';
    const pipelineAmt = ds.filter(pipelineFilter).reduce((s, d) => s + d.amount, 0);
    const pipelineCnt = ds.filter(pipelineFilter).length;
    const commitAmt = ds.filter(d => d.forecast_category === 'COMMIT').reduce((s, d) => s + d.amount, 0);
    const commitCnt = ds.filter(d => d.forecast_category === 'COMMIT').length;
    const bestCaseAmt = ds.filter(d => d.forecast_category === 'BEST_CASE').reduce((s, d) => s + d.amount, 0);
    const worstCaseAmt = ds.filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED').reduce((s, d) => s + d.amount, 0);
    const slippageCnt = ds.filter(d => Array.isArray(d.risk_reasons) && d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).length;
    const slippageAmt = ds.filter(d => Array.isArray(d.risk_reasons) && d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).reduce((s, d) => s + d.amount, 0);
    const newlyCommittedCnt = currentWindowDeals.filter(d => d.owner_name === rep.name && d.forecast_category === 'COMMIT').length;
    const newlyCommittedAmt = currentWindowDeals.filter(d => d.owner_name === rep.name && d.forecast_category === 'COMMIT').reduce((s, d) => s + d.amount, 0);
    const hygieneEligibleCnt = ds.filter(pipelineFilter).length;
    const hygieneGapCnt = ds.filter((d) => pipelineFilter(d) && isHygieneGap(d)).length;
    const hygienePct = hygieneEligibleCnt ? Math.round(((hygieneEligibleCnt - hygieneGapCnt) * 100) / hygieneEligibleCnt) : 0;
    return { pipelineAmt, pipelineCnt, commitAmt, commitCnt, bestCaseAmt, worstCaseAmt, slippageAmt, slippageCnt, newlyCommittedAmt, newlyCommittedCnt, hygienePct };
  });
  const aeColWidth = Math.max(12, Math.max(...mockAEReps.map(r => r.name.length)) + 4);
  const targetPerAEWidthSource = formatCurrency(Math.round(targetAmount / Math.max(1, mockAEReps.length)));
  const targetColWidth = Math.max(12, targetPerAEWidthSource.length + 4);
  const pipelineColWidth = Math.max(14, Math.max(...perRepAgg.map(a => Math.max(formatCurrency(a.pipelineAmt).length, `${a.pipelineCnt} deals`.length))) + 2);
  const commitColWidth = Math.max(14, Math.max(...perRepAgg.map(a => Math.max(formatCurrency(a.commitAmt).length, `${a.commitCnt} deals`.length))) + 2);
  const bestCaseColWidth = Math.max(12, Math.max(...perRepAgg.map(a => formatCurrency(a.bestCaseAmt).length)) + 2);
  const worstCaseColWidth = Math.max(12, Math.max(...perRepAgg.map(a => formatCurrency(a.worstCaseAmt).length)) + 2);
  const slippageColWidth = Math.max(14, Math.max(...perRepAgg.map(a => Math.max(formatCurrency(a.slippageAmt).length, `${a.slippageCnt} deals`.length))) + 2);
  const newlyColWidth = Math.max(14, Math.max(...perRepAgg.map(a => Math.max(formatCurrency(a.newlyCommittedAmt).length, `${a.newlyCommittedCnt} deals`.length))) + 2);
  const hygieneColWidth = Math.max(8, Math.max(...perRepAgg.map(a => `${a.hygienePct}%`.length)) + 2);
  const now = new Date();
  const getInitials = (n: string) =>
    n
      .split(' ')
      .map(p => p.trim()[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  const targetPerAEAll = Math.round(targetAmount / Math.max(1, mockAEReps.length));
  const pipelineAmountCurrent = currentWindowDeals
    .filter(pipelineFilterAll)
    .reduce((s, d) => s + d.amount, 0);
  const coverageX = targetAmount > 0 ? pipelineAmountCurrent / targetAmount : 0;
  const gapToClose = Math.max(0, targetAmount - commitCurrent);
  const coverageTone: 'green' | 'amber' | 'red' = coverageX >= 3 ? 'green' : coverageX >= 2 ? 'amber' : 'red';
  const gapTone: 'green' | 'red' = gapToClose > 0 ? 'red' : 'green';
  const targetLabel =
    timeRange === 'This week'
      ? 'Weekly Target'
      : timeRange === 'This month'
      ? 'Monthly Target'
      : timeRange === 'This quarter'
      ? 'Quarterly Target'
      : 'Yearly Target';
  const classifyRep = (rep: (typeof mockAEReps)[number]) => {
    if (rep.hygiene_score < 75 || rep.slippage_count >= 2) return 'sync';
    if (rep.hygiene_score >= 85 && rep.slippage_count === 0 && rep.overdue_actions === 0) return 'async';
    return 'stretch';
  };
  const buckets: Record<'sync' | 'async' | 'stretch', typeof mockAEReps> = { sync: [], async: [], stretch: [] };
  for (const rep of mockAEReps) {
    const override = tierOverrides[rep.user_id] as 'sync' | 'async' | 'stretch' | undefined;
    const b = (override ?? classifyRep(rep)) as 'sync' | 'async' | 'stretch';
    buckets[b].push(rep);
  }
  const buildDetails = (rep: (typeof mockAEReps)[number]) => {
    const ds = currentWindowDeals.filter(d => d.owner_name === rep.name);
    const stalled = ds.filter(d => Array.isArray(d.risk_reasons) && d.risk_reasons.some(r => r.code === 'STAGE_STUCK')).length;
    const commitAmtCur = ds.filter(d => d.forecast_category === 'COMMIT').reduce((s, d) => s + d.amount, 0);
    const commitAmtPrev = previousWindowDeals.filter(d => d.owner_name === rep.name && d.forecast_category === 'COMMIT').reduce((s, d) => s + d.amount, 0);
    const pct = commitAmtPrev ? Math.round(((commitAmtCur - commitAmtPrev) * 100) / commitAmtPrev) : 0;
    const commitTxt = pct === 0 ? 'Commit flat' : pct > 0 ? `Commit up ${pct}%` : `Commit dropped ${Math.abs(pct)}%`;
    const pipelineFilter = (d: Deal) => d.forecast_category === 'PIPELINE' || d.forecast_category === 'COMMIT' || d.forecast_category === 'BEST_CASE';
    const pipelineAmt = ds.filter(pipelineFilter).reduce((s, d) => s + d.amount, 0);
    const coverage = targetPerAEAll > 0 ? (pipelineAmt / targetPerAEAll) : 0;
    const coverageTxt = `Pipeline coverage ${coverage.toFixed(1)}x`;
    const needHelp = ds.some(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED');
    const helpTxt = needHelp ? 'Needs deal help' : null;
    const slipped = ds
      .filter(d => Array.isArray(d.risk_reasons) && d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED'))
      .slice()
      .sort((a, b) => b.amount - a.amount)[0];
    const slipTxt = slipped ? `Close date pushed on ${formatCurrency(slipped.amount)} deal` : null;
    const parts = [`${stalled} stalled deals`, commitTxt, coverageTxt, helpTxt, slipTxt].filter(Boolean) as string[];
    return parts.join(' · ');
  };
  const formatMonthLabel = (d: Date) =>
    `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
  const formatQuarterLabel = (d: Date) => {
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `Q${q} ${d.getFullYear()}`;
  };
  const formatYearLabel = (d: Date) => `${d.getFullYear()}`;
  const formatWeekRangeLabel = (d: Date) => {
    const day = d.getDay(); // 0 Sun - 6 Sat
    const diffToMonday = (day + 6) % 7;
    const start = new Date(d);
    start.setDate(d.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (x: Date) => x.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    const sameYear = start.getFullYear() === end.getFullYear();
    return `${fmt(start)}–${fmt(end)}${sameYear ? `, ${start.getFullYear()}` : `, ${start.getFullYear()}–${end.getFullYear()}`}`;
  };
  const targetPeriodLabel =
    timeRange === 'This week'
      ? formatWeekRangeLabel(now)
      : timeRange === 'This quarter'
      ? formatQuarterLabel(now)
      : timeRange === 'This year'
      ? formatYearLabel(now)
      : formatMonthLabel(now);
  const flaggedCallsCur = mockCalls.filter(c => {
    const d = new Date(c.date).getTime();
    const diffDays = Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
    return diffDays <= cfg.curMax && c.flagged;
  }).length;
  const funnelStages = ['Discovery', 'Validation', 'Proposal', 'Negotiation', 'Closed Won'];
  const bench: Record<string, number> = { 'Discovery': 10, 'Validation': 8, 'Proposal': 12, 'Negotiation': 10, 'Closed Won': 0 };
  const dealsForFunnel = currentWindowDeals;
  const stageAgg = funnelStages.map(s => {
    const ds = dealsForFunnel.filter(d => d.stage_name === s);
    const revenue = ds.reduce((sum, d) => sum + d.amount, 0);
    const count = ds.length;
    const avgDwell = count ? Math.round(ds.reduce((sum, d) => sum + (d.stage_dwell_days || 0), 0) / count) : 0;
    return { stage: s, revenue, count, avgDwell };
  });
  const totalRev = stageAgg.reduce((sum, s) => sum + s.revenue, 0);
  const maxRev = stageAgg.reduce((m, s) => Math.max(m, s.revenue), 0);
  const conv = stageAgg.map((s, i) => (i < stageAgg.length - 1 ? Math.round((stageAgg[i + 1].count * 100) / Math.max(1, s.count)) : 0));
  const rawStagePct = stageAgg.map(s => (totalRev > 0 ? (s.revenue / totalRev) * 100 : 0));
  const widthPercents = (() => {
    if (totalRev <= 0) return stageAgg.map(() => 0);
    const floors = rawStagePct.map(p => Math.floor(p));
    const sumFloors = floors.reduce((a, b) => a + b, 0);
    const remainder = 100 - sumFloors;
    const order = rawStagePct
      .map((p, i) => ({ i, frac: p - Math.floor(p) }))
      .sort((a, b) => b.frac - a.frac);
    const result = floors.slice();
    for (let k = 0; k < remainder; k++) {
      const t = order[k];
      if (t) result[t.i]++;
    }
    return result;
  })();
  const biggestDropIdx = (() => {
    let idx = -1;
    let min = 101;
    for (let i = 0; i < conv.length - 1; i++) {
      if (stageAgg[i].count === 0) continue;
      if (conv[i] < min) {
        min = conv[i];
        idx = i;
      }
    }
    return idx;
  })();
  const highestRevIdx = stageAgg.reduce((a, s, i) => (s.revenue > stageAgg[a].revenue ? i : a), 0);
  const slowestIdx = stageAgg.reduce((a, s, i) => (s.avgDwell > stageAgg[a].avgDwell ? i : a), 0);
  const FunnelDealsTable = ({ deals }: { deals: Deal[] }) => {
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(deals.length / pageSize));
    const start = (page - 1) * pageSize;
    const pageDeals = deals.slice(start, start + pageSize);
    return (
      <div className="space-y-2">
        <div className="rounded overflow-x-auto">
          <table className="w-full text-xs table-fixed">
            <colgroup>
              <col style={{ width: '28ch' }} />
              <col style={{ width: '12ch' }} />
              <col style={{ width: '16ch' }} />
              <col style={{ width: '12ch' }} />
              <col style={{ width: '14ch' }} />
              <col style={{ width: '12ch' }} />
              <col style={{ width: '12ch' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-3 py-2 font-medium">Deal</th>
                <th className="text-right px-3 py-2 font-medium">Value</th>
                <th className="text-right px-3 py-2 font-medium">AE</th>
                <th className="text-right px-3 py-2 font-medium">Close</th>
                <th className="text-right px-3 py-2 font-medium">Stage</th>
                <th className="text-right px-3 py-2 font-medium">Days in Stage</th>
                <th className="text-right px-3 py-2 font-medium">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {pageDeals.length > 0 ? (
                pageDeals.map((d) => (
                  <tr key={d.deal_id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 whitespace-nowrap text-left">{d.account_name} / {d.deal_name}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(d.amount)}</td>
                    <td className="px-3 py-2 text-right">{d.owner_name}</td>
                    <td className="px-3 py-2 text-right">{new Date(d.close_date).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-right">{d.stage_name}</td>
                    <td className="px-3 py-2 text-right">{d.stage_dwell_days || 0}d</td>
                    <td className="px-3 py-2 text-right">{d.staleness_days}d ago</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-muted-foreground">No deals.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-border flex items-center justify-start gap-3 text-sm">
          <span
            className={`cursor-pointer ${page === 1 ? 'text-muted-foreground hover:text-[#605BFF]' : 'text-foreground hover:text-[#605BFF]'} hover:opacity-80`}
            onClick={page > 1 ? () => setPage(page - 1) : undefined}
            aria-disabled={page === 1}
            role="button"
            tabIndex={page === 1 ? -1 : 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </span>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
            const active = n === page;
            return (
              <span
                key={n}
                className={`px-3 cursor-pointer ${active ? '' : 'text-foreground'} hover:text-[#605BFF] hover:opacity-80`}
                style={active ? { color: '#605BFF' } : undefined}
                onClick={!active ? () => setPage(n) : undefined}
                role="button"
                tabIndex={active ? -1 : 0}
              >
                {n}
              </span>
            );
          })}
          <span
            className={`cursor-pointer ${page === totalPages ? 'text-muted-foreground hover:text-[#605BFF]' : 'text-foreground hover:text-[#605BFF]'} hover:opacity-80`}
            onClick={page < totalPages ? () => setPage(page + 1) : undefined}
            aria-disabled={page === totalPages}
            role="button"
            tabIndex={page === totalPages ? -1 : 0}
          >
            <ChevronRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    );
  };
  const topRiskAlerts = attentionQueueDeals.slice(0, 5);
  const riskBadgeClass = (d: Deal) => {
    const hasRed = d.risk_level === 'RED' || (Array.isArray(d.risk_reasons) && d.risk_reasons.some((r: RiskReason) => r.severity === 'RED'));
    const hasAmber = d.risk_level === 'AMBER' || (Array.isArray(d.risk_reasons) && d.risk_reasons.some((r: RiskReason) => r.severity === 'AMBER'));
    if (hasRed) return 'bg-status-red/10 text-status-red';
    if (hasAmber) return 'bg-status-amber/10 text-status-amber';
    return 'bg-secondary/60 text-muted-foreground';
  };
  const priorityOf = (d: Deal) => {
    if (d.risk_level === 'RED' || d.amount >= 150000) return 'P1';
    if (d.risk_level === 'AMBER' || d.amount >= 80000) return 'P2';
    return 'P3';
  };
  const prettyForecast = (s: string | null | undefined) => {
    const base = (s ?? '').toString().replace(/_/g, ' ').toLowerCase();
    return base.replace(/(^|\s)\w/g, (m) => m.toUpperCase()) || '—';
  };
  const daysTo = (close: string) => {
    const diff = Math.ceil((new Date(close).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };
  const openDeal = (d: Deal) => {
    setSelectedDeal(d);
    setDealSheetOpen(true);
  };
  const toggleLoopAdd = (d: Deal) => {
    if (d.isInLoop) {
      setPendingRemoveDeal(d);
      setRemoveConfirmOpen(true);
    } else {
      updateDealIsInLoop(d.deal_id, true);
      if (selectedDeal && selectedDeal.deal_id === d.deal_id) {
        setSelectedDeal({ ...selectedDeal, isInLoop: true });
      }
      showSuccess(`Successfully added ${d.account_name} / ${d.deal_name} to Pulse loop`);
    }
  };
  const confirmRemove = () => {
    if (pendingRemoveDeal) {
      updateDealIsInLoop(pendingRemoveDeal.deal_id, false);
      if (selectedDeal && selectedDeal.deal_id === pendingRemoveDeal.deal_id) {
        setSelectedDeal({ ...selectedDeal, isInLoop: false });
      }
    }
    setPendingRemoveDeal(null);
    setRemoveConfirmOpen(false);
  };
  const [riskSelected, setRiskSelected] = useState(false);
  const [valueSelected, setValueSelected] = useState(false);
  const priorityDealsRef = useRef<HTMLDivElement>(null);
  const goToPriorityDeals = (filter?: 'risk'|'value') => {
    if (filter === 'risk') {
      setRiskSelected(true);
      setValueSelected(false);
    } else if (filter === 'value') {
      setRiskSelected(false);
      setValueSelected(true);
    }
    setTimeout(() => {
      priorityDealsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };
  const [filterOpen, setFilterOpen] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [repFilter, setRepFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all'|'P1'|'P2'|'P3'>('all');
  const [amountMin, setAmountMin] = useState<string>('');
  const [amountMax, setAmountMax] = useState<string>('');
  const [sortBy, setSortBy] = useState<'risk'|'amount'|'close_date'>('risk');
  const riskReasonText = (d: Deal) => {
    const first = d.risk_reasons && d.risk_reasons[0];
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
    if (d.risk_reasons.some(r => r.code === 'MISSING_EB')) {
      out.push('No economic buyer identified after 3 meetings');
    }
    if (d.risk_reasons.some(r => r.code === 'SINGLE_THREADED')) {
      out.push('Champion went silent for 2 weeks');
    }
    if (d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')) {
      out.push('Competitor demo scheduled next Tuesday');
    }
    if (out.length === 0) {
      out.push('Champion went silent for 2 weeks');
      out.push('No economic buyer identified after 3 meetings');
    }
    return out.slice(0, 3);
  };

  const tieringHeaderRange =
    timeRange === 'This week'
      ? 'This Week'
      : timeRange === 'This month'
      ? 'This Month'
      : timeRange === 'This quarter'
      ? 'This Quarter'
      : 'This Year';

  const subtitlePeriodWord =
    timeRange === 'This week'
      ? 'Week'
      : timeRange === 'This month'
      ? 'Month'
      : timeRange === 'This quarter'
      ? 'Quarter'
      : 'Year';
  const totalAE = mockAEReps.length;
  const headerSubtitle = `${subtitlePeriodWord} of ${targetPeriodLabel} — ${totalAE} reps managed`;
  const askSamQuestions = [
    "Which deals are Top Risk this period?",
    "Show Top Value deals in commit/best case",
    "Which reps need coaching this week?",
    "List deals with hygiene gaps",
    "Who has slippage risk in commit?",
  ];
  const askSamAnswer = (q: string) => {
    const l = q.toLowerCase();
    if (l.includes("risk")) return `Top Risk: ${attentionQueueDeals.slice(0, 3).map(d => `${d.account_name}/${d.deal_name}`).join(", ") || "—"}`;
    if (l.includes("value")) {
      const tv = currentWindowDeals.filter(d => d.forecast_category === 'COMMIT' || d.forecast_category === 'BEST_CASE').slice().sort((a,b)=>b.amount-a.amount).slice(0,3);
      return `Top Value: ${tv.map(d => `${d.account_name}/${d.deal_name} ${formatCurrency(d.amount)}`).join(", ") || "—"}`;
    }
    if (l.includes("coaching")) {
      const reps = Array.from(new Set(currentWindowDeals.filter(d => d.need_coaching || (Array.isArray(d.help_needed) && d.help_needed.length>0)).map(d => d.owner_name)));
      return `Reps needing coaching: ${reps.join(", ") || "—"}`;
    }
    if (l.includes("hygiene") || l.includes("gap")) {
      const gaps = currentWindowDeals.filter(isHygieneGap).slice(0,3);
      return `Hygiene gaps: ${gaps.map(d => `${d.account_name}/${d.deal_name}`).join(", ") || "—"}`;
    }
    if (l.includes("slippage")) {
      const slips = currentWindowDeals.filter(d => Array.isArray(d.risk_reasons) && d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).slice(0,3);
      return `Slippage risk: ${slips.map(d => `${d.account_name}/${d.deal_name}`).join(", ") || "—"}`;
    }
    return "I can help summarize Top Risk, Top Value, hygiene gaps, slippage, and coaching priorities for this period.";
  };
  return (
    <div className="flex flex-col min-h-0 h-full bg-white">
      <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarGutter: 'stable both-edges' }}>
        <div className="sticky top-0 z-20 bg-white">
          <PageHeader title="Coaching Dashboard" subtitle={headerSubtitle} titleClassName="text-2xl font-bold text-gray-900" inlineChildren>
            <div className="flex items-center w-full justify-end gap-8">
              <div className="flex items-center gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-56 h-8 text-xs bg-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-foreground" value="This week">This Week</SelectItem>
                    <SelectItem className="text-xs hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-foreground" value="This month">This Month</SelectItem>
                    <SelectItem className="text-xs hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-foreground" value="This quarter">This Quarter</SelectItem>
                    <SelectItem className="text-xs hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-foreground" value="This year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AskSamPopup
                questions={askSamQuestions}
                onGenerateAnswer={askSamAnswer}
                triggerLabel="Ask Sam"
                buttonClassName="gap-2 bg-white text-[#FF8E1C] border border-[#FF8E1C] hover:bg-[#FF8E1C] hover:text-white"
                mode="sheet"
                sheetSide="right"
                description="Ask about risky deals, value, hygiene gaps, or coaching priorities"
              />
            </div>
          </PageHeader>
        </div>
      

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 px-6 py-4">
        <KPICard
          label={targetLabel}
          value={formatCurrency(targetAmount)}
          valueIcon={Target}
          valueIconColor="#605BFF"
          trend="flat"
          trendLabel={trendTextSame}
        />
        <KPICard
          label="Pipeline Forecast"
          value={formatCurrency(commitCurrent)}
           valueIcon={ChartNoAxesCombined}
           valueIconColor="#605BFF"
          noteSegments={[
            { text: `coverage ${coverageX.toFixed(1)}x`, tone: coverageTone },
            { text: ' · ', tone: 'muted' },
            { text: `gap to close ${formatCurrency(gapToClose)}`, tone: gapTone },
          ]}
        />
        <KPICard
          label="Top Risk"
          value={formatCurrency(atRiskAmtCurrent)}
          valueIcon={AlertTriangle}
          valueIconColor="#DC2626"
          secondaryValue={`${atRiskCountCurrent} deals`}
          trend={atRiskDeltaAmt === 0 ? 'flat' : atRiskDeltaAmt > 0 ? 'up' : 'down'}
          trendLabel={atRiskDeltaAmt === 0 ? trendTextSame : `${formatDeltaCurrency(atRiskDeltaAmt)} vs last ${unitLabel}`}
          trendPositive={atRiskDeltaAmt < 0}
          onClick={() => goToPriorityDeals('risk')}
        />
        <KPICard
          label="Top Deals"
          value={formatCurrency(topDealsAmtCurrent)}
          valueIcon={Star}
          valueIconColor="#605BFF"
          secondaryValue={`${topDealsCountCurrent} deals`}
          trend={topDealsDeltaAmt === 0 ? 'flat' : topDealsDeltaAmt > 0 ? 'up' : 'down'}
          trendLabel={topDealsDeltaAmt === 0 ? trendTextSame : `${formatDeltaCurrency(topDealsDeltaAmt)} vs last ${unitLabel}`}
          trendPositive={topDealsDeltaAmt > 0}
          onClick={() => goToPriorityDeals('value')}
        />
        <KPICard
          label="Completed Sessions"
          value={`${completedCoachingReps.length}`}
          valueIcon={BookOpen}
          valueIconColor="#16A34A"
          note={completedNoteShort}
        />
        <KPICard
          label="Upcoming Sessions"
          value={`${upcomingCoachingReps.length}`}
          valueIcon={BookOpen}
          valueIconColor="#FF8E1C"
          note={upcomingNote}
          onNoteClick={() => navigate('/manager-prep')}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 sm:px-6 pb-6">
        <div className="rounded-lg border border-border bg-card p-4" id="priority-deals-section" ref={priorityDealsRef}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-foreground">Critical Deals</div>
              <div className="text-xs text-muted-foreground">Coaching and forecast priorities</div>
            </div>
            <div className="flex items-center gap-2">
              <span
                role="button"
                className={`px-3 py-1 rounded-full text-[12px] font-semibold cursor-pointer ${riskSelected ? 'bg-status-red/10 text-status-red' : 'bg-secondary/50 text-muted-foreground'}`}
                onClick={() => setRiskSelected(!riskSelected)}
                title="Filter Top Risk Deals"
              >
                Top Risk Deals
              </span>
              <span
                role="button"
                className={`px-3 py-1 rounded-full text-[12px] font-semibold cursor-pointer ${valueSelected ? 'bg-[#605BFF]/10 text-[#605BFF]' : 'bg-secondary/50 text-muted-foreground'}`}
                onClick={() => setValueSelected(!valueSelected)}
                title="Filter Top Value Deals"
              >
                Top Value Deals
              </span>
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <button type="button" className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-gray-100" title="Filter">
                    <Filter className="h-4 w-4 text-[#FF8E1C]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3">
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="text-xs text-muted-foreground col-span-1">Company</div>
                      <div className="col-span-2">
                        <Select value={companyFilter} onValueChange={setCompanyFilter}>
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder="Company" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Companies</SelectItem>
                            {Array.from(new Set(currentWindowDeals.map(d => d.account_name))).sort().map(n => (
                              <SelectItem key={n} value={n}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="text-xs text-muted-foreground col-span-1">Rep</div>
                      <div className="col-span-2">
                        <Select value={repFilter} onValueChange={setRepFilter}>
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder="Rep" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Reps</SelectItem>
                            {Array.from(new Set(currentWindowDeals.map(d => d.owner_name))).sort().map(r => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="text-xs text-muted-foreground col-span-1">Deal Stage</div>
                      <div className="col-span-2">
                        <Select value={stageFilter} onValueChange={setStageFilter}>
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder="Deal Stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Stages</SelectItem>
                            {Array.from(new Set(currentWindowDeals.map(d => d.stage_name))).sort().map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="text-xs text-muted-foreground col-span-1">Priority</div>
                      <div className="col-span-2">
                        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as 'all'|'P1'|'P2'|'P3')}>
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="P1">P1</SelectItem>
                            <SelectItem value="P2">P2</SelectItem>
                            <SelectItem value="P3">P3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="text-xs text-muted-foreground col-span-1">Min Amount</div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={amountMin}
                          onChange={(e) => setAmountMin(e.target.value)}
                          className="h-8 text-xs bg-white"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="text-xs text-muted-foreground col-span-1">Max Amount</div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={amountMax}
                          onChange={(e) => setAmountMax(e.target.value)}
                          className="h-8 text-xs bg-white"
                          placeholder="1000000"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setCompanyFilter('all');
                          setRepFilter('all');
                          setStageFilter('all');
                          setPriorityFilter('all');
                          setAmountMin('');
                          setAmountMax('');
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
                    className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-gray-100"
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
              <button
                type="button"
                className={`h-8 w-8 inline-flex items-center justify-center rounded hover:bg-gray-100 ${!riskSelected && !valueSelected && companyFilter==='all' && repFilter==='all' && stageFilter==='all' && priorityFilter==='all' && !amountMin && !amountMax ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  setRiskSelected(false);
                  setValueSelected(false);
                  setCompanyFilter('all');
                  setRepFilter('all');
                  setStageFilter('all');
                  setPriorityFilter('all');
                  setAmountMin('');
                  setAmountMax('');
                }}
                title="Clear filter"
              >
                <Eraser className="h-4 w-4 text-muted-foreground" />
              </button>
              {/* Removed deals count & stake badge per request */}
            </div>
          </div>
          <div className="rounded overflow-x-auto">
            {(() => {
              const topValue = currentWindowDeals
                .filter(d => d.forecast_category === 'COMMIT' || d.forecast_category === 'BEST_CASE')
                .slice()
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 10);
              const riskSet = new Set(topRiskAlerts.map(d => d.deal_id));
              const valueSet = new Set(topValue.map(d => d.deal_id));
              let rows = currentWindowDeals.slice();
              if (riskSelected || valueSelected) {
                rows = rows.filter(d => (riskSelected && riskSet.has(d.deal_id)) || (valueSelected && valueSet.has(d.deal_id)));
              }
              if (companyFilter !== 'all') rows = rows.filter(d => d.account_name === companyFilter);
              if (repFilter !== 'all') rows = rows.filter(d => d.owner_name === repFilter);
              if (stageFilter !== 'all') rows = rows.filter(d => d.stage_name === stageFilter);
              if (priorityFilter !== 'all') rows = rows.filter(d => priorityOf(d) === priorityFilter);
              const min = amountMin ? Number(amountMin) : undefined;
              const max = amountMax ? Number(amountMax) : undefined;
              if (typeof min === 'number' && !Number.isNaN(min)) rows = rows.filter(d => d.amount >= min);
              if (typeof max === 'number' && !Number.isNaN(max)) rows = rows.filter(d => d.amount <= max);
              if (sortBy === 'amount') {
                rows.sort((a, b) => b.amount - a.amount);
              } else if (sortBy === 'close_date') {
                rows.sort((a, b) => new Date(a.close_date).getTime() - new Date(b.close_date).getTime());
              } else {
                rows.sort((a, b) => {
                  const ar = riskSet.has(a.deal_id) ? 1 : 0;
                  const br = riskSet.has(b.deal_id) ? 1 : 0;
                  if (ar !== br) return br - ar;
                  return b.amount - a.amount;
                });
              }
              const stake = rows.reduce((s, d) => s + d.amount, 0);
              return (
                <div className="space-y-2">
                  {rows.map(d => {
                    const dtc = daysTo(d.close_date);
                    const isRisk = riskSet.has(d.deal_id);
                    const isValue = valueSet.has(d.deal_id);
                    return (
                      <div
                        key={d.deal_id}
                        className="border border-border rounded-lg bg-card p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => openDeal(d)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">{d.deal_name}</div>
                              {d.isInLoop && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-gray-100" title="In Pulse loop">
                                      <BookOpen className="h-4 w-4 text-[#FF8E1C]" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>In Pulse loop</TooltipContent>
                                </Tooltip>
                              )}
                              {isRisk && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-gray-100" title="Top Risk">
                                      <AlertTriangle className="h-4 w-4 text-status-red" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>Top Risk</TooltipContent>
                                </Tooltip>
                              )}
                              {isValue && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-gray-100" title="Top Value">
                                      <Star className="h-4 w-4 text-[#605BFF]" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>Top Value</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground truncate">
                              {d.stage_name} · {d.owner_name} · {dtc >= 0 ? `${dtc}d to close` : `${Math.abs(dtc)}d overdue`}
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-2 self-center">
                            <div className="text-sm font-semibold text-foreground whitespace-nowrap">{formatCurrency(d.amount)}</div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                                d.risk_level === 'RED'
                                  ? 'bg-status-red/10 text-status-red'
                                  : d.risk_level === 'AMBER'
                                  ? 'bg-status-amber/10 text-status-amber'
                                  : 'bg-status-green/10 text-status-green'
                              }`}
                            >
                              {d.risk_level === 'RED' ? 'High' : d.risk_level === 'AMBER' ? 'Medium' : 'Low'}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(() => {
                    const topValueCnt = currentWindowDeals.filter(d => d.forecast_category === 'COMMIT' || d.forecast_category === 'BEST_CASE').length;
                    if (topRiskAlerts.length === 0 && topValueCnt === 0) {
                      return (
                        <div className="px-4 py-6 text-center text-muted-foreground border border-dashed rounded-md">No priority deals this period.</div>
                      );
                    }
                    return null;
                  })()}
                </div>
              );
            })()}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            {(() => {
              const totalMinutes = agendaItems.filter(i => i.included).reduce((s, i) => s + i.minutes, 0);
              const hours = totalMinutes / 60;
              const rounded = Math.round(hours * 2) / 2;
              const period = timeRange === 'This week' ? "This Week's" : timeRange === 'This month' ? "This Month's" : timeRange === 'This quarter' ? "This Quarter's" : "This Year's";
              return (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{period} Coaching Agenda</div>
                      <div className="text-xs text-muted-foreground">AI-prioritized actions based on deal health and rep signals</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[#605BFF] hover:bg-muted"
                        onClick={() => setAgendaAdjustOpen(true)}
                      >
                        Adjust
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs bg-[#605BFF] hover:bg-[#4F48E3]"
                        onClick={startOrResumePulse}
                      >
                        {pulseStarted ? 'Resume Pulse Loop' : 'Start Pulse Loop'}
                      </Button>
                    </div>
                  </div>
                  <div className="mb-3 grid grid-cols-1 sm:grid-cols-3">
                    {(() => {
                      const focusCount = topRiskAlerts.length;
                      const coachRepsCount = Array.from(new Set(currentWindowDeals.filter(d => d.need_coaching || (Array.isArray(d.help_needed) && d.help_needed.length > 0)).map(d => d.owner_name))).length;
                      const noiseCount = currentWindowDeals.filter(d => d.forecast_category === 'PIPELINE' && d.amount < 100000).length;
                      return (
                        <>
                          <div className="flex items-center gap-1 sm:gap-1 md:gap-2 rounded-lg bg-white px-2 sm:px-2 md:px-3 py-2">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-status-red/10 text-status-red whitespace-nowrap">Focus</span>
                            <span className="text-[11px] sm:text-xs text-foreground">{focusCount} deals need intervention</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1 md:gap-2 rounded-lg bg-white px-2 sm:px-2 md:px-3 py-2">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#605BFF]/10 text-[#605BFF] whitespace-nowrap">Coach</span>
                            <span className="text-[11px] sm:text-xs text-foreground">{coachRepsCount} reps flagged for skill gaps</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1 md:gap-2 rounded-lg bg-white px-2 sm:px-2 md:px-3 py-2">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-status-amber/10 text-status-amber whitespace-nowrap">Deprioritize</span>
                            <span className="text-[11px] sm:text-xs text-foreground">{noiseCount} Low-value noise</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="relative">
                    {(() => {
                      const all = agendaItems.filter(i => i.included);
                      const beforeIds = new Set(['prep', 'uncover1', 'uncover2']);
                      const duringIds = new Set(['lead']);
                      const afterIds = new Set(['sync', 'eval']);
                      const groups: Array<{ label: string; items: typeof all }> = [
                        { label: 'Before coaching session', items: all.filter(i => beforeIds.has(i.id)) },
                        { label: 'During coaching session', items: all.filter(i => duringIds.has(i.id)) },
                        { label: 'After coaching session', items: all.filter(i => afterIds.has(i.id)) },
                      ];
                      const finished = pulseCompleted || (pulseStarted && pulseCurrentIdx >= all.length);
                      const colorBlue = 'bg-[#605BFF]';
                      const colorGreen = 'bg-status-green';
                      const colorGray = 'bg-muted/60';
                      const statusOf = (idx: number) => {
                        if (finished) return 'green';
                        if (!pulseStarted) return 'gray';
                        if (idx < pulseCurrentIdx) return 'green';
                        if (idx === pulseCurrentIdx) return 'blue';
                        return 'gray';
                      };
                      return (
                        <div className="space-y-4">
                          {groups.map((g, gi) => (
                            <div key={gi}>
                              <div className="pl-6 text-[11px] uppercase tracking-wider text-muted-foreground mb-2">{g.label}</div>
                              <div className="space-y-3">
                                {g.items.map((i, idx) => {
                                  const idxGlobal = all.findIndex(x => x.id === i.id);
                                  const isFirstGlobal = idxGlobal === 0;
                                  const isLastGlobal = idxGlobal === all.length - 1;
                                  const s = statusOf(idxGlobal);
                                  const dotClass =
                                    s === 'green' ? 'bg-status-green' :
                                    s === 'blue' ? 'bg-[#605BFF]' :
                                    'bg-muted-foreground/40';
                                  let topLineClass = '';
                                  if (!isFirstGlobal) {
                                    const prevIdxGlobal = idxGlobal - 1;
                                    const ps = statusOf(prevIdxGlobal);
                                    if (ps !== 'gray' && s !== 'gray') {
                                      topLineClass = ps === 'green' && s === 'green' ? colorGreen : colorBlue;
                                    } else {
                                      topLineClass = colorGray;
                                    }
                                  }
                                  let bottomLineClass = '';
                                  if (!isLastGlobal) {
                                    const nextIdxGlobal = idxGlobal + 1;
                                    const ns = statusOf(nextIdxGlobal);
                                    if (s !== 'gray' && ns !== 'gray') {
                                      bottomLineClass = s === 'green' && ns === 'green' ? colorGreen : colorBlue;
                                    } else {
                                      bottomLineClass = colorGray;
                                    }
                                  }
                                  return (
                                    <div
                                      key={i.id}
                                      ref={(el) => { stepRefs.current[i.id] = el }}
                                      className="pl-10 cursor-pointer"
                                      onClick={() => { 
                                        setPulseStarted(true); 
                                        setPulseCurrentIdx(idxGlobal); 
                                        localStorage.setItem('pulse.started', 'true');
                                        localStorage.setItem('pulse.currentIdx', String(idxGlobal));
                                        localStorage.setItem('pulse.completed', 'false');
                                        const path = stepIdToRoute(i.id);
                                        if (path) navigate(path);
                                      }}
                                    >
                                      <div className="relative">
                                        {!isFirstGlobal && <div className={`absolute left-[-20px] top-[-12px] bottom-1/2 w-0.5 ${topLineClass}`} />}
                                        {!isLastGlobal && <div className={`absolute left-[-20px] top-1/2 bottom-[-12px] w-0.5 ${bottomLineClass}`} />}
                                        <div className={`absolute left-[-20px] top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full ring-2 ring-background ${dotClass}`} />
                                        <div className="text-[11px] text-muted-foreground">{i.time} — {i.minutes} min</div>
                                        <div className="text-sm font-medium text-foreground">{i.id === 'uncover1' ? `Review ${flaggedCallsCur} flagged calls at 2x speed` : i.title}</div>
                                        <div className="text-[11px] text-muted-foreground">{i.id === 'prep' ? `${assessmentsSubmittedCur}/${coachingEligibleCur.length} assessments received · ${topRiskAlerts.length} CRM alerts flagged` : i.sub}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </>
              );
            })()}
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Rep Tiering {tieringHeaderRange}</h2>
                <div className="text-xs text-muted-foreground">AI-suggested based on Risk signals + self-assessments</div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-[#605BFF] hover:bg-muted" onClick={() => setTierAdjustOpen(true)}>Adjust</Button>
            </div>
            {(() => {
              const severityOf = (rep: (typeof mockAEReps)[number]) => {
                const ds = currentWindowDeals.filter(d => d.owner_name === rep.name);
                const needHelp = ds.some(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED');
                if (needHelp || rep.hygiene_score < 75 || rep.slippage_count >= 2 || rep.overdue_actions >= 2) return 'atRisk' as const;
                if (rep.hygiene_score < 85 || rep.slippage_count >= 1 || rep.overdue_actions >= 1) return 'watch' as const;
                return 'onTrack' as const;
              };
              const rank = (tag: 'atRisk' | 'watch' | 'onTrack') => tag === 'atRisk' ? 0 : tag === 'watch' ? 1 : 2;
              const sorted = mockAEReps.slice().sort((a, b) => {
                const ra = rank(severityOf(a));
                const rb = rank(severityOf(b));
                if (ra !== rb) return ra - rb;
                if (a.hygiene_score !== b.hygiene_score) return a.hygiene_score - b.hygiene_score;
                if (a.slippage_count !== b.slippage_count) return b.slippage_count - a.slippage_count;
                return a.name.localeCompare(b.name);
              });
              return (
                <div className="grid grid-cols-1 gap-3">
                  {sorted.map(rep => {
                    const ready = rep.hygiene_score >= 80 && rep.overdue_actions === 0;
                    const tag = severityOf(rep);
                    const tagCls = tag === 'atRisk' ? 'bg-status-red/10 text-status-red' : tag === 'watch' ? 'bg-status-amber/10 text-status-amber' : 'bg-status-green/10 text-status-green';
                    const tagLabel = tag === 'atRisk' ? 'At Risk' : tag === 'watch' ? 'Watch' : 'On Track';
                    return (
                      <div key={rep.user_id} className="rounded-lg bg-muted/40 p-3 flex items-start justify-between cursor-pointer hover:bg-[#605BFF]/10 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-full border flex items-center justify-center text-xs font-semibold">{getInitials(rep.name)}</div>
                          <div>
                            <div
                              className="text-sm font-semibold text-foreground hover:text-[#605BFF] cursor-pointer"
                              onClick={() => {
                                if (!ready) navigate(`/manager-prep?repId=${rep.user_id}`);
                              }}
                            >
                              {rep.name}
                            </div>
                            <div className="mt-1 text-[11px] text-muted-foreground">{buildDetails(rep)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-center"
                          onDoubleClick={() => {
                            if (!ready) navigate(`/manager-prep?repId=${rep.user_id}`);
                          }}
                        >
                          <button
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ready ? 'bg-status-green/10 text-status-green' : 'bg-secondary/50 text-muted-foreground'} hover:opacity-80`}
                            onClick={() => {
                              if (ready) return;
                              setNudgeTarget({ repId: rep.user_id, name: rep.name });
                            }}
                          >
                            {ready ? 'ready' : 'pending'}
                          </button>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tagCls}`}>{tagLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      <Dialog open={!!nudgeTarget} onOpenChange={(open) => setNudgeTarget(open ? nudgeTarget : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send nudge remaining?</DialogTitle>
          </DialogHeader>
          <div className="px-1 pb-0 text-sm text-muted-foreground">
            {nudgeTarget?.name ? `Send a nudge to ${nudgeTarget.name} to complete remaining items?` : 'Send a nudge to complete remaining items?'}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs hover:bg-muted hover:text-muted-foreground"
              onClick={() => setNudgeTarget(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={() => {
                if (nudgeTarget) {
                  showSuccess(`Nudge sent to ${nudgeTarget.name}`);
                }
                setNudgeTarget(null);
              }}
            >
              Send nudge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={agendaAdjustOpen} onOpenChange={setAgendaAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Coaching Agenda</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {agendaItems.map((i, idx) => (
              <div key={i.id} className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={i.included}
                    onChange={(e) => {
                      const next = [...agendaItems];
                      next[idx] = { ...i, included: e.target.checked };
                      setAgendaItems(next);
                    }}
                  />
                  <span className="text-foreground">{i.time}</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Minutes</span>
                  <input
                    type="number"
                    min={0}
                    className="h-8 w-20 px-2 border rounded bg-background"
                    value={i.minutes}
                    onChange={(e) => {
                      const v = Number(e.target.value) || 0;
                      const next = [...agendaItems];
                      next[idx] = { ...i, minutes: v };
                      setAgendaItems(next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted hover:text-muted-foreground" onClick={() => setAgendaAdjustOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={tierAdjustOpen} onOpenChange={setTierAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Rep Tiering</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {mockAEReps.map(rep => (
              <div key={rep.user_id} className="flex items-center justify-between gap-3">
                <span className="text-foreground">{rep.name}</span>
                <Select
                  value={(tierOverrides[rep.user_id] ?? classifyRep(rep)) as 'sync' | 'async' | 'stretch'}
                  onValueChange={(val) => setTierOverrides(prev => ({ ...prev, [rep.user_id]: val as 'sync' | 'async' | 'stretch' }))}
                >
                  <SelectTrigger className="w-52 h-8 text-xs bg-white">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sync" className="text-xs hover:bg-gray-100">Sync 1:1 (Priority)</SelectItem>
                    <SelectItem value="async" className="text-xs hover:bg-gray-100">Async Only (On Track)</SelectItem>
                    <SelectItem value="stretch" className="text-xs hover:bg-gray-100">Stretch Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted hover:text-muted-foreground" onClick={() => setTierAdjustOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!kpiDialog} onOpenChange={(open) => setKpiDialog(open ? kpiDialog : null)}>
        <DialogContent className={kpiDialog?.size === 'large' ? 'max-w-[95vw] w-[95vw] h-[85vh] flex flex-col' : undefined}>
          <DialogHeader className={kpiDialog?.size === 'large' ? 'shrink-0 px-4 py-3' : undefined}>
            <div className="flex items-center gap-10">
              <DialogTitle>{kpiDialog?.label} — Details</DialogTitle>
              {kpiDialog?.headerRight}
            </div>
          </DialogHeader>
          {kpiDialog?.size === 'large' ? (
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {kpiDialog?.content}
            </div>
          ) : (
            kpiDialog?.content
          )}
          <DialogFooter className={kpiDialog?.size === 'large' ? 'shrink-0 px-4 py-3' : undefined}>
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted hover:text-muted-foreground" onClick={() => setKpiDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Sheet open={dealSheetOpen} onOpenChange={setDealSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-[90vw] p-0 flex flex-col [&>button]:hidden">
          <SheetHdr className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTtl>{selectedDeal ? `${selectedDeal.account_name} / ${selectedDeal.deal_name}` : ''}</SheetTtl>
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
                    {selectedDeal.risk_level}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                      if (topRiskAlerts.some(a => a.deal_id === selectedDeal.deal_id)) cs.push({ label: 'Top Risk', cls: 'bg-status-red/10 text-status-red' });
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
                  {getInitials(selectedDeal.owner_name)}
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
              <div className={`mt-auto ${selectedDeal.isInLoop ? 'text-status-green' : 'text-muted-foreground'} text-sm`}>
                {selectedDeal.isInLoop ? 'This deal is in your Pulse loop' : 'This deal is not in your Pulse loop'}
              </div>
            </div>
          )}
          <SheetFtr className="px-6 py-3 border-t justify-start sm:justify-start gap-2">
            {selectedDeal && (
              <>
                <Button className="bg-[#605BFF] hover:bg-[#4F48E3]" size="sm" onClick={() => navigate('/leader-uncover')}>Uncover this deal</Button>
                <Button variant="outline" size="sm" onClick={() => toggleLoopAdd(selectedDeal)}>
                  {selectedDeal.isInLoop ? 'Remove from loop' : 'Add to loop'}
                </Button>
              </>
            )}
          </SheetFtr>
        </SheetContent>
      </Sheet>
      <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <AlertContent>
          <AlertHdr>
            <AlertDialogTitle>Remove from Pulse loop?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemoveDeal ? `This will remove ${pendingRemoveDeal.account_name} / ${pendingRemoveDeal.deal_name} from your Pulse loop.` : ''}
            </AlertDialogDescription>
          </AlertHdr>
          <DialogFooter className="pt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>Remove</AlertDialogAction>
          </DialogFooter>
        </AlertContent>
      </AlertDialog>

      
    </div>
    </div>
  );
}

export default function ManagerView() {
  return (
    <KpiContentBoundary>
      <ManagerViewContent />
    </KpiContentBoundary>
  );
}
