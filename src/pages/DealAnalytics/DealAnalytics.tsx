import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Share2, StickyNote, BookOpen } from "lucide-react";
import { deals, salesReps } from "@/data/dashboardData";
import {
  getDealTimeline,
  getDealStakeholders,
  getDealRiskInsights,
  getDealCoachingSuggestions,
  getDealAnalytics,
} from "@/data/dealAnalyticsData";
import DealOverview from "@/components/deal-analytics/DealOverview";
import RiskAnalysis from "@/components/deal-analytics/RiskAnalysis";
import ActivityTimeline from "@/components/deal-analytics/ActivityTimeline";
import StakeholderMap from "@/components/deal-analytics/StakeholderMap";
import CoachingSuggestions from "@/components/deal-analytics/CoachingSuggestions";
import CoachingRequestPanel from "@/components/deal-analytics/CoachingRequestPanel";
import { useState } from "react";
import { useToastContext } from "@/contexts/ToastContext";

const DealAnalytics = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess } = useToastContext();

  const deal = deals.find((d) => d.id === dealId);
  const rep = deal ? salesReps.find((r) => r.id === deal.repId) : null;

  const [coachingTopic, setCoachingTopic] = useState("");
  const [coachingReason, setCoachingReason] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  if (!deal || !rep) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Deal not found</p>
          <button onClick={() => navigate("/")} className="text-primary font-medium hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const analytics = getDealAnalytics(deal.id);
  const timeline = getDealTimeline(deal.id);
  const stakeholderList = getDealStakeholders(deal.id);
  const riskInsights = getDealRiskInsights(deal.id);
  const suggestions = getDealCoachingSuggestions(deal.id);

  const handleSelectSuggestion = (topic: string, reason: string) => {
    setCoachingTopic(topic);
    setCoachingReason(reason);
    // Scroll to coaching panel
    document.getElementById("coaching-panel")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShareInsights = () => {
    showSuccess(`Deal insights shared with ${rep.name}`);
  };

  const handleSaveNotes = () => {
    showSuccess("Private coaching notes saved");
    setShowNotes(false);
  };

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => {
              if (deal.repId) navigate(`/deal-drilldown/${deal.repId}`);
              else navigate("/");
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">Deal Analytics</h1>
            <p className="text-xs text-muted-foreground truncate">{deal.name} · {deal.company}</p>
          </div>

          {/* Manager actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              title="Private coaching notes"
            >
              <StickyNote className="h-4 w-4" />
            </button>
            <button
              onClick={handleShareInsights}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              title="Share insights with rep"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/")}
              className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Private notes drawer */}
        {showNotes && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3">
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                <StickyNote className="h-3 w-3" /> Private Coaching Notes
              </p>
              <textarea
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
                placeholder="Add private notes about this deal for coaching purposes..."
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none mb-2"
              />
              <button
                onClick={handleSaveNotes}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 1. Deal Overview */}
        <DealOverview deal={deal} analytics={analytics} repName={rep.name} />

        {/* 2. AI Risk Analysis */}
        <RiskAnalysis insights={riskInsights} />

        {/* 3 & 4: Two column layout for Timeline + Stakeholders */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ActivityTimeline entries={timeline} />
          <StakeholderMap stakeholders={stakeholderList} missingStakeholders={deal.missingStakeholders} />
        </div>

        {/* 5. Coaching Suggestions */}
        <CoachingSuggestions suggestions={suggestions} onSelectSuggestion={handleSelectSuggestion} />

        {/* 6. Coaching Request Panel */}
        <div id="coaching-panel">
          <CoachingRequestPanel
            dealName={deal.name}
            repName={rep.name}
            prefillTopic={coachingTopic}
            prefillReason={coachingReason}
          />
        </div>
      </main>
    </div>
  );
};

export default DealAnalytics;
