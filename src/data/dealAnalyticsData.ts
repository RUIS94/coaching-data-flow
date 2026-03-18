import type { Deal, RiskLevel } from "./dashboardData";

export type InteractionType = "Meeting" | "Email" | "Phone Call" | "Slack Message";
export type StakeholderRole = "Decision Maker" | "Influencer" | "Champion" | "Economic Buyer" | "Technical Evaluator";
export type EngagementLevel = "High" | "Medium" | "Low" | "None";

export interface TimelineEntry {
  id: string;
  dealId: string;
  type: InteractionType;
  date: string;
  time: string;
  participants: string[];
  summary: string;
}

export interface Stakeholder {
  id: string;
  dealId: string;
  name: string;
  title: string;
  role: StakeholderRole;
  engagement: EngagementLevel;
  lastActive: string | null;
  email: string;
}

export interface RiskInsight {
  id: string;
  dealId: string;
  description: string;
  impact: string;
  suggestedStep: string;
  severity: RiskLevel;
}

export interface CoachingSuggestion {
  id: string;
  dealId: string;
  topic: string;
  reason: string;
  questions: string[];
}

export interface CoachingRequest {
  id: string;
  dealId: string;
  topic: string;
  notes: string;
  materials: string[];
  status: "Draft" | "Sent" | "Scheduled";
  createdAt: string;
}

export interface DealAnalytics {
  dealId: string;
  stakeholderEngagement: EngagementLevel;
  communicationActivity: EngagementLevel;
  expectedCloseDate: string;
  qualificationScore: number; // 0-100
}

// --- Mock Data ---

export const dealAnalytics: Record<string, DealAnalytics> = {
  "deal-1": { dealId: "deal-1", stakeholderEngagement: "Low", communicationActivity: "Medium", expectedCloseDate: "2026-04-15", qualificationScore: 45 },
  "deal-2": { dealId: "deal-2", stakeholderEngagement: "Medium", communicationActivity: "High", expectedCloseDate: "2026-04-30", qualificationScore: 68 },
  "deal-3": { dealId: "deal-3", stakeholderEngagement: "High", communicationActivity: "High", expectedCloseDate: "2026-03-25", qualificationScore: 92 },
  "deal-4": { dealId: "deal-4", stakeholderEngagement: "Low", communicationActivity: "Low", expectedCloseDate: "2026-05-30", qualificationScore: 25 },
  "deal-5": { dealId: "deal-5", stakeholderEngagement: "None", communicationActivity: "Low", expectedCloseDate: "2026-05-15", qualificationScore: 20 },
  "deal-6": { dealId: "deal-6", stakeholderEngagement: "High", communicationActivity: "High", expectedCloseDate: "2026-03-28", qualificationScore: 88 },
  "deal-7": { dealId: "deal-7", stakeholderEngagement: "Medium", communicationActivity: "Medium", expectedCloseDate: "2026-04-20", qualificationScore: 55 },
  "deal-8": { dealId: "deal-8", stakeholderEngagement: "High", communicationActivity: "High", expectedCloseDate: "2026-03-20", qualificationScore: 95 },
  "deal-9": { dealId: "deal-9", stakeholderEngagement: "None", communicationActivity: "None", expectedCloseDate: "2026-06-30", qualificationScore: 10 },
  "deal-10": { dealId: "deal-10", stakeholderEngagement: "Medium", communicationActivity: "Medium", expectedCloseDate: "2026-05-01", qualificationScore: 58 },
  "deal-11": { dealId: "deal-11", stakeholderEngagement: "Low", communicationActivity: "Low", expectedCloseDate: "2026-04-10", qualificationScore: 35 },
  "deal-12": { dealId: "deal-12", stakeholderEngagement: "High", communicationActivity: "High", expectedCloseDate: "2026-03-30", qualificationScore: 85 },
  "deal-13": { dealId: "deal-13", stakeholderEngagement: "Medium", communicationActivity: "Medium", expectedCloseDate: "2026-05-10", qualificationScore: 50 },
  "deal-14": { dealId: "deal-14", stakeholderEngagement: "High", communicationActivity: "High", expectedCloseDate: "2026-03-18", qualificationScore: 97 },
  "deal-15": { dealId: "deal-15", stakeholderEngagement: "None", communicationActivity: "Low", expectedCloseDate: "2026-06-15", qualificationScore: 15 },
};

