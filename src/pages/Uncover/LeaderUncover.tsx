import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAEReps, mockDeals, formatCurrency } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/contexts/ToastContext";
import { Calendar as CalendarIcon, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PulseFlow from "@/components/dashboard/PulseFlow";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type QueueStatus = "review" | "queued";

interface CallItem {
  id: string;
  rep: string;
  callName: string;
  duration: string;
  focus: string[];
  aiScore: number;
  talkListen: string;
  status: QueueStatus;
  dateTime: string;
}

const FOCUS_AREAS = ["Objection handling", "Discovery depth", "Next step clarity", "Value articulation", "Negotiation"];

function makeQueue(): CallItem[] {
  const reps = mockAEReps.slice(0, 6).map(r => r.name);
  const list: CallItem[] = [];
  let idx = 1;
  for (const r of reps) {
    list.push({
      id: `c-${idx++}`,
      rep: r,
      callName: `${r.split(" ")[0]}'s Discovery Call with Acme`,
      duration: "43:12",
      focus: [FOCUS_AREAS[idx % FOCUS_AREAS.length], FOCUS_AREAS[(idx + 2) % FOCUS_AREAS.length]],
      aiScore: 7 + ((idx % 4) - 2) * 0.5,
      talkListen: `${45 + (idx % 8)}:${55 - (idx % 8)}`,
      status: idx % 3 === 0 ? "queued" as const : "review" as const,
      dateTime: "Mon 10:00 AM",
    });
  }
  return list;
}

export default function LeaderUncover() {
  const navigate = useNavigate();
  const { showSuccess } = useToastContext();
  const [repFilter, setRepFilter] = useState<string>("all");
  const [selectedCall, setSelectedCall] = useState<CallItem | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const agendaReps = useMemo(() => mockAEReps.slice(0, 6), []);
  const agendaRepNames = useMemo(() => agendaReps.map(r => r.name), [agendaReps]);
  const getTopDealFor = (repName: string) => {
    const deals = mockDeals.filter(d => d.owner_name === repName);
    if (deals.length === 0) return null;
    return deals.reduce((a, b) => (a.amount > b.amount ? a : b));
  };
  const riskLabelFor = (repName: string) => {
    const deals = mockDeals.filter(d => d.owner_name === repName);
    const risky = deals.find(d => d.risk_reasons && d.risk_reasons.length > 0);
    if (!risky || risky.risk_reasons.length === 0) return "—";
    return risky.risk_reasons[0].label;
  };
  const timeWindowDeals = useMemo(() => mockDeals.filter(d => d.staleness_days <= 7), []);
  const repDeals = useMemo(() => timeWindowDeals.filter(d => agendaRepNames.includes(d.owner_name)), [timeWindowDeals, agendaRepNames]);
  const eligibleDeals = useMemo(() => repDeals.filter(d => d.need_coaching), [repDeals]);
  const repFullySubmitted = (name: string) => {
    const ds = eligibleDeals.filter(d => d.owner_name === name);
    return ds.length > 0 && ds.every(d => d.self_assessment_status === "SUBMITTED");
  };
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleRep, setScheduleRep] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [scheduledMap, setScheduledMap] = useState<Record<string, string>>({});
  const genSlots = () => {
    const base = new Date();
    const nextDay = (target: number) => {
      const d = new Date(base);
      let diff = (target - d.getDay() + 7) % 7;
      if (diff === 0) diff = 7;
      d.setDate(d.getDate() + diff);
      return d;
    };
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mkLabel = (day: Date, hour: number, min: number) => {
      const start = new Date(day);
      start.setHours(hour, min, 0, 0);
      const end = new Date(start.getTime() + 20 * 60000);
      const to12 = (h: number, m: number) => {
        const am = h < 12;
        const hh = h % 12 === 0 ? 12 : h % 12;
        const mm = m.toString().padStart(2, "0");
        return `${hh}:${mm} ${am ? "AM" : "PM"}`;
      };
      return `${dayNames[start.getDay()]}. ${monthNames[start.getMonth()]} ${start.getDate()} ${to12(start.getHours(), start.getMinutes())} - ${to12(end.getHours(), end.getMinutes())}`;
    };
    const wed = nextDay(3);
    const thu = nextDay(4);
    const times: Array<[number, number]> = [[9, 0], [9, 30], [14, 0]];
    const slots: string[] = [];
    times.forEach(([h, m]) => slots.push(mkLabel(wed, h, m)));
    times.forEach(([h, m]) => slots.push(mkLabel(thu, h, m)));
    return slots;
  };
  const [slots] = useState<string[]>(genSlots());
  const openSchedule = (repName: string) => {
    setScheduleRep(repName);
    setSelectedSlot(null);
    setScheduleOpen(true);
  };
  const confirmSchedule = () => {
    if (scheduleRep && selectedSlot) {
      setScheduledMap(prev => ({ ...prev, [scheduleRep]: selectedSlot }));
      showSuccess(`Scheduled ${scheduleRep} — ${selectedSlot}`);
      setScheduleOpen(false);
    }
  };

  const reps = useMemo(() => ["all", ...mockAEReps.map(r => r.name)], []);
  const queue = useMemo(() => makeQueue(), []);
  const filtered = useMemo(
    () => (repFilter === "all" ? queue : queue.filter(q => q.rep === repFilter)),
    [repFilter, queue]
  );

  const handleFocusClick = (call: CallItem, focus: string) => {
    setSelectedCall(call);
    setSelectedFocus(focus);
  };

  return (
    <div className="h-full bg-white overflow-auto" style={{ scrollbarGutter: 'stable both-edges' }}>
      <div className="sticky top-0 z-20 bg-white">
      <PageHeader
        title="U — Uncover"
        subtitle="Deep dive on deals with scheduled coaching sessions — ~60 min"
        titleClassName="text-2xl font-bold text-gray-900"
        inlineChildren
      >
        <div className="flex items-center justify-end gap-8">
          <div className="flex items-center gap-3">
            <Select value={repFilter} onValueChange={setRepFilter}>
              <SelectTrigger className="w-56 h-8 text-xs bg-white">
                <SelectValue placeholder="All Reps" />
              </SelectTrigger>
              <SelectContent>
                {reps.map(name => (
                  <SelectItem
                    key={name}
                    value={name}
                    className="text-xs hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-foreground"
                  >
                    {name === "all" ? "All Reps" : name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-shrink-0">
            <PulseFlow
              compact
              completeOnClick
              initialActiveStep="uncover"
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
      <div className="px-6 pb-6">
        <Tabs defaultValue="queue" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="queue">Call Coaching</TabsTrigger>
            <TabsTrigger value="agenda">Coaching Agenda</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-4">
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
                <div className="text-sm font-semibold text-foreground">Call Review Queue</div>
              </div>
              <div className="rounded overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground bg-secondary/40">
                      {repFilter === "all" && <th className="text-left px-4 py-2 font-medium">Rep</th>}
                      <th className="text-left px-4 py-2 font-medium">Call</th>
                      <th className="text-left px-3 py-2 font-medium">Duration</th>
                      <th className="text-left px-3 py-2 font-medium">Focus Area</th>
                      <th className="text-left px-3 py-2 font-medium">AI Score</th>
                      <th className="text-left px-3 py-2 font-medium">Talk:Listen</th>
                      <th className="text-left px-3 py-2 font-medium">Status</th>
                      <th className="text-left px-3 py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(call => (
                      <tr key={call.id} className="border-t border-border hover:bg-gray-50 transition-colors">
                        {repFilter === "all" && (
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900">{call.rep}</span>
                          </td>
                        )}
                        <td className="py-3 px-4">{call.callName}</td>
                        <td className="py-3 px-4">{call.duration}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {call.focus.map(f => (
                              <button
                                key={f}
                                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#605BFF]/10 text-[#605BFF] hover:bg-[#605BFF]/20 transition-colors"
                                onClick={() => handleFocusClick(call, f)}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">{call.aiScore.toFixed(1)}/10</td>
                        <td className="py-3 px-4">{call.talkListen}</td>
                        <td className="py-3 px-4">
                          {call.status === "review" ? (
                            <Badge variant="outline" className="text-[11px] bg-status-green/10 text-status-green border-none">review</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[11px] bg-secondary/50 text-muted-foreground border-none">queued</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 rounded hover:bg-gray-100">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate("/meeting-intelligence")}>
                                Review
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card">
              <div className="px-4 py-3 border-b border-border bg-gray-50">
                <div className="text-sm font-semibold text-foreground">
                  Voice Note Coaching — {selectedCall ? selectedCall.callName : "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Pre-drafted using P-O-Q formula from AI call analysis
                </div>
              </div>
              <div className="p-4">
                {!selectedCall || !selectedFocus ? (
                  <div className="text-sm text-muted-foreground">
                    Please click a Focus Area above to load details.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-border bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Positive</div>
                      <div className="text-sm text-foreground">
                        {selectedCall.rep.split(" ")[0]}, you did a great job handling the initial pushback on timeline. Your reframe to business impact was smooth.
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Observation</div>
                      <div className="text-sm text-foreground">
                        Around minute 18, the {selectedFocus.toLowerCase()} could go deeper. Consider asking a probing question to uncover the why behind the concern.
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Question</div>
                      <div className="text-sm text-foreground">
                        Next time, how would you guide the buyer to articulate success criteria before positioning options?
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agenda">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Showing agendas for reps with submitted self-assessments.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agendaReps.filter(r => repFullySubmitted(r.name)).map((rep) => {
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
                          {scheduledMap[rep.name] ? `Scheduled: ${scheduledMap[rep.name]}` : "Not scheduled"}
                        </div>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => openSchedule(rep.name)}>
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          {scheduledMap[rep.name] ? "Update" : "Schedule 20-min"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{scheduleRep ? `Schedule 1:1 — ${scheduleRep}` : "Schedule 1:1"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground">Select a 20-minute slot (Wed–Thu)</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {slots.map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSlot(s)}
                          className={`text-xs px-2 py-1 rounded border ${selectedSlot === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button disabled={!selectedSlot} onClick={confirmSchedule} className="text-xs">
                      Confirm
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
