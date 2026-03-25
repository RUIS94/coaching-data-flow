import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { mockDeals, type Deal, formatCurrency } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Bot, ChevronDown, Search, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import PulseFlow from "@/components/dashboard/PulseFlow";

interface FlaggedCall {
  id: string;
  callName: string;
  dateTime: string;
  duration: string;
  flaggedMinute?: number;
  flaggedLabel?: string;
  focus: string[];
  aiScore: number;
  talkListen: string;
  questions: number;
  nextSteps: string;
  focusEval: string;
}

function seeded(n: number) {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}
function makeFlaggedCallsForDeal(d: Deal): FlaggedCall[] {
  const base = d.deal_id.split("").reduce((s, ch, i) => s + ch.charCodeAt(0) * (i + 1), 0);
  const count = 1 + (base % 2);
  const arr: FlaggedCall[] = [];
  for (let i = 0; i < count; i++) {
    const r = seeded(base + i);
    const talk = 40 + Math.floor(r * 40);
    const listen = 100 - talk;
    const mins = 25 + Math.floor(seeded(base + i * 7) * 25);
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dow = dayNames[(base + i) % dayNames.length];
    const mon = monthNames[(base + i) % monthNames.length];
    const day = ((base + i) % 28) + 1;
    const hour = ((base + i) % 9) + 9;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour > 12 ? hour - 12 : hour;
    const flaggedMinute = 12 + ((base + i) % 10);
    const flaggedLabels = ["objection handling", "next step clarity", "executive alignment", "value articulation"];
    const flaggedLabel = flaggedLabels[(base + i) % flaggedLabels.length];
    arr.push({
      id: `${d.deal_id}-c-${i}`,
      callName: `${d.account_name} — ${d.deal_name} Call ${i + 1}`,
      dateTime: `${dow}, ${mon} ${day} · ${hour12}:00 ${ampm}`,
      duration: `${mins} min`,
      flaggedMinute,
      flaggedLabel,
      focus: ["Discovery depth", "Next step clarity"].slice(0, 1 + (base + i) % 2),
      aiScore: Math.round((6 + r * 3) * 10) / 10,
      talkListen: `${talk}:${listen}`,
      questions: 8 + Math.floor(r * 8),
      nextSteps: d.next_step?.description || "Schedule technical deep-dive",
      focusEval: d.risk_reasons.map(r => r.label).slice(0, 2).join("; ") || "Healthy momentum.",
    });
  }
  return arr;
}