export const timelineEntries: TimelineEntry[] = [
  { id: "tl-1", dealId: "deal-1", type: "Email", date: "2026-03-05", time: "14:30", participants: ["Marcus Johnson", "John Smith (Acme)"], summary: "Follow-up on pricing proposal. Client requested additional discount tiers for enterprise volume." },
  { id: "tl-2", dealId: "deal-1", type: "Meeting", date: "2026-03-02", time: "10:00", participants: ["Marcus Johnson", "Jane Doe (Acme)", "VP Sales"], summary: "Demo walkthrough with stakeholder group. Positive reception but CFO was absent." },
  { id: "tl-3", dealId: "deal-1", type: "Phone Call", date: "2026-02-27", time: "16:00", participants: ["Marcus Johnson", "John Smith (Acme)"], summary: "Champion confirmed budget availability but needs CFO sign-off before proceeding." },
  { id: "tl-4", dealId: "deal-1", type: "Slack Message", date: "2026-02-25", time: "09:15", participants: ["Marcus Johnson", "Sales Engineering"], summary: "Requested technical specs for custom integration requirements from Acme's IT team." },
  { id: "tl-5", dealId: "deal-2", type: "Meeting", date: "2026-03-10", time: "11:00", participants: ["Emily Rodriguez", "VP Sales (TechFlow)"], summary: "Completed full platform demo. VP was impressed with analytics capabilities." },
  { id: "tl-6", dealId: "deal-2", type: "Email", date: "2026-03-08", time: "13:45", participants: ["Emily Rodriguez", "Procurement (TechFlow)"], summary: "Sent revised proposal with volume discount structure as requested." },
  { id: "tl-7", dealId: "deal-3", type: "Meeting", date: "2026-03-12", time: "09:00", participants: ["Sarah Chen", "Legal (Global Systems)", "CRO"], summary: "Contract redline review session. Minor terms adjustments, moving to final signature." },
  { id: "tl-8", dealId: "deal-4", type: "Meeting", date: "2026-02-28", time: "14:00", participants: ["Marcus Johnson", "IT Director (Nexus)"], summary: "Initial discovery call. Identified pain points around legacy system migration." },
  { id: "tl-9", dealId: "deal-4", type: "Email", date: "2026-02-22", time: "10:30", participants: ["Marcus Johnson", "CTO (Nexus)"], summary: "Outreach email to CTO. No response received yet." },
  { id: "tl-10", dealId: "deal-5", type: "Phone Call", date: "2026-03-01", time: "11:00", participants: ["Jessica Taylor"], summary: "Left voicemail with champion. Third attempt with no callback." },
  { id: "tl-11", dealId: "deal-7", type: "Meeting", date: "2026-03-08", time: "15:00", participants: ["Alex Patel", "HR Director (PeopleFirst)", "Legal"], summary: "Negotiation on contract terms. Security questionnaire remains the blocker." },
  { id: "tl-12", dealId: "deal-9", type: "Email", date: "2026-02-25", time: "08:00", participants: ["Jessica Taylor", "VP CS (RetainIQ)"], summary: "Third follow-up email sent. No response to any prior outreach attempts." },
  { id: "tl-13", dealId: "deal-11", type: "Meeting", date: "2026-03-03", time: "16:00", participants: ["Marcus Johnson", "CIO (ConnectAll)"], summary: "Competitor entered evaluation late. Need to reinforce differentiators urgently." },
  { id: "tl-14", dealId: "deal-15", type: "Email", date: "2026-03-02", time: "12:00", participants: ["Jessica Taylor"], summary: "Champion went on extended leave. Attempting to identify alternate internal sponsor." },
];

