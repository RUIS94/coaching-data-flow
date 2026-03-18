import { PageHeader } from "@/components/CommonComponents/PageHeader";
import { KPICard } from "@/components/CommonComponents/KPICard";
import { mockAEReps } from "@/data/mock";
import { Textarea } from "@/components/ui/textarea";

type TrackerRow = {
  rep: string;
  focus: string;
  behaviorChange: string;
  dealOutcomes: string;
  skillRating: string;
  trend: "up" | "down" | "flat";
};

const trackerData: TrackerRow[] = [
  { rep: "Sarah Chen", focus: "Discovery depth", behaviorChange: "More probing qs", dealOutcomes: "+2 advanced", skillRating: "7.8/10", trend: "up" },
  { rep: "Marcus Johnson", focus: "EB access", behaviorChange: "Stakeholder mapping", dealOutcomes: "1 commit at risk", skillRating: "6.5/10", trend: "flat" },
  { rep: "Alex Rivera", focus: "Next step clarity", behaviorChange: "Buyer-confirmed next steps", dealOutcomes: "+1 closed-won", skillRating: "8.6/10", trend: "up" },
  { rep: "Priya Patel", focus: "Value articulation", behaviorChange: "Business impact framing", dealOutcomes: "Pipeline improving", skillRating: "7.2/10", trend: "up" },
];

export default function LeaderEvaluate() {
  const winRate = "31%";
  const forecastAccuracy = "78%";
  const dealProgression = "24%";
  const coachingCadence = "82%";

  return (
    <div className="h-full bg-white overflow-auto">
      <PageHeader
        title="E — Evaluate"
        subtitle="Measurement, pattern recognition & continuous improvement — ~15 min Friday"
        titleClassName="text-2xl font-bold text-gray-900"
      />
      <div className="px-6 pb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Win Rate" value={winRate} trend="up" trendLabel="+2% WoW" trendPositive={true} />
          <KPICard label="Forecast Accuracy" value={forecastAccuracy} trend="flat" trendLabel="Stable" trendPositive={false} />
          <KPICard label="Deal Progression" value={dealProgression} trend="up" trendLabel="+4 advanced" trendPositive={true} />
          <KPICard label="Coaching Cadence" value={coachingCadence} trend="flat" trendLabel="On track" trendPositive={true} />
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
            <div className="text-sm font-semibold text-foreground">4-Week Coaching Tracker</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">Rep</th>
                  <th className="py-3 px-4">Coaching Focus</th>
                  <th className="py-3 px-4">Behavior Change</th>
                  <th className="py-3 px-4">Deal Outcomes</th>
                  <th className="py-3 px-4">Skill Rating</th>
                  <th className="py-3 px-4">Trend</th>
                </tr>
              </thead>
              <tbody>
                {trackerData.map((row, i) => (
                  <tr key={i} className="border-t border-border hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">{row.rep}</td>
                    <td className="py-3 px-4">{row.focus}</td>
                    <td className="py-3 px-4">{row.behaviorChange}</td>
                    <td className="py-3 px-4">{row.dealOutcomes}</td>
                    <td className="py-3 px-4">{row.skillRating}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs ${row.trend === "up" ? "text-status-green" : row.trend === "down" ? "text-status-red" : "text-muted-foreground"}`}>
                        {row.trend === "up" ? "Improving" : row.trend === "down" ? "Declining" : "Flat"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border bg-gray-50">
            <div className="text-sm font-semibold text-foreground">Weekly Reflection</div>
            <div className="text-xs text-muted-foreground">Use these prompts to guide continuous improvement</div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-foreground">1. Which coaching theme drove measurable deal movement?</div>
                <Textarea placeholder="Write your reflection..." className="mt-1" />
              </div>
              <div>
                <div className="text-sm text-foreground">2. Where did forecast variance originate this week?</div>
                <Textarea placeholder="Write your reflection..." className="mt-1" />
              </div>
              <div>
                <div className="text-sm text-foreground">3. What pattern in discovery depth needs reinforcement?</div>
                <Textarea placeholder="Write your reflection..." className="mt-1" />
              </div>
              <div>
                <div className="text-sm text-foreground">4. Which rep should present a win/learning clip to peers?</div>
                <Textarea placeholder="Write your reflection..." className="mt-1" />
              </div>
              <div>
                <div className="text-sm text-foreground">5. What is the single highest-impact hygiene improvement next week?</div>
                <Textarea placeholder="Write your reflection..." className="mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
