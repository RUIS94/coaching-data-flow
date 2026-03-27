import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAEReps, mockDeals, formatCurrency, type Deal } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/contexts/ToastContext";
import { ChevronRight } from "lucide-react";
import PulseFlow from "@/components/dashboard/PulseFlow";
import { AskSamPopup } from "@/components/CommonComponents/AskSamPopup";
import EmptyPopup from "@/components/CommonComponents/EmptyPopup";

export default function LeaderUncover() {
  const navigate = useNavigate();
  const { showSuccess } = useToastContext();
  const [repFilter, setRepFilter] = useState<string>("all");
  const reps = useMemo(() => {
    try {
      const src = Array.isArray(mockAEReps) ? mockAEReps : [];
      const names = src.map(r => r && r.name).filter(Boolean) as string[];
      return ["all", ...Array.from(new Set(names))];
    } catch {
      return ["all"];
    }
  }, []);
  const repOptions = useMemo(() => (Array.isArray(reps) ? reps : ["all"]), [reps]);
  const selectedIdsFromPrep = useMemo<string[]>(() => {
    try {
      const raw = localStorage.getItem("uncoverSelectedDealIds");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);
  const selectedDealsFromPrep = useMemo<Deal[]>(() => {
    const deals = Array.isArray(mockDeals) ? mockDeals : [];
    return deals.filter(d => selectedIdsFromPrep.includes(d.deal_id));
  }, [selectedIdsFromPrep]);
  const dealsToAnalyze = useMemo<Deal[]>(
    () => (repFilter === "all" ? selectedDealsFromPrep : selectedDealsFromPrep.filter(d => d.owner_name === repFilter)),
    [selectedDealsFromPrep, repFilter]
  );
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  useEffect(() => {
    setActiveDeal(dealsToAnalyze[0] || null);
  }, [dealsToAnalyze]);
  const riskColor = (lvl?: string | null) => (lvl === "RED" ? "#FF3B30" : lvl === "AMBER" ? "#FF8E1C" : "#16A34A");
  const evidenceForDeal = (d: Deal | null) => {
    if (!d) return [];
    const rep = d.owner_name || "Rep";
    const codes = Array.isArray(d.risk_reasons) ? d.risk_reasons.map(r => r.code) : [];
    const out: { title: string; content: string; value: number }[] = [];
    if (codes.includes("MISSING_EB")) {
      out.push({ title: "Call note", content: `${rep} discussed timeline but did not identify the economic buyer. No follow-up to reach an approver.`, value: 7 });
    }
    if (codes.includes("SINGLE_THREADED")) {
      out.push({ title: "Account activity", content: `Communication focused on a single champion for 2+ weeks. No outreach to finance or procurement.`, value: 6 });
    }
    if (codes.includes("NO_NEXT_STEP_DATE")) {
      out.push({ title: "CRM update", content: `Next step missing a target date. Last meeting ended without confirmation of when to reconnect.`, value: 6 });
    }
    if (codes.includes("CLOSE_DATE_MOVED")) {
      out.push({ title: "Forecast change", content: `Close date was pushed out recently without added milestones. Decision process remains unclear.`, value: 5 });
    }
    if (codes.includes("WEAK_VALUE")) {
      out.push({ title: "Evaluation gap", content: `Prospect asked pricing questions but no agreement on value metrics or success criteria.`, value: 6 });
    }
    if (codes.includes("LOW_ACTIVITY")) {
      out.push({ title: "Engagement", content: `Low recent activity. No meetings or emails from the buying group logged in the last 10 days.`, value: 5 });
    }
    if (out.length === 0) {
      out.push({ title: "Pipeline note", content: `${rep} scheduled follow-up but no confirmation on who signs off.`, value: 6 });
      out.push({ title: "Risk indicator", content: `Stage ${d.stage_name} with approaching close date and limited stakeholder coverage.`, value: 5 });
    }
    return out.slice(0, 3);
  };
  const skillsForDeal = (d: Deal | null) => {
    if (!d) return [];
    const codes = Array.isArray(d.risk_reasons) ? d.risk_reasons.map(r => r.code) : [];
    const clamp = (n: number) => Math.max(25, Math.min(95, Math.round(n)));
    let exec = 70;
    let disc = 70;
    let next = 70;
    let multi = 70;
    if (codes.includes("MISSING_EB")) exec -= 25;
    if (codes.includes("SINGLE_THREADED")) multi -= 30;
    if (codes.includes("NO_NEXT_STEP_DATE")) next -= 30;
    if (codes.includes("WEAK_VALUE")) disc -= 15;
    if (codes.includes("STAGE_STUCK")) disc -= 20;
    if (codes.includes("CLOSE_DATE_MOVED")) next -= 10;
    if (codes.includes("COMMIT_AT_RISK")) { exec -= 10; next -= 10; }
    if (codes.includes("LOW_ACTIVITY")) disc -= 20;
    if (codes.includes("NO_MAP")) next -= 15;
    return [
      { name: "Executive Alignment", score: clamp(exec) },
      { name: "Discovery Depth", score: clamp(disc) },
      { name: "Next Step Clarity", score: clamp(next) },
      { name: "Multi-threading", score: clamp(multi) },
    ];
  };
  const planForDeal = (d: Deal | null) => {
    if (!d) return [];
    const codes = Array.isArray(d.risk_reasons) ? d.risk_reasons.map(r => r.code) : [];
    const out: string[] = [];
    if (codes.includes("MISSING_EB")) {
      out.push(`Ask: "Who approves budget for ${d.deal_name} and can we involve them this week?"`);
      out.push("Tactic: Request executive intro through champion or mutual connection");
    }
    if (codes.includes("SINGLE_THREADED")) {
      out.push("Tactic: Map stakeholders and request introductions to finance and procurement");
      out.push("Follow up: Confirm multi-threading plan and next meeting invites");
    }
    if (codes.includes("NO_NEXT_STEP_DATE")) {
      out.push("Confirm: Next step and target date at the end of each call");
    }
    if (codes.includes("CLOSE_DATE_MOVED")) {
      out.push("Re-plan: Validate decision process and align on milestones to close");
    }
    if (codes.includes("WEAK_VALUE")) {
      out.push("Value: Align on measurable outcomes and agree on evaluation criteria");
    }
    if (codes.includes("NO_MAP")) {
      out.push("Create: Mutual action plan with owners and dates");
    }
    if (codes.includes("LOW_ACTIVITY")) {
      out.push("Engage: Schedule stakeholder follow-ups and send a recap with agreed actions");
    }
    if (codes.includes("COMMIT_AT_RISK")) {
      out.push("Mitigate: Review risk drivers and add exec checkpoint before forecast lock");
    }
    if (out.length === 0) {
      out.push(`Ask: "What would prevent ${d.deal_name} from closing on time?"`);
      out.push("Tactic: Confirm next step, decision process, and stakeholder list");
    }
    return out.slice(0, 6);
  };
  const [evidOpen, setEvidOpen] = useState(false);
  const [evidItem, setEvidItem] = useState<{ title: string; content: string; value: number } | null>(null);
  const openEvidence = (item: { title: string; content: string; value: number }) => {
    setEvidItem(item);
    setEvidOpen(true);
  };
  const askSamQuestions = useMemo(() => {
    const name = activeDeal?.deal_name ?? "this deal";
    return [
      `What are the top risks for ${name}?`,
      `Show evidence on decision process for ${name}`,
      `What questions should I ask next for ${name}?`,
      `Create a coaching plan for ${name}`,
    ];
  }, [activeDeal]);
  const askSamAnswer = (q: string) => {
    const d = activeDeal;
    if (!d) return "No active deal selected. Pick a deal on the left first.";
    if (q.toLowerCase().includes("risk")) {
      const risks = d.risk_reasons?.map(r => r.label || r.code).slice(0, 5).join(", ") || "None found";
      return `Top risks for ${d.deal_name}: ${risks}.`;
    }
    if (q.toLowerCase().includes("evidence")) {
      const ev = evidenceForDeal(d).map(e => `• ${e.title}: ${e.content}`).join("\n");
      return ev || "No evidence available.";
    }
    if (q.toLowerCase().includes("question") || q.toLowerCase().includes("ask")) {
      return [
        `• Who besides you needs to approve budget for ${d.deal_name}?`,
        "• What timeline constraints could impact sign-off?",
        "• Are legal redlines anticipated and who handles them?",
      ].join("\n");
    }
    if (q.toLowerCase().includes("plan")) {
      return planForDeal(d).map(p => `• ${p}`).join("\n");
    }
    return "Got it. Ask about risks, evidence, next questions, or a coaching plan.";
  };

  class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: unknown }> {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError(error: unknown) {
      return { hasError: true, error };
    }
    componentDidCatch(error: unknown) {
      console.error(error);
    }
    render() {
      if (this.state.hasError) {
        const msg = this.state.error instanceof Error ? this.state.error.message : String(this.state.error);
        return <div className="p-6 text-sm text-red-600">Failed to render Uncover: {msg}</div>;
      }
      return this.props.children as React.ReactElement;
    }
  }

  return (
    <ErrorBoundary>
      <div className="h-full bg-white overflow-auto" style={{ scrollbarGutter: 'stable both-edges' }}>
        <div className="sticky top-0 z-20 bg-white">
        <PageHeader
          title=""
          inlineChildren
          leftSlot={
            <PulseFlow
              compact
              completeOnClick
              initialActiveStep="uncover"
              pageStepId="uncover"
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
            <Select value={repFilter} onValueChange={setRepFilter}>
              <SelectTrigger className="w-56 h-8 text-xs bg-white">
                <SelectValue placeholder="All Reps" />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(repOptions) ? repOptions : ["all"]).map(name => (
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
            <AskSamPopup
              questions={askSamQuestions}
              onGenerateAnswer={askSamAnswer}
              triggerLabel="Ask Sam"
              buttonClassName="gap-2 bg-white text-[#FF8E1C] border border-[#FF8E1C] hover:bg-[#FF8E1C] hover:text-white"
              mode="sheet"
              sheetSide="right"
              description="Ask about risk drivers, evidence, or coaching tactics for this deal"
            />
          </div>
        </PageHeader>
        </div>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <div className="rounded-lg border border-border bg-card lg:col-span-2 flex flex-col">
              <div className="px-4 py-3 border-b border-border bg-gray-50 text-sm font-semibold text-foreground">Deals to Analyze</div>
              <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: "75vh" }}>
                {dealsToAnalyze.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No selected deals.</div>
                ) : (
                  (Array.isArray(dealsToAnalyze) ? dealsToAnalyze : []).map(d => {
                    const active = activeDeal?.deal_id === d.deal_id;
                    return (
                      <button
                        key={d.deal_id}
                        onClick={() => setActiveDeal(d)}
                        className={`w-full text-left rounded-lg border border-border p-2 hover:bg-gray-50 ${active ? "ring-1 ring-[#605BFF]" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: riskColor(d.risk_level) }} />
                            <div className="min-w-0">
                              <div className="text-[13px] font-medium text-foreground truncate">{d.deal_name}</div>
                              <div className="text-[11px] text-muted-foreground">{formatCurrency(d.amount)}</div>
                            </div>
                          </div>
                          <div className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${riskColor(d.risk_level)}20`, color: riskColor(d.risk_level) }}>
                            {d.risk_level?.toLowerCase()}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card lg:col-span-6 flex flex-col">
              <div className="px-4 py-3 border-b border-border bg-gray-50 flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">
                  {activeDeal ? `${activeDeal.deal_name} — ${formatCurrency(activeDeal.amount)}` : "—"}
                </div>
                <div className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${riskColor(activeDeal?.risk_level)}20`, color: riskColor(activeDeal?.risk_level) }}>
                  {activeDeal?.risk_level || "—"}
                </div>
              </div>
              <div className="p-4 space-y-5 overflow-y-auto" style={{ maxHeight: "75vh" }}>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Why at Risk</div>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                    {activeDeal && activeDeal.risk_reasons && activeDeal.risk_reasons.length > 0 ? (
                      activeDeal.risk_reasons.slice(0, 5).map((r, idx) => <li key={idx}>{r.label || r.code}</li>)
                    ) : (
                      <li>No explicit risks found.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Evidence</div>
                  <div className="space-y-2">
                    {evidenceForDeal(activeDeal).map((e, i) => (
                      <button
                        key={i}
                        onClick={() => openEvidence(e)}
                        className="w-full text-left px-3 py-2 rounded border border-border hover:bg-gray-50 text-sm"
                      >
                        <div className="font-medium text-foreground">{e.title}</div>
                        <div className="text-muted-foreground text-xs">{e.content}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skill Gaps</div>
                  <div className="space-y-3">
                    {skillsForDeal(activeDeal).map((s, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-foreground">{s.name}</span>
                          <span className="text-muted-foreground">{s.score}/100</span>
                        </div>
                        <div className="h-2 w-full rounded bg-muted">
                          <div
                            className="h-2 rounded"
                            style={{
                              width: `${s.score}%`,
                              backgroundColor: s.score >= 70 ? "#16A34A" : s.score >= 40 ? "#FF8E1C" : "#FF3B30",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card lg:col-span-2 flex flex-col">
              <div className="px-4 py-3 border-b border-border bg-gray-50 text-sm font-semibold text-foreground">Coaching Plan</div>
              <div className="p-4 space-y-2">
                <ul className="list-disc pl-5 space-y-2 text-sm text-foreground">
                  {planForDeal(activeDeal).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="px-4 py-3 border-t border-border">
                <Button className="text-xs" onClick={() => navigate("/leader-lead")}>
                  Confirm Plan
                  <ChevronRight className="h-4 w-4 ml-1" />
                  Lead
                </Button>
              </div>
            </div>
          </div>
        </div>
        <EmptyPopup
          isOpen={evidOpen}
          onClose={() => setEvidOpen(false)}
          title={evidItem?.title || "Evidence"}
          content={evidItem?.content || ""}
          value={evidItem?.value || 0}
        />
      </div>
    </ErrorBoundary>
  );
}