export const stakeholders: Stakeholder[] = [
  { id: "sh-1", dealId: "deal-1", name: "John Smith", title: "VP Operations", role: "Champion", engagement: "High", lastActive: "2026-03-05", email: "john.smith@acme.com" },
  { id: "sh-2", dealId: "deal-1", name: "Jane Doe", title: "Director of IT", role: "Technical Evaluator", engagement: "Medium", lastActive: "2026-03-02", email: "jane.doe@acme.com" },
  { id: "sh-3", dealId: "deal-1", name: "Robert CFO", title: "CFO", role: "Economic Buyer", engagement: "None", lastActive: null, email: "robert@acme.com" },
  { id: "sh-4", dealId: "deal-1", name: "Linda VP Eng", title: "VP Engineering", role: "Decision Maker", engagement: "None", lastActive: null, email: "linda@acme.com" },
  { id: "sh-5", dealId: "deal-2", name: "Mike VP Sales", title: "VP Sales", role: "Champion", engagement: "High", lastActive: "2026-03-10", email: "mike@techflow.com" },
  { id: "sh-6", dealId: "deal-2", name: "Procurement Lead", title: "Head of Procurement", role: "Economic Buyer", engagement: "Low", lastActive: "2026-02-20", email: "proc@techflow.com" },
  { id: "sh-7", dealId: "deal-3", name: "Anna CRO", title: "Chief Revenue Officer", role: "Decision Maker", engagement: "High", lastActive: "2026-03-12", email: "anna@globalsystems.com" },
  { id: "sh-8", dealId: "deal-3", name: "Legal Counsel", title: "General Counsel", role: "Influencer", engagement: "High", lastActive: "2026-03-12", email: "legal@globalsystems.com" },
  { id: "sh-9", dealId: "deal-4", name: "IT Director", title: "IT Director", role: "Technical Evaluator", engagement: "Medium", lastActive: "2026-02-28", email: "it@nexus.com" },
  { id: "sh-10", dealId: "deal-4", name: "CTO Nexus", title: "CTO", role: "Decision Maker", engagement: "None", lastActive: null, email: "cto@nexus.com" },
  { id: "sh-11", dealId: "deal-5", name: "CISO FinServ", title: "CISO", role: "Decision Maker", engagement: "None", lastActive: null, email: "ciso@finserv.com" },
  { id: "sh-12", dealId: "deal-5", name: "Compliance Officer", title: "VP Compliance", role: "Influencer", engagement: "None", lastActive: null, email: "compliance@finserv.com" },
  { id: "sh-13", dealId: "deal-7", name: "CHRO PeopleFirst", title: "CHRO", role: "Decision Maker", engagement: "Low", lastActive: "2026-02-15", email: "chro@peoplefirst.com" },
  { id: "sh-14", dealId: "deal-7", name: "HR Director", title: "HR Director", role: "Champion", engagement: "High", lastActive: "2026-03-08", email: "hr@peoplefirst.com" },
  { id: "sh-15", dealId: "deal-9", name: "VP CS RetainIQ", title: "VP Customer Success", role: "Champion", engagement: "None", lastActive: null, email: "vpcs@retainiq.com" },
  { id: "sh-16", dealId: "deal-11", name: "CIO ConnectAll", title: "CIO", role: "Decision Maker", engagement: "Medium", lastActive: "2026-03-03", email: "cio@connectall.com" },
];

export const riskInsights: RiskInsight[] = [
  { id: "ri-1", dealId: "deal-1", description: "CFO and VP Engineering have not been engaged", impact: "Deal cannot proceed to signature without financial and technical approval", suggestedStep: "Request champion to arrange introductions to CFO and VP Engineering", severity: "High" },
  { id: "ri-2", dealId: "deal-1", description: "Deal has been in Negotiation stage for 28 days", impact: "Extended negotiation increases risk of competitor entry and budget reallocation", suggestedStep: "Set a mutual close plan with specific milestones and deadlines", severity: "Medium" },
  { id: "ri-3", dealId: "deal-1", description: "Pricing concerns raised but not resolved", impact: "Unresolved pricing objections can stall or kill the deal", suggestedStep: "Prepare tiered pricing options and schedule pricing review call", severity: "High" },
  { id: "ri-4", dealId: "deal-2", description: "Procurement lead has low engagement", impact: "Procurement bottleneck could delay or block purchase order", suggestedStep: "Engage procurement early with ROI documentation and compliance materials", severity: "Medium" },
  { id: "ri-5", dealId: "deal-2", description: "No formal proposal feedback received yet", impact: "Lack of feedback may indicate internal competing priorities", suggestedStep: "Follow up with champion on internal review timeline", severity: "Low" },
  { id: "ri-6", dealId: "deal-4", description: "CTO has not responded to any outreach", impact: "Without CTO buy-in, technical decision cannot be made", suggestedStep: "Leverage IT Director relationship to get warm introduction to CTO", severity: "High" },
  { id: "ri-7", dealId: "deal-4", description: "No activity in 13 days", impact: "Momentum loss leads to deal stalling and potential loss", suggestedStep: "Send a value-reinforcing case study relevant to their migration needs", severity: "High" },
  { id: "ri-8", dealId: "deal-5", description: "Champion unresponsive after 3 contact attempts", impact: "Without champion engagement, deal has no internal advocate", suggestedStep: "Escalate through executive sponsor or identify alternate champion", severity: "High" },
  { id: "ri-9", dealId: "deal-5", description: "CISO and Compliance Officer never engaged", impact: "Security and compliance deals require both roles for approval", suggestedStep: "Request introductions via any existing contact at FinServ Partners", severity: "High" },
  { id: "ri-10", dealId: "deal-7", description: "Security questionnaire blocking contract finalization", impact: "Delays in security review extend the sales cycle significantly", suggestedStep: "Proactively complete security questionnaire and schedule review session", severity: "Medium" },
  { id: "ri-11", dealId: "deal-7", description: "CHRO engagement is low, last active 3 weeks ago", impact: "Decision maker disengagement signals potential priority shift", suggestedStep: "Request champion to re-engage CHRO with updated business case", severity: "Medium" },
  { id: "ri-12", dealId: "deal-9", description: "Zero response to all outreach attempts", impact: "Deal is effectively stalled with no path forward", suggestedStep: "Consider executive-to-executive outreach or pause the deal", severity: "High" },
  { id: "ri-13", dealId: "deal-11", description: "Competitor entered evaluation late in the cycle", impact: "Late competitor entry can reset the evaluation and extend timeline", suggestedStep: "Arrange executive sponsor dinner and reinforce unique differentiators", severity: "High" },
  { id: "ri-14", dealId: "deal-15", description: "Internal champion went on extended leave", impact: "Loss of champion means no one is advocating internally for the deal", suggestedStep: "Identify and build relationship with alternate internal sponsor", severity: "High" },
];

