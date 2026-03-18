import { useMemo, useState } from "react";
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { mockAEReps, mockDeals, formatCurrency } from "@/data/mock";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";

export default function LeaderLead() {
  const repName = mockAEReps[0]?.name || "Alex Rodriguez";
  const deals = useMemo(() => {
    const list = mockDeals.filter(d => d.owner_name === repName);
    return list.length ? list : mockDeals.slice(0, 3);
  }, [repName]);
  const [idx, setIdx] = useState(0);
  const selected = deals[idx];

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

  return (
    <div className="h-full bg-white overflow-auto">
      <PageHeader
        title="L — Lead"
        subtitle="Sync 1:1s, deal deep-dives & action management — ~75 min"
        titleClassName="text-2xl font-bold text-gray-900"
      >
        {idx === deals.length - 1 && (
          <Button size="sm" onClick={() => setFeedbackOpen(true)}>
            360° feedback
          </Button>
        )}
      </PageHeader>
      <div className="px-6 pb-6 space-y-4">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
            <div>
              <div className="text-sm font-semibold text-foreground">1:1 Prep Packet — {repName}</div>
              <div className="text-xs text-muted-foreground">Coaching session starts {coachStart}</div>
            </div>
            <div className="flex items-center gap-2">
              {idx > 0 && (
                <Button size="sm" variant="secondary" onClick={() => setIdx(i => Math.max(0, i - 1))}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous Deal
                </Button>
              )}
              {idx < deals.length - 1 && (
                <Button size="sm" onClick={() => setIdx(i => Math.min(deals.length - 1, i + 1))}>
                  Next Deal
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard label="Actions last week" value={`${actionsDone}/${actionsTotal}`} />
              <KPICard label="Deals progressed" value={`${dealsProgressed}`} />
              <KPICard label="Call coaching score" value={`${coachingScore.toFixed(1)} / 10`} />
              <KPICard label="Confidence" value={`${confidence.toFixed(1)} / 10`} />
            </div>
            <div className="rounded-lg border border-border bg-white p-4">
              <div className="text-sm font-semibold text-foreground mb-3">
                {selected ? `${selected.account_name} (${formatCurrency(selected.amount)})` : "—"}
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
                    {selected?.next_step ? `${selected.next_step.owner}: ${selected.next_step.title}` : "Align success criteria"}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-white p-4">
              <div className="text-sm font-semibold text-foreground mb-2">Suggested Coaching Questions</div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                <li>What outcome would make this a must-do this quarter for the EB</li>
                <li>Which stakeholder has the strongest influence and how can we engage</li>
                <li>What risk is most likely to delay close and how do we mitigate it</li>
                <li>What proof point will accelerate confidence for the decision maker</li>
              </ul>
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
