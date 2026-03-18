import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { mockAEReps, mockDeals, formatCurrency } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { MoreVertical, Mic, MicOff, Wand2, Send, Calendar as CalendarIcon } from "lucide-react";
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
    return "本周自评要点：需要EB支持；下一步未买方确认；希望获得多线推进建议。";
  };
  const extractFromText = (text: string) => {
    const points = text.split("；").map(s => s.trim()).filter(Boolean);
    const questions = [
      "这笔交易的EB是谁？如何触达？",
      "下一步是否买方确认？如何确保？",
      "还有哪些关键人需要多线推进？",
      "你认为最大的失单风险是什么？",
      "需要我提供哪些资源支持？"
    ];
    return { points, questions };
  };
  const openNudge = (repName: string) => {
    setNudgeRepName(repName);
    setNudgeOpen(true);
    const risk = riskLabelFor(repName);
    const help = helpNeededTagsFor(repName);
    const suggestions = [
      `围绕“${risk}”的缓解计划是什么？`,
      "请确认买方下一步与日期",
      "是否需要我协助引荐EB或关键人？",
      ...help.slice(0, 2).map(h => `关于“${h}”你目前的障碍是什么？`)
    ];
    setNudgeQuestions(suggestions);
    setSelectedQuestions(suggestions.slice(0, 3));
  };
  const sendNudge = () => {
    if (nudgeRepName) showSuccess(`已向 ${nudgeRepName} 发送提醒`);
    setNudgeOpen(false);
    setNudgeNotes("");
    setNudgeQuestions([]);
    setSelectedQuestions([]);
    setAudioBlob(null);
    setIsRecording(false);
  };
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleRep, setScheduleRep] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string; duration: number } | null>(null);
  const [scheduledMap, setScheduledMap] = useState<Record<string, string>>({});
  const genSlots = () => {
    const base = new Date();
    const days = [0, 1, 2].map(d => {
      const dt = new Date(base);
      dt.setDate(base.getDate() + d);
      return dt;
    });
    const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    const times = ["09:00", "09:30", "10:00", "14:00", "14:30", "15:00"];
    const durations = [15, 20];
    const slots: { date: string; time: string; duration: number }[] = [];
    days.forEach(d => {
      times.forEach(t => {
        durations.forEach(u => slots.push({ date: fmt(d), time: t, duration: u }));
      });
    });
    return slots;
  };
  const [slots] = useState(genSlots());
  const openSchedule = (repName: string) => {
    setScheduleRep(repName);
    setSelectedSlot(null);
    setScheduleOpen(true);
  };
  const confirmSchedule = () => {
    if (scheduleRep && selectedSlot) {
      const label = `${selectedSlot.date} ${selectedSlot.time} · ${selectedSlot.duration} min`;
      setScheduledMap(prev => ({ ...prev, [scheduleRep]: label }));
      showSuccess(`已为 ${scheduleRep} 安排 ${label}`);
      setScheduleOpen(false);
    }
  };

  return (
    <div className="h-full bg-white overflow-auto">
      <PageHeader
        title="P — Prepare"
        subtitle="Triage, self-assessment & prioritization — ~30 min Monday morning"
        titleClassName="text-2xl font-bold text-gray-900"
      />

      <div className="px-6 pb-6">
        <Tabs defaultValue="self" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="self">Self Assessments</TabsTrigger>
            <TabsTrigger value="agenda">Coaching Agenda</TabsTrigger>
          </TabsList>
          <TabsContent value="self" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <KPICard
                label="Assessments Received"
                value={`${assessmentsSubmittedCur}/${coachingEligibleLen}`}
                note={`Nudge sent to ${pendingRepNames.slice(0, 3).map(n => shortName(n)).join(", ")}${pendingRepNames.length > 3 ? ` +${pendingRepNames.length - 3}` : ""}`}
              />
              <KPICard
                label="Risk Alerts"
                value={`${riskCriticalDeals.length + riskWarningDeals.length + riskInfoDeals.length} deals`}
                note={`${riskCriticalDeals.length} critical · ${riskWarningDeals.length} warning · ${riskInfoDeals.length} info`}
              />
              <KPICard
                label="Avg Confidence Score"
                value={`${avgConfidence.toFixed(1)} / 10`}
                trend="flat"
                trendLabel="—"
                trendPositive={true}
              />
            </div>

            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
                <div className="text-sm font-semibold text-foreground">Rep Self-Assessments</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Rep</th>
                      <th className="py-3 px-4">Top Deal</th>
                      <th className="py-3 px-4">Biggest Risk</th>
                      <th className="py-3 px-4">Help Needed</th>
                      <th className="py-3 px-4">Commit</th>
                      <th className="py-3 px-4">Confidence</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reps.map((rep) => {
                      const top = getTopDealFor(rep.name);
                      const risk = riskLabelFor(rep.name);
                      const helpTags = helpNeededTagsFor(rep.name);
                      const eligible = repEligible(rep.name);
                      const hasPending = repHasPending(rep.name);
                      const fullySubmitted = repFullySubmitted(rep.name);
                      return (
                        <tr key={rep.user_id} className="border-t border-border hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900">{rep.name}</span>
                          </td>
                          {eligible ? (
                            hasPending ? (
                            <>
                              <td className="py-3 px-4 italic text-muted-foreground" colSpan={5}>
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
                                    <DropdownMenuItem onClick={() => navigate("/leader-lead")}>Review</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openNudge(rep.name)}>Nudge remaining</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </>
                            ) : fullySubmitted ? (
                            <>
                              <td className="py-3 px-4">{top ? `${top.account_name} (${formatCurrency(top.amount)})` : '—'}</td>
                              <td className="py-3 px-4">{risk}</td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {helpTags.length > 0 ? helpTags.map((t) => (
                                    <span key={t} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#605BFF]/10 text-[#605BFF]">{t}</span>
                                  )) : <span className="text-muted-foreground text-xs">—</span>}
                                </div>
                              </td>
                              <td className="py-3 px-4">{formatCurrency(rep.commit_amount)}</td>
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
                                    <DropdownMenuItem onClick={() => navigate("/leader-lead")}>Review</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openNudge(rep.name)}>Update Request</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </>
                            ) : (
                            <>
                              <td className="py-3 px-4 italic text-muted-foreground" colSpan={5}>
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
                                    <DropdownMenuItem onClick={() => navigate("/leader-lead")}>Review</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openNudge(rep.name)}>Nudge remaining</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </>
                            )
                          ) : (
                            <>
                              <td className="py-3 px-4 italic text-muted-foreground" colSpan={5}>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <Dialog open={nudgeOpen} onOpenChange={setNudgeOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{nudgeRepName ? `提醒 ${nudgeRepName}` : "提醒"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setNudgeQuestions(prev => prev.length ? prev : nudgeQuestions)}>
                      <Wand2 className="h-4 w-4 mr-1" />
                      AI生成问题
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => (isRecording ? stopRecording() : startRecording())}>
                      {isRecording ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                      {isRecording ? "停止录音" : "语音备注"}
                    </Button>
                    {audioBlob && <span className="text-xs text-muted-foreground">已录音</span>}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Notes</div>
                    <Textarea value={nudgeNotes} onChange={e => setNudgeNotes(e.target.value)} placeholder="填写提醒备注或要点" />
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
                    发送提醒
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
          <TabsContent value="agenda">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Showing agendas for reps with submitted self-assessments.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reps.filter(r => repFullySubmitted(r.name)).map((rep) => {
                  const top = getTopDealFor(rep.name);
                  const risk = riskLabelFor(rep.name);
                  return (
                    <div key={rep.user_id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-foreground">{rep.name}</div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-status-green/10 text-status-green">Submitted</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        Top deal: {top ? `${top.account_name} — ${formatCurrency(top.amount)}` : '—'} · Biggest risk: {risk}
                      </div>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                        <li>Review risk summary and mitigation plan</li>
                        <li>Align next step and target date{top?.next_step ? ` (${top.next_step.date})` : ''}</li>
                        <li>
                          Skill focus: { /Missing EB/i.test(risk) ? 'Executive alignment' : /Single Threaded/i.test(risk) ? 'Multi-threading stakeholders' : /No Next Step|Low Activity/i.test(risk) ? 'Follow-up cadence' : 'Discovery quality' }
                        </li>
                        <li>Manager notes and expectations</li>
                        <li>Commit check: confirm path to {top ? formatCurrency(top.amount) : 'target'}</li>
                      </ul>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {scheduledMap[rep.name] ? `Scheduled: ${scheduledMap[rep.name]}` : "未安排会议"}
                        </div>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => openSchedule(rep.name)}>
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          安排15-20分钟
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{scheduleRep ? `为 ${scheduleRep} 安排会议` : "安排会议"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground">选择一个15或20分钟的空闲时间</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {slots.map(s => (
                        <button
                          key={`${s.date}-${s.time}-${s.duration}`}
                          onClick={() => setSelectedSlot(s)}
                          className={`text-xs px-2 py-1 rounded border ${selectedSlot && selectedSlot.date === s.date && selectedSlot.time === s.time && selectedSlot.duration === s.duration ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}
                        >
                          {s.date} {s.time} · {s.duration} min
                        </button>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button disabled={!selectedSlot} onClick={confirmSchedule} className="text-xs">
                      确认安排
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
