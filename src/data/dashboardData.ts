export type RiskLevel = "High" | "Medium" | "Low";
export type DealStage = "Discovery" | "Qualification" | "Proposal" | "Negotiation" | "Commit" | "Closed Won" | "Closed Lost";
export type CommitStatus = "Commit" | "Commit at Risk" | "Best Case" | "Pipeline" | null;

export interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: DealStage;
  riskLevel: RiskLevel;
  commitStatus: CommitStatus;
  lastActivityDate: string;
  lastInteraction: string;
  nextSteps: string;
  missingStakeholders: string[];
  repId: string;
  markedForCoaching: boolean;
  daysInStage: number;
}

export interface SalesRep {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
  dealHealthScore: RiskLevel;
  totalDeals: number;
  dealsAtRisk: number;
  dealsInCommit: number;
  dealsCommitAtRisk: number;
  quota: number;
  pipeline: number;
}

export const salesReps: SalesRep[] = [
  {
    id: "rep-1",
    name: "Sarah Chen",
    avatar: "SC",
    role: "Senior AE",
    email: "sarah.chen@company.com",
    dealHealthScore: "High",
    totalDeals: 12,
    dealsAtRisk: 1,
    dealsInCommit: 4,
    dealsCommitAtRisk: 0,
    quota: 500000,
    pipeline: 680000,
  },
  {
    id: "rep-2",
    name: "Marcus Johnson",
    avatar: "MJ",
    role: "Account Executive",
    email: "marcus.j@company.com",
    dealHealthScore: "Low",
    totalDeals: 9,
    dealsAtRisk: 4,
    dealsInCommit: 2,
    dealsCommitAtRisk: 2,
    quota: 400000,
    pipeline: 310000,
  },
  {
    id: "rep-3",
    name: "Emily Rodriguez",
    avatar: "ER",
    role: "Account Executive",
    email: "emily.r@company.com",
    dealHealthScore: "Medium",
    totalDeals: 11,
    dealsAtRisk: 2,
    dealsInCommit: 3,
    dealsCommitAtRisk: 1,
    quota: 450000,
    pipeline: 520000,
  },
  {
    id: "rep-4",
    name: "David Kim",
    avatar: "DK",
    role: "Senior AE",
    email: "david.kim@company.com",
    dealHealthScore: "High",
    totalDeals: 14,
    dealsAtRisk: 1,
    dealsInCommit: 5,
    dealsCommitAtRisk: 0,
    quota: 550000,
    pipeline: 720000,
  },
  {
    id: "rep-5",
    name: "Jessica Taylor",
    avatar: "JT",
    role: "Account Executive",
    email: "jessica.t@company.com",
    dealHealthScore: "Low",
    totalDeals: 7,
    dealsAtRisk: 3,
    dealsInCommit: 1,
    dealsCommitAtRisk: 1,
    quota: 350000,
    pipeline: 220000,
  },
  {
    id: "rep-6",
    name: "Alex Patel",
    avatar: "AP",
    role: "Account Executive",
    email: "alex.p@company.com",
    dealHealthScore: "Medium",
    totalDeals: 10,
    dealsAtRisk: 2,
    dealsInCommit: 3,
    dealsCommitAtRisk: 1,
    quota: 400000,
    pipeline: 450000,
  },
];