export default function SalesUncover() {
  const navigate = useNavigate();
  const [selectedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("sales_selected_deal_ids");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const deals = useMemo<Deal[]>(() => {
    const list = selectedIds.length ? mockDeals.filter(d => selectedIds.includes(d.deal_id)) : mockDeals.filter(d => d.owner_name === "Sarah Chen");
    return list.length ? list : mockDeals.filter(d => d.owner_name === "Sarah Chen");
  }, [selectedIds]);
  const [page, setPage] = useState(0);
  const current = deals[page] || null;
  const calls = useMemo(() => current ? makeFlaggedCallsForDeal(current) : [], [current]);
  const [selfReflections, setSelfReflections] = useState<Record<string, string>>({});
  type PredefQ = { id: string; source: "manager" | "ai"; question: string; answer: string };
  const [managerQ, setManagerQ] = useState<Record<string, PredefQ[]>>({});
  const [aiQ, setAiQ] = useState<Record<string, PredefQ[]>>({});
  const methodologies = ["MEDDIC", "SPIN", "Challenger"];
  const [methodByDeal, setMethodByDeal] = useState<Record<string, string>>({});
  const [searchByDeal, setSearchByDeal] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!current) return;
    const id = current.deal_id;
    setManagerQ(prev => prev[id] ? prev : ({
      ...prev,
      [id]: [
        { id: `${id}-m1`, source: "manager", question: "What is your plan to secure EB access?", answer: "" },
        { id: `${id}-m2`, source: "manager", question: "Which deals need buyer-confirmed next steps?", answer: "" },
      ]
    }));
    setAiQ(prev => prev[id] ? prev : ({
      ...prev,
      [id]: [{ id: `${id}-a1`, source: "ai", question: "Where are critical risks blocking progression?", answer: "" }]
    }));
    setMethodByDeal(prev => prev[id] ? prev : ({ ...prev, [id]: "MEDDIC" }));
    setSearchByDeal(prev => prev[id] ? prev : ({ ...prev, [id]: "" }));
    setSelfReflections(prev => prev[id] !== undefined ? prev : ({ ...prev, [id]: "" }));
  }, [current]);
  const questionBanks: Record<string, string[]> = {
    MEDDIC: [
      "What is the compelling event for this deal?",
      "Do we have a clear EB access plan?",
      "What are top quantified pains?",
      "What are the decision criteria?",
      "What is the MAP status and next steps?",
      "Where are risks blocking progression?",
    ],
    SPIN: [
      "What situation details are missing?",
      "Which problems need deeper discovery?",
      "What implications can create urgency?",
      "What need-payoff can we articulate?",
    ],
    Challenger: [
      "What insight can we teach?",
      "How do we reframe the problem?",
      "Which commercial insight applies?",
      "How to create constructive tension?",
    ],
  };
  const filteredQuestions = (dealId: string) => {
    const m = methodByDeal[dealId] || "MEDDIC";
    const q = questionBanks[m] || [];
    const kw = (searchByDeal[dealId] || "").toLowerCase();
    return q.filter(x => x.toLowerCase().includes(kw));
  };
  const generateAnswer = (deal: Deal, q: string) => {
    const risks = deal.risk_reasons.map(r => r.label).join(", ") || "Low risk";
    const needNext = deal.next_step && !deal.next_step.is_buyer_confirmed ? `${deal.account_name}/${deal.deal_name}` : "All set";
    const skills = [
      deal.risk_reasons.some(r => r.code === "MISSING_EB") ? "EB access & sponsor engagement" : "",
      deal.risk_reasons.some(r => r.code === "SINGLE_THREADED") ? "Stakeholder multithreading" : "",
      !deal.next_step || !deal.next_step.is_buyer_confirmed ? "Buyer-confirmed next step setting" : "",
      deal.stage_dwell_days > 20 ? "Stage progression acceleration" : "",
      "Objection handling & value articulation",
    ].filter(Boolean).join(", ");
    return `Context\nRisks: ${risks}\nNext step gaps: ${needNext}\nSkills: ${skills}\nAnswer\n${q} → Focus on EB plan, buyer-confirmed next steps, and progression acceleration.`;
  };

  return (
    <div className="h-full bg-white overflow-auto" style={{ scrollbarGutter: 'stable both-edges' }}>
      <div className="sticky top-0 z-20 bg-white">
        <PageHeader
          title="U — Uncover"
          subtitle="Call coaching, skill diagnosis & voice note delivery — ~60 min"
          titleClassName="text-2xl font-bold text-gray-900"
          inlineChildren
        >
          <div className="flex items-center w-full justify-end gap-8">
            <div className="flex-shrink-0">
              <PulseFlow
                compact
                completeOnClick
                initialActiveStep="uncover"
                onNavigateToStep={(step) => {
                  if (step === "prepare") navigate("/sales-prep");
                  else if (step === "uncover") navigate("/sales-uncover");
                  else if (step === "lead") navigate("/sales-lead");
                  else if (step === "sync") navigate("/sales-sync");
                  else if (step === "evaluate") navigate("/sales-evaluate");
                }}
              />
            </div>
          </div>
        </PageHeader>
      </div>
      <div className="px-6 pb-6 space-y-4">
        {current && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-foreground">{current.account_name} / {current.deal_name}</div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs text-muted-foreground">{formatCurrency(current.amount)} · {current.stage_name}</div>
                </div>
                <div className="flex items-center gap-2">
                  {page > 0 && (
                    <Button size="sm" variant="secondary" onClick={() => setPage(i => Math.max(0, i - 1))}>
                      Previous Deal
                    </Button>
                  )}
                  {page < deals.length - 1 && (
                    <Button size="sm" onClick={() => setPage(i => Math.min(deals.length - 1, i + 1))}>
                      Next Deal
                    </Button>
                  )}
                  <span className={`text-[11px] font-semibold px-2 py-1 rounded ${
                    current.risk_level === 'RED' ? 'bg-red-100 text-red-700' :
                    current.risk_level === 'AMBER' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>{current.risk_level}</span>
                </div>
              </div>
              <div className="space-y-4">
                {calls.map(c => (
                  <div key={c.id} className="rounded-lg border border-border bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{c.callName}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.dateTime} · {c.duration}
                          {typeof c.flaggedMinute === "number" && c.flaggedLabel && (
                            <> · Flagged: min {c.flaggedMinute} — {c.flaggedLabel}</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.focus.map(f => (
                          <span key={f} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#605BFF]/10 text-[#605BFF]">{f}</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
                      <div className="rounded-lg border border-border bg-white p-3">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Talk:Listen</div>
                        <div className="text-sm font-medium text-foreground">{c.talkListen}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-white p-3">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Questions Asked</div>
                        <div className="text-sm font-medium text-foreground">{c.questions}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-white p-3">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Next Steps</div>
                        <div className="text-sm font-medium text-foreground">{c.nextSteps}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-white p-3 col-span-2">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Focus Area Evaluation</div>
                        <div className="text-sm text-foreground">{c.focusEval}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-white p-3">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">AI Score</div>
                        <div className="text-sm font-medium text-foreground">{c.aiScore.toFixed(1)}/10</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-foreground">Self-Coaching Prompt</div>
                        <Badge variant="outline" className="text-[11px]">Reflect first</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {typeof c.flaggedMinute === "number" && c.flaggedLabel
                          ? `Before your leader reviews, reflect: What would you do differently at minute ${c.flaggedMinute}?`
                          : "Before your leader reviews, reflect on the pivotal moment in this call."}
                      </div>
                      <textarea
                        value={selfReflections[c.id] || ""}
                        onChange={e => setSelfReflections(prev => ({ ...prev, [c.id]: e.target.value }))}
                        rows={4}
                        className="w-full rounded-md border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                        placeholder="Type your thoughts here..."
                      />
                    </div>
                  </div>
                ))}
                <div className="rounded-2xl border border-gray-100">
                  <div className="px-4 py-3">
                    <div className="text-lg font-bold text-gray-900">Predefined Coaching Questions</div>
                  </div>
                  <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-900">Manager Questions</div>
                      </div>
                      <div className="space-y-3 max-h-56 overflow-y-auto">
                        {(managerQ[current.deal_id] || []).map((q) => (
                          <div key={q.id} className="rounded border p-3">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold text-gray-700">{q.question}</div>
                              <Lock size={14} className="text-gray-400" />
                            </div>
                            <textarea
                              value={q.answer}
                              onChange={(e) => {
                                const v = e.target.value;
                                setManagerQ(prev => ({
                                  ...prev,
                                  [current.deal_id]: (prev[current.deal_id] || []).map(x => x.id === q.id ? { ...x, answer: v } : x)
                                }));
                              }}
                              className="w-full h-20 text-sm border rounded mt-2 p-2"
                              placeholder="Type your answer"
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => {
                                  const a = generateAnswer(current, q.question);
                                  setManagerQ(prev => ({
                                    ...prev,
                                    [current.deal_id]: (prev[current.deal_id] || []).map(x => x.id === q.id ? { ...x, answer: a } : x)
                                  }));
                                }}
                                className="px-2 py-1 text-xs border rounded text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                              >
                                <Bot size={14} />
                                Generate
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-900">AI Suggested</div>
                        <div className="relative">
                          <button className="flex items-center space-x-1 px-2 py-1 text-xs bg-white hover:bg-gray-100 rounded">
                            <ChevronDown className="w-3 h-3" />
                            <span>{methodByDeal[current.deal_id] || "MEDDIC"}</span>
                          </button>
                          <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10 min-w-[160px]">
                            {["MEDDIC","SPIN","Challenger"].map(m => (
                              <button
                                key={m}
                                onClick={() => setMethodByDeal(prev => ({ ...prev, [current.deal_id]: m }))}
                                className={`w-full px-3 py-2 text-left text-sm ${(methodByDeal[current.deal_id] || "MEDDIC") === m ? 'text-[#605BFF] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={searchByDeal[current.deal_id] || ""}
                          onChange={(e) => setSearchByDeal(prev => ({ ...prev, [current.deal_id]: e.target.value }))}
                          placeholder="Enter keywords"
                          className="w-full pl-9 pr-4 py-2 text-sm border rounded"
                        />
                      </div>
                      <div className="space-y-2 max-h-28 overflow-y-auto">
                        {filteredQuestions(current.deal_id).map((qq, i) => (
                          <div key={i} className="flex items-center justify-between rounded border p-2">
                            <div className="text-xs text-gray-700">{qq}</div>
                            <button
                              onClick={() => {
                                const id = `${current.deal_id}-a${Date.now()}`;
                                setAiQ(prev => ({
                                  ...prev,
                                  [current.deal_id]: [...(prev[current.deal_id] || []), { id, source: "ai", question: qq, answer: "" }]
                                }));
                              }}
                              className="px-2 py-1 text-[11px] border rounded hover:bg-gray-50"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                        {filteredQuestions(current.deal_id).length === 0 && (
                          <div className="text-center py-2 text-gray-500 text-sm">No questions</div>
                        )}
                      </div>
                      <div className="space-y-3 mt-3 max-h-40 overflow-y-auto">
                        {(aiQ[current.deal_id] || []).map((q) => (
                          <div key={q.id} className="rounded border p-3">
                            <div className="flex items-center justify-between">
                              <input
                                value={q.question}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setAiQ(prev => ({
                                    ...prev,
                                    [current.deal_id]: (prev[current.deal_id] || []).map(x => x.id === q.id ? { ...x, question: v } : x)
                                  }));
                                }}
                                className="flex-1 text-xs font-semibold text-gray-700 border rounded px-2 py-1 mr-2"
                              />
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setAiQ(prev => ({ ...prev, [current.deal_id]: (prev[current.deal_id] || []).filter(x => x.id !== q.id) }))}
                                  className="p-1 text-gray-500 hover:text-red-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <textarea
                              value={q.answer}
                              onChange={(e) => {
                                const v = e.target.value;
                                setAiQ(prev => ({
                                  ...prev,
                                  [current.deal_id]: (prev[current.deal_id] || []).map(x => x.id === q.id ? { ...x, answer: v } : x)
                                }));
                              }}
                              className="w-full h-20 text-sm border rounded mt-2 p-2"
                              placeholder="Type your answer"
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => {
                                  const a = generateAnswer(current, q.question);
                                  setAiQ(prev => ({
                                    ...prev,
                                    [current.deal_id]: (prev[current.deal_id] || []).map(x => x.id === q.id ? { ...x, answer: a } : x)
                                  }));
                                }}
                                className="px-2 py-1 text-xs border rounded text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                              >
                                <Bot size={14} />
                                Generate
                              </button>
                            </div>
                          </div>
                        ))}
                        {(aiQ[current.deal_id] || []).length === 0 && (
                          <div className="text-center py-2 text-gray-500 text-sm">No AI questions</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
