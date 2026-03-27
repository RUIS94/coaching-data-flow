import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { mockAEReps, mockDeals, formatCurrency } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { MoreVertical, Mic, MicOff, Wand2, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useMemo } from "react";
import { useToastContext } from "@/contexts/ToastContext";
import SalesMethodologyCard from "@/components/Modules/SalesMethodologyCard";
import BuyerJourneyCard from "@/components/Modules/BuyerJourneyCard";
import BuyerObjectionsCard from "@/components/Modules/BuyerObjectionsCard";
import BuyerQuestionsCard from "@/components/Modules/BuyerQuestionsCard";
import PulseFlow from "@/components/dashboard/PulseFlow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ManagerPrep() {
  const reps = mockAEReps.slice(0, 6);
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
  const eligibleDeals = useMemo(() => repDeals.filter(d => d.need_coaching), [repDeals]);
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

  return (
    <div className="h-full bg-white overflow-auto" style={{ scrollbarGutter: 'stable both-edges' }}>
      <div className="sticky top-0 z-20 bg-white">
        <PageHeader
          title="P — Prepare"
          subtitle="Snapshot of top-value and top-risk deals to coach — ~30 min"
          titleClassName="text-2xl font-bold text-gray-900"
          inlineChildren
        >
          <div className="flex items-center w-full justify-end gap-8">
            <div className="flex items-center gap-3">
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
            </div>
            <div className="flex-shrink-0">
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
            </div>
          </div>
        </PageHeader>
      </div>

      <div className="px-6 pb-6 space-y-4">
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

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
            <div className="text-sm font-semibold text-foreground">Deals Ready for Coaching - Self-Assessment Completed</div>
          </div>
          <div className="rounded overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground bg-secondary/40">
                  <th className="text-left px-4 py-2 font-medium">Rep</th>
                  <th className="text-left px-3 py-2 font-medium">Deal</th>
                  <th className="text-left px-3 py-2 font-medium">Close Date</th>
                  <th className="text-left px-3 py-2 font-medium">Risk</th>
                  <th className="text-left px-3 py-2 font-medium">Help Needed</th>
                  <th className="text-left px-3 py-2 font-medium">Forecast Category</th>
                  <th className="text-left px-3 py-2 font-medium">Confidence</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="text-left px-3 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {reps.map((rep) => {
                  const top = getTopDealFor(rep.name);
                  const helpTags = helpNeededTagsFor(rep.name);
                  const eligible = repEligible(rep.name);
                  const hasPending = repHasPending(rep.name);
                  const fullySubmitted = repFullySubmitted(rep.name);
                  const coachingDealsAll = mockDeals.filter(d => d.owner_name === rep.name && d.need_coaching);
                  const primaryDeal = coachingDealsAll[0] || top || null;
                  const coachingDeals = coachingDealsAll.slice(coachingDealsAll.length > 0 ? 1 : 0, 3);
                  return (
                    <>
                      <tr key={rep.user_id} className="border-t border-border hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900">{rep.name}</span>
                        </td>
                        {eligible ? (
                          hasPending ? (
                            <>
                              <td className="py-3 px-4 italic text-muted-foreground" colSpan={6}>
                                Not yet submitted — auto-nudge sent 15 min ago
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary/50 text-muted-foreground">Pending</span>
                              </td>
                              <td className="py-3 px-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="p-1 rounded hover:bg-gray-100">
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
                                    <DropdownMenuItem onClick={() => openNudge(rep.name)}>Nudge remaining</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </>
                          ) : fullySubmitted ? (
                            <>
                              <td className="py-3 px-4">
                                {primaryDeal ? (
                                  <div>
                                    <div className="text-foreground">{primaryDeal.account_name} - {primaryDeal.deal_name}</div>
                                    <div className="text-[11px] text-muted-foreground">{formatCurrency(primaryDeal.amount)} · {primaryDeal.stage_name}</div>
                                  </div>
                                ) : '—'}
                              </td>
                              <td className="py-3 px-4">{formatCloseDate(primaryDeal?.close_date ?? null)}</td>
                              <td className="py-3 px-4">
                                {primaryDeal && Array.isArray(primaryDeal.risk_reasons) && primaryDeal.risk_reasons.length > 0
                                  ? prettyRiskCode(primaryDeal.risk_reasons[0].code)
                                  : '—'}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {helpTags.length > 0 ? helpTags.map((t) => (
                                    <span key={t} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#605BFF]/10 text-[#605BFF]">{t}</span>
                                  )) : <span className="text-muted-foreground text-xs">—</span>}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {primaryDeal ? (
                                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${forecastTagClass(primaryDeal.forecast_category)}`}>
                                    {prettyForecast(primaryDeal.forecast_category)}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="py-3 px-4">{confidenceFor(rep.hygiene_score)}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-status-green/10 text-status-green">Submitted</span>
                              </td>
                              <td className="py-3 px-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="p-1 rounded hover:bg-gray-100">
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
                                    <DropdownMenuItem onClick={() => openNudge(rep.name)}>Update Request</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 px-4 italic text-muted-foreground" colSpan={6}>
                                Pending self-assessment — awaiting submission
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary/50 text-muted-foreground">Pending</span>
                              </td>
                              <td className="py-3 px-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="p-1 rounded hover:bg-gray-100">
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
                                    <DropdownMenuItem onClick={() => openNudge(rep.name)}>Nudge remaining</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </>
                          )
                        ) : (
                          <>
                            <td className="py-3 px-4 italic text-muted-foreground" colSpan={6}>
                              No self-assessment requested this period
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted/50 text-muted-foreground">—</span>
                            </td>
                            <td className="py-3 px-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 rounded hover:bg-gray-100">
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate("/leader-lead")}>Review</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </>
                        )}
                      </tr>
                      {coachingDeals.map(cd => (
                        <tr key={`${rep.user_id}-${cd.deal_id}`} className="border-t border-border bg-secondary/20">
                          <td className="py-2 px-4"></td>
                          <td className="py-2 px-4">
                            <div className="text-foreground">{cd.account_name} - {cd.deal_name}</div>
                            <div className="text-[11px] text-muted-foreground">{formatCurrency(cd.amount)} · {cd.stage_name}</div>
                          </td>
                          <td className="py-2 px-4">{formatCloseDate(cd.close_date)}</td>
                          <td className="py-2 px-4">
                            {Array.isArray(cd.risk_reasons) && cd.risk_reasons.length > 0 ? prettyRiskCode(cd.risk_reasons[0].code) : '—'}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(cd.help_needed) && cd.help_needed.length > 0
                                ? cd.help_needed.slice(0, 3).map(t => (
                                    <span key={t} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#605BFF]/10 text-[#605BFF]">{t}</span>
                                  ))
                                : <span className="text-muted-foreground text-xs">—</span>}
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${forecastTagClass(cd.forecast_category)}`}>{prettyForecast(cd.forecast_category)}</span>
                          </td>
                          <td className="py-2 px-4">—</td>
                          <td className="py-2 px-4">
                            {cd.self_assessment_status === 'SUBMITTED' ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-status-green/10 text-status-green">Submitted</span>
                            ) : (cd.self_assessment_status === 'PENDING' || cd.self_assessment_status === 'TODO') ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary/50 text-muted-foreground">Pending</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary/50 text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 rounded hover:bg-gray-100">
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setModulesRep(`${cd.account_name} - ${cd.deal_name}`);
                                    setModulesOpen(true);
                                  }}
                                >
                                  Review
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openNudge(rep.name)}>Coaching</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openNudge(rep.name)}>Update Request</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </>
                  );
                })}
              </tbody>
            </table>
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