export const deals: Deal[] = [
  {
    id: "deal-1",
    name: "Enterprise Platform License",
    company: "Acme Corp",
    value: 120000,
    stage: "Negotiation",
    riskLevel: "High",
    commitStatus: "Commit at Risk",
    lastActivityDate: "2026-03-05",
    lastInteraction: "Email follow-up on pricing sent",
    nextSteps: "Schedule executive alignment call",
    missingStakeholders: ["CFO", "VP Engineering"],
    repId: "rep-2",
    markedForCoaching: false,
    daysInStage: 28,
  },
  {
    id: "deal-2",
    name: "Annual SaaS Subscription",
    company: "TechFlow Inc",
    value: 85000,
    stage: "Proposal",
    riskLevel: "Medium",
    commitStatus: "Best Case",
    lastActivityDate: "2026-03-10",
    lastInteraction: "Demo completed with VP Sales",
    nextSteps: "Send revised proposal with volume discount",
    missingStakeholders: ["Procurement Lead"],
    repId: "rep-3",
    markedForCoaching: false,
    daysInStage: 14,
  },
  {
    id: "deal-3",
    name: "Data Analytics Suite",
    company: "Global Systems Ltd",
    value: 200000,
    stage: "Commit",
    riskLevel: "Low",
    commitStatus: "Commit",
    lastActivityDate: "2026-03-12",
    lastInteraction: "Contract redline reviewed",
    nextSteps: "Final legal review and signature",
    missingStakeholders: [],
    repId: "rep-1",
    markedForCoaching: false,
    daysInStage: 7,
  },
  {
    id: "deal-4",
    name: "Cloud Migration Package",
    company: "Nexus Digital",
    value: 95000,
    stage: "Discovery",
    riskLevel: "High",
    commitStatus: "Pipeline",
    lastActivityDate: "2026-02-28",
    lastInteraction: "Initial discovery call completed",
    nextSteps: "Schedule technical deep dive",
    missingStakeholders: ["CTO", "IT Director"],
    repId: "rep-2",
    markedForCoaching: true,
    daysInStage: 21,
  },
  {
    id: "deal-5",
    name: "Security Compliance Module",
    company: "FinServ Partners",
    value: 150000,
    stage: "Qualification",
    riskLevel: "High",
    commitStatus: "Pipeline",
    lastActivityDate: "2026-03-01",
    lastInteraction: "Left voicemail with champion",
    nextSteps: "Re-engage through alternate contact",
    missingStakeholders: ["CISO", "Compliance Officer"],
    repId: "rep-5",
    markedForCoaching: false,
    daysInStage: 18,
  },
  {
    id: "deal-6",
    name: "Marketing Automation Platform",
    company: "BrightPath Media",
    value: 72000,
    stage: "Proposal",
    riskLevel: "Low",
    commitStatus: "Commit",
    lastActivityDate: "2026-03-11",
    lastInteraction: "Business case presented to CMO",
    nextSteps: "Await internal budget approval",
    missingStakeholders: [],
    repId: "rep-4",
    markedForCoaching: false,
    daysInStage: 10,
  },
  {
    id: "deal-7",
    name: "HR Management System",
    company: "PeopleFirst Inc",
    value: 110000,
    stage: "Negotiation",
    riskLevel: "Medium",
    commitStatus: "Commit at Risk",
    lastActivityDate: "2026-03-08",
    lastInteraction: "Negotiating contract terms",
    nextSteps: "Address security questionnaire",
    missingStakeholders: ["CHRO"],
    repId: "rep-6",
    markedForCoaching: false,
    daysInStage: 16,
  },
  {
    id: "deal-8",
    name: "Supply Chain Optimizer",
    company: "LogiTech Solutions",
    value: 180000,
    stage: "Commit",
    riskLevel: "Low",
    commitStatus: "Commit",
    lastActivityDate: "2026-03-12",
    lastInteraction: "Verbal agreement received",
    nextSteps: "Process PO and schedule onboarding",
    missingStakeholders: [],
    repId: "rep-1",
    markedForCoaching: false,
    daysInStage: 5,
  },
  {
    id: "deal-9",
    name: "Customer Success Platform",
    company: "RetainIQ",
    value: 65000,
    stage: "Discovery",
    riskLevel: "High",
    commitStatus: null,
    lastActivityDate: "2026-02-25",
    lastInteraction: "No response to last 3 emails",
    nextSteps: "Escalate through executive sponsor",
    missingStakeholders: ["VP Customer Success", "CEO"],
    repId: "rep-5",
    markedForCoaching: false,
    daysInStage: 30,
  },
  {
    id: "deal-10",
    name: "AI Insights Dashboard",
    company: "DataViz Pro",
    value: 88000,
    stage: "Qualification",
    riskLevel: "Medium",
    commitStatus: "Best Case",
    lastActivityDate: "2026-03-09",
    lastInteraction: "Technical evaluation in progress",
    nextSteps: "Provide sandbox environment access",
    missingStakeholders: ["Data Science Lead"],
    repId: "rep-3",
    markedForCoaching: false,
    daysInStage: 12,
  },
  {
    id: "deal-11",
    name: "Integration Hub License",
    company: "ConnectAll Systems",
    value: 135000,
    stage: "Negotiation",
    riskLevel: "High",
    commitStatus: "Commit at Risk",
    lastActivityDate: "2026-03-03",
    lastInteraction: "Competitor entered late in cycle",
    nextSteps: "Arrange executive sponsor dinner",
    missingStakeholders: ["CIO"],
    repId: "rep-2",
    markedForCoaching: false,
    daysInStage: 25,
  },
  {
    id: "deal-12",
    name: "Workflow Automation Suite",
    company: "Streamline Corp",
    value: 92000,
    stage: "Proposal",
    riskLevel: "Low",
    commitStatus: "Commit",
    lastActivityDate: "2026-03-11",
    lastInteraction: "Proposal well-received by committee",
    nextSteps: "Schedule final pricing discussion",
    missingStakeholders: [],
    repId: "rep-4",
    markedForCoaching: false,
    daysInStage: 8,
  },
  {
    id: "deal-13",
    name: "Employee Training Portal",
    company: "LearnCo",
    value: 55000,
    stage: "Qualification",
    riskLevel: "Medium",
    commitStatus: "Pipeline",
    lastActivityDate: "2026-03-07",
    lastInteraction: "Requirements gathering meeting",
    nextSteps: "Prepare customized demo",
    missingStakeholders: ["L&D Director"],
    repId: "rep-6",
    markedForCoaching: false,
    daysInStage: 11,
  },
  {
    id: "deal-14",
    name: "Revenue Intelligence Tool",
    company: "SalesForce Plus",
    value: 160000,
    stage: "Commit",
    riskLevel: "Low",
    commitStatus: "Commit",
    lastActivityDate: "2026-03-13",
    lastInteraction: "Contract sent for signature",
    nextSteps: "Follow up on DocuSign",
    missingStakeholders: [],
    repId: "rep-4",
    markedForCoaching: false,
    daysInStage: 4,
  },
  {
    id: "deal-15",
    name: "Compliance Tracker Pro",
    company: "RegTech Solutions",
    value: 78000,
    stage: "Discovery",
    riskLevel: "High",
    commitStatus: null,
    lastActivityDate: "2026-03-02",
    lastInteraction: "Champion went on leave",
    nextSteps: "Identify alternate champion",
    missingStakeholders: ["General Counsel", "Compliance VP"],
    repId: "rep-5",
    markedForCoaching: true,
    daysInStage: 22,
  },
];

export const getRepDeals = (repId: string) => deals.filter((d) => d.repId === repId);

export const getTeamSummary = () => {
  const totalDeals = deals.length;
  const highRiskDeals = deals.filter((d) => d.riskLevel === "High").length;
  const dealsNeedingAttention = deals.filter(
    (d) => d.riskLevel === "High" || d.riskLevel === "Medium"
  ).length;

  const healthScores = salesReps.map((r) => {
    if (r.dealHealthScore === "High") return 3;
    if (r.dealHealthScore === "Medium") return 2;
    return 1;
  });
  const avgHealth = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
  const teamAvgHealth: RiskLevel = avgHealth >= 2.5 ? "High" : avgHealth >= 1.5 ? "Medium" : "Low";

  const totalPipeline = salesReps.reduce((a, b) => a + b.pipeline, 0);
  const totalQuota = salesReps.reduce((a, b) => a + b.quota, 0);

  return {
    totalDeals,
    highRiskDeals,
    dealsNeedingAttention,
    teamAvgHealth,
    totalPipeline,
    totalQuota,
    repCount: salesReps.length,
  };
};