export const coachingSuggestions: CoachingSuggestion[] = [
  { id: "cs-1", dealId: "deal-1", topic: "Expanding Stakeholder Coverage", reason: "Two critical stakeholders (CFO, VP Eng) remain unengaged", questions: ["What's preventing access to the CFO?", "Can the champion facilitate introductions?", "What's the VP Engineering's main concern likely to be?"] },
  { id: "cs-2", dealId: "deal-1", topic: "Handling Pricing Objections", reason: "Client raised pricing concerns that haven't been addressed", questions: ["What specific pricing pushback did they give?", "Have you explored value-based selling approaches?", "What's their budget range compared to our proposal?"] },
  { id: "cs-3", dealId: "deal-1", topic: "Strengthening Next Steps", reason: "Deal has been in negotiation for 28 days without clear milestones", questions: ["Do you have a mutual action plan?", "What are the three things that need to happen for this deal to close?", "Have you confirmed the decision timeline with the buyer?"] },
  { id: "cs-4", dealId: "deal-2", topic: "Engaging Procurement Early", reason: "Procurement lead has low engagement which could create bottleneck", questions: ["Have you identified procurement's evaluation criteria?", "What compliance documentation do they typically require?", "Can your champion introduce you to procurement?"] },
  { id: "cs-5", dealId: "deal-4", topic: "Improving Deal Qualification", reason: "Low qualification score (25%) indicates gaps in discovery", questions: ["What business problem are they trying to solve?", "Have you confirmed budget, authority, need, and timeline?", "Who is the economic buyer?"] },
  { id: "cs-6", dealId: "deal-4", topic: "Re-engaging Silent Stakeholders", reason: "CTO hasn't responded to any outreach attempts", questions: ["What messaging approach have you tried?", "Is there a mutual connection who could make an introduction?", "Have you tried a different communication channel?"] },
  { id: "cs-7", dealId: "deal-5", topic: "Champion Recovery Strategy", reason: "Primary champion is unresponsive after multiple attempts", questions: ["When did communication first drop off?", "Are there other contacts at the account?", "Should we consider an executive-level re-engagement?"] },
  { id: "cs-8", dealId: "deal-7", topic: "Overcoming Security Blockers", reason: "Security questionnaire is delaying contract finalization", questions: ["Do we have a pre-filled security questionnaire template?", "Can our security team join a call with their team?", "What are their top security concerns?"] },
  { id: "cs-9", dealId: "deal-9", topic: "Deal Viability Assessment", reason: "Zero engagement from any stakeholder for over 2 weeks", questions: ["Is this deal still viable or should we deprioritize?", "Have we exhausted all contact paths?", "What would a re-engagement strategy look like?"] },
  { id: "cs-10", dealId: "deal-11", topic: "Competitive Positioning", reason: "Late-stage competitor entry threatens deal outcome", questions: ["What differentiators matter most to this buyer?", "Do you know which competitor and their strengths/weaknesses?", "Have you reconfirmed the buyer's evaluation criteria?"] },
  { id: "cs-11", dealId: "deal-15", topic: "Building Alternate Champions", reason: "Primary champion is on leave with no backup advocate", questions: ["Who else in the organization showed interest during earlier interactions?", "Can you reach out to the champion's manager or peer?", "Is there a project team member who could serve as interim champion?"] },
];

export const getDealTimeline = (dealId: string) => timelineEntries.filter((t) => t.dealId === dealId);
export const getDealStakeholders = (dealId: string) => stakeholders.filter((s) => s.dealId === dealId);
export const getDealRiskInsights = (dealId: string) => riskInsights.filter((r) => r.dealId === dealId);
export const getDealCoachingSuggestions = (dealId: string) => coachingSuggestions.filter((c) => c.dealId === dealId);
export const getDealAnalytics = (dealId: string) => dealAnalytics[dealId] || null;
