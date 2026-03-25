import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Play, FileDown, AlertCircle, AlertTriangle, CheckCircle, Eye, ChevronLeft, ChevronRight, Filter, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { DealRow } from "@/components/CommonComponents/DealRow";
import { StatusDot } from "@/components/CommonComponents/StatusDot";
import { mockDeals, mockAEReps, mockCalls, formatCurrency, type Deal, type RiskReason } from "@/data/mock";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import SalesMethodologyCard from "@/components/Modules/SalesMethodologyCard";
import PulseFlow from "@/components/dashboard/PulseFlow";
import BuyerJourneyCard from "@/components/Modules/BuyerJourneyCard";
import BuyerObjectionsCard from "@/components/Modules/BuyerObjectionsCard";
import BuyerQuestionsCard from "@/components/Modules/BuyerQuestionsCard";
import EmptyPopup from "@/components/CommonComponents/EmptyPopup";
import IndividualView from "@/pages/ManagerDashboard/IndividualView";
import { useToastContext } from "@/contexts/ToastContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [pinnedDealIds, setPinnedDealIds] = useState<string[]>([]);
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
              <div className="flex-shrink-0">
                <PulseFlow
                  compact
                  completeOnClick
                  initialActiveStep={null}
                  disableActiveHighlight
                  onNavigateToStep={(step) => {
                    if (step === 'prepare') {
                      navigate('/manager-prep');
                    }
                  }}
                />
              </div>
            </div>
          </PageHeader>
        </div>
      

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4">
        <KPICard
          label="Top Risk"
          value={formatCurrency(atRiskAmtCurrent)}
          secondaryValue={`${atRiskCountCurrent} deals`}
          trend={atRiskDeltaAmt === 0 ? 'flat' : atRiskDeltaAmt > 0 ? 'up' : 'down'}
          trendLabel={atRiskDeltaAmt === 0 ? trendTextSame : `${formatDeltaCurrency(atRiskDeltaAmt)} vs last ${unitLabel}`}
          trendPositive={atRiskDeltaAmt < 0}
        />
        <KPICard
          label="Top Deals"
          value={formatCurrency(topDealsAmtCurrent)}
          secondaryValue={`${topDealsCountCurrent} deals`}
          trend={topDealsDeltaAmt === 0 ? 'flat' : topDealsDeltaAmt > 0 ? 'up' : 'down'}
          trendLabel={topDealsDeltaAmt === 0 ? trendTextSame : `${formatDeltaCurrency(topDealsDeltaAmt)} vs last ${unitLabel}`}
          trendPositive={topDealsDeltaAmt > 0}
        />
        <KPICard
          label="Completed Coaching Sessions"
          value={`${completedCoachingReps.length}`}
        />
        <KPICard
          label="Upcoming Coaching Sessions"
          value={`${upcomingCoachingReps.length}`}
          note={upcomingNote}
          onNoteClick={() => navigate('/manager-prep')}
        />
      </div>

      {/* Coaching Agenda + AE Cards (First Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 sm:px-6 pb-4">
        {/* Coaching Agenda */}
        <div className="rounded-lg border border-border bg-card p-4 order-2 lg:order-2 lg:col-span-1">
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
                    <div className="text-xs text-muted-foreground">Auto-generated from PULSE inputs</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#605BFF]/10 text-[#605BFF]">~{rounded} hrs total</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#605BFF] hover:bg-muted"
                      onClick={() => setAgendaAdjustOpen(true)}
                    >
                      Adjust
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <div className="space-y-3">
                    {(() => {
                      const includedItems = agendaItems.filter(i => i.included);
                      let currentIdx = includedItems.findIndex(i => i.status === 'current');
                      if (currentIdx === -1) {
                        for (let k = includedItems.length - 1; k >= 0; k--) {
                          if (includedItems[k].status === 'done') { currentIdx = k; break; }
                        }
                      }
                      return includedItems.map((i, idx) => {
                      const dotClass = i.status === 'done' ? 'bg-status-green' : i.status === 'current' ? 'bg-[#605BFF]' : 'bg-muted-foreground/40';
                      const isFirst = idx === 0;
                      const isLast = idx === includedItems.length - 1;
                      const topLineClass = idx <= currentIdx ? 'bg-[#605BFF]' : 'bg-muted/60';
                      const bottomLineClass = idx < currentIdx ? 'bg-[#605BFF]' : 'bg-muted/60';
                      return (
                        <div key={i.id} className="pl-10">
                          <div className="relative">
                            {!isFirst && <div className={`absolute left-[-20px] top-[-12px] bottom-1/2 w-0.5 ${topLineClass}`} />}
                            {!isLast && <div className={`absolute left-[-20px] top-1/2 bottom-[-12px] w-0.5 ${bottomLineClass}`} />}
                            <div className={`absolute left-[-20px] top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full ring-2 ring-background ${dotClass}`} />
                            <div className="text-[11px] text-muted-foreground">{i.time} — {i.minutes} min</div>
                            <div className="text-sm font-medium text-foreground">{i.id === 'uncover1' ? `Review ${flaggedCallsCur} flagged calls at 2x speed` : i.title}</div>
                            <div className="text-[11px] text-muted-foreground">{i.id === 'prep' ? `${assessmentsSubmittedCur}/${coachingEligibleCur.length} assessments received · ${topRiskAlerts.length} CRM alerts flagged` : i.sub}</div>
                          </div>
                        </div>
                      );});
                    })()}
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* AE Cards */}
        <div className="rounded-lg border border-border bg-card p-4 order-1 lg:order-1 lg:col-span-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Rep Tiering {tieringHeaderRange}</h2>
              <div className="text-xs text-muted-foreground">AI-suggested based on Risk signals + self-assessments</div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-[#605BFF] hover:bg-muted" onClick={() => setTierAdjustOpen(true)}>Adjust</Button>
          </div>
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#605BFF] mb-2">SYNC 1:1 (Priority)</div>
              <div className="grid grid-cols-1 gap-3">
                {buckets.sync.map((rep) => {
                  const ds = currentWindowDeals.filter(d => d.owner_name === rep.name);
                  const ready = rep.hygiene_score >= 80 && rep.overdue_actions === 0;
                  const groupLabel = 'Sync';
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
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#605BFF]/10 text-[#605BFF]">{groupLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-status-green mb-2">ASYNC ONLY (On Track)</div>
              <div className="grid grid-cols-1 gap-3">
                {buckets.async.map((rep) => {
                  const ready = rep.hygiene_score >= 80 && rep.overdue_actions === 0;
                  const groupLabel = 'Asynchronous';
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
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-status-green/10 text-status-green">{groupLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#FF8E1C] mb-2">STRETCH ASSIGNMENT</div>
              <div className="grid grid-cols-1 gap-3">
                {buckets.stretch.map((rep) => {
                  const ready = rep.hygiene_score >= 80 && rep.overdue_actions === 0;
                  const groupLabel = 'Stretch';
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
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FF8E1C]/10 text-[#FF8E1C]">{groupLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 sm:px-6 pb-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-foreground">Top Risk Alerts</div>
              <div className="text-xs text-muted-foreground">Deals requiring coaching attention this week</div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="text-[#FF8E1C] hover:opacity-80">
                <Filter className="h-4 w-4" />
              </button>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-status-red/10 text-status-red">
                {topRiskAlerts.length} alerts
              </span>
            </div>
          </div>
          <div className="rounded overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground bg-secondary/40">
                  <th className="text-left px-4 py-2 font-medium" style={{ width: '26ch' }}>Deal</th>
                  <th className="text-left px-3 py-2 font-medium" style={{ width: '18ch' }}>Rep</th>
                  <th className="text-left px-3 py-2 font-medium" style={{ width: '12ch' }}>Amount</th>
                  <th className="text-left px-3 py-2 font-medium" style={{ width: '16ch' }}>Stage</th>
                  <th className="text-left px-3 py-2 font-medium" style={{ width: '28ch' }}>Risk Signal</th>
                  <th className="text-left px-3 py-2 font-medium" style={{ width: '14ch' }}>Days Stalled</th>
                  <th className="text-left px-3 py-2 font-medium" style={{ width: '10ch' }}>Priority</th>
                  <th className="text-left px-3 py-2 font-medium" style={{ width: '10ch' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {topRiskAlerts.map((d) => {
                  const signal = Array.isArray(d.risk_reasons) && d.risk_reasons.length > 0
                    ? ((d.risk_reasons[0]).label ?? String((d.risk_reasons[0]).code).replace(/[_-]/g, ' ').toLowerCase())
                    : 'Low activity';
                  const pr = priorityOf(d);
                  const prCls = pr === 'P1' ? 'bg-status-red/10 text-status-red' : pr === 'P2' ? 'bg-status-amber/10 text-status-amber' : 'bg-[#605BFF]/10 text-[#605BFF]';
                  return (
                    <tr key={d.deal_id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 align-top">
                        <div className="text-foreground font-medium">{d.account_name}</div>
                        <div className="text-[11px] text-muted-foreground">{d.deal_name}</div>
                      </td>
                      <td className="px-3 py-2 align-top">{d.owner_name}</td>
                      <td className="px-3 py-2 align-top text-left">{formatCurrency(d.amount)}</td>
                      <td className="px-3 py-2 align-top">{d.stage_name}</td>
                      <td className="px-3 py-2 align-top">
                        <span className={`inline-flex items-center justify-center text-center px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-normal break-words ${riskBadgeClass(d)}`}>{signal}</span>
                      </td>
                      <td className="px-3 py-2 align-top text-left">{typeof d.staleness_days === 'number' ? d.staleness_days : '—'}</td>
                      <td className="px-3 py-2 align-top">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${prCls}`}>{pr}</span>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-gray-100">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>review</DropdownMenuItem>
                            <DropdownMenuItem>coaching</DropdownMenuItem>
                            <DropdownMenuItem>update request</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {topRiskAlerts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">No risk alerts this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-foreground">Top Deals</div>
              <div className="text-xs text-muted-foreground">Commit + Best Case this period</div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="text-[#FF8E1C] hover:opacity-80">
                <Filter className="h-4 w-4" />
              </button>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#605BFF]/10 text-[#605BFF]">
                {currentWindowDeals.filter(d => d.forecast_category === 'COMMIT' || d.forecast_category === 'BEST_CASE').length} deals
              </span>
            </div>
          </div>
          <div className="rounded overflow-x-auto">
            {(() => {
              const rows = currentWindowDeals
                .filter(d => d.forecast_category === 'COMMIT' || d.forecast_category === 'BEST_CASE')
                .slice()
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 8);
              return (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground bg-secondary/40">
                      <th className="text-left px-4 py-2 font-medium" style={{ width: '26ch' }}>Deal</th>
                      <th className="text-left px-3 py-2 font-medium" style={{ width: '18ch' }}>Rep</th>
                      <th className="text-left px-3 py-2 font-medium" style={{ width: '12ch' }}>Amount</th>
                      <th className="text-left px-3 py-2 font-medium" style={{ width: '16ch' }}>Stage</th>
                      <th className="text-left px-3 py-2 font-medium" style={{ width: '16ch' }}>Forecast</th>
                      <th className="text-left px-3 py-2 font-medium" style={{ width: '26ch' }}>Next Step</th>
                      <th className="text-left px-3 py-2 font-medium" style={{ width: '10ch' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((d) => (
                      <tr key={d.deal_id} className="border-b border-border last:border-0">
                        <td className="px-4 py-2 align-top">
                          <div className="text-foreground font-medium">{d.account_name}</div>
                          <div className="text-[11px] text-muted-foreground">{d.deal_name}</div>
                        </td>
                        <td className="px-3 py-2 align-top">{d.owner_name}</td>
                        <td className="px-3 py-2 align-top text-left">{formatCurrency(d.amount)}</td>
                        <td className="px-3 py-2 align-top">{d.stage_name}</td>
                        <td className="px-3 py-2 align-top">
                          <span className="inline-flex items-center justify-center text-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary/40 text-muted-foreground whitespace-normal break-words">
                            {prettyForecast(d.forecast_category)}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top">
                          {d.next_step ? (
                            <span className={`inline-flex items-center justify-center text-center px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-normal break-words ${d.next_step.is_buyer_confirmed ? 'bg-status-green/10 text-status-green' : 'bg-secondary/50 text-muted-foreground'}`}>
                              {d.next_step.is_buyer_confirmed ? 'Buyer confirmed' : 'Not confirmed'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center text-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary/50 text-muted-foreground whitespace-normal break-words">No next step</span>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-gray-100">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="whitespace-nowrap">review</DropdownMenuItem>
                              <DropdownMenuItem className="whitespace-nowrap">coaching</DropdownMenuItem>
                              <DropdownMenuItem className="whitespace-nowrap">update request</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No top deals this period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      </div>
      </div>
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
