import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { mockAEReps, mockDeals, formatCurrency } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ManagerPrep() {
  const reps = mockAEReps.slice(0, 6);
  const getTopDealFor = (repName: string) => {
    const deals = mockDeals.filter(d => d.owner_name === repName);
    if (deals.length === 0) return null;
    return deals.reduce((a, b) => (a.amount > b.amount ? a : b));
  };
  const isReady = (score: number, overdue: number) => score >= 80 && overdue === 0;
  const confidenceFor = (score: number) => `${Math.round(score / 10)}/10`;
  const riskLabelFor = (repName: string) => {
    const deals = mockDeals.filter(d => d.owner_name === repName);
    const risky = deals.find(d => d.risk_reasons && d.risk_reasons.length > 0);
    if (!risky || risky.risk_reasons.length === 0) return "—";
    return risky.risk_reasons[0].label;
  };
  const helpNeededFor = (risk: string) => {
    if (/Missing EB/i.test(risk)) return "Intro to their EB/CFO";
    if (/Stage Stuck|Close Date/i.test(risk)) return "Deal strategy for compelling event";
    if (/Commit at Risk|No Next Step|Low Activity/i.test(risk)) return "Next step coaching";
    return "—";
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
                value="6/8"
                note="Nudge sent to Sarah K., Tom C."
              />
              <KPICard
                label="Risk Alerts"
                value="5 deals"
                note="2 critical · 2 warning · 1 info"
              />
              <KPICard
                label="Avg Confidence Score"
                value="6.8 / 10"
                trend="up"
                trendLabel="+0.3 from last week"
                trendPositive={true}
              />
            </div>

            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
                <div className="text-sm font-semibold text-foreground">Rep Self-Assessments</div>
                <Button size="sm" className="text-xs">Nudge remaining</Button>
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
                      const help = helpNeededFor(risk);
                      const ready = isReady(rep.hygiene_score, rep.overdue_actions);
                      return (
                        <tr key={rep.user_id} className="border-t border-border hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900">{rep.name}</span>
                          </td>
                          {ready ? (
                            <>
                              <td className="py-3 px-4">{top ? `${top.account_name} (${formatCurrency(top.amount)})` : '—'}</td>
                              <td className="py-3 px-4">{risk}</td>
                              <td className="py-3 px-4">{help}</td>
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
                                    <DropdownMenuItem>Review</DropdownMenuItem>
                                    <DropdownMenuItem>Nudge remaining</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </>
                          ) : (
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
                                    <DropdownMenuItem>Review</DropdownMenuItem>
                                    <DropdownMenuItem>Nudge remaining</DropdownMenuItem>
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
          </TabsContent>
          <TabsContent value="agenda">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Showing agendas for reps with submitted self-assessments.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reps.filter(r => isReady(r.hygiene_score, r.overdue_actions)).map((rep) => {
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
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
