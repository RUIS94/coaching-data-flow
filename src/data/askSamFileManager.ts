export const fileManagerAskSamQuestions = [
  "Which deals need coaching?",
  "Which deals are highest risk this week?",
  "What's our commit at risk?",
  "Give me a prioritized follow-up list",
  "Top deals by amount",
];

export function fileManagerAskSamAnswer(q: string): string {
  const lq = q.toLowerCase();
  if (lq.includes("coaching")) {
    return [
      "Deals recommended for coaching:",
      "• deal-4 Cloud Migration Package (low qualification; CTO not engaged)",
      "• deal-5 Security Compliance Module (missing key stakeholders; stalled)",
      "• deal-9 RetainIQ (no response; consider executive outreach)",
    ].join("\n");
  }
  if (lq.includes("risk")) {
    return [
      "Highest-risk deals:",
      "• deal-1 Enterprise Platform License (pricing objections; finance/technical approvals missing)",
      "• deal-5 Security Compliance Module (champion unresponsive; security/compliance not involved)",
      "• deal-9 RetainIQ (no engagement across channels)",
    ].join("\n");
  }
  if (lq.includes("commit")) {
    return "Commit at Risk: 2 (both under rep-2; prioritize pricing and security materials this week)";
  }
  if (lq.includes("priorit") || lq.includes("follow-up")) {
    return [
      "Prioritized follow-up list:",
      "1) deal-1: schedule exec alignment + pricing review",
      "2) deal-7: complete security questionnaire and set review",
      "3) deal-4: deepen discovery; confirm economic buyer",
    ].join("\n");
  }
  if (lq.includes("top") || lq.includes("amount") || lq.includes("value")) {
    return [
      "Top deals by amount:",
      "• deal-3 Data Analytics Suite: $200k (Commit)",
      "• deal-1 Enterprise Platform License: $120k (Commit at Risk)",
      "• deal-4 Cloud Migration Package: $95k (Discovery)",
    ].join("\n");
  }
  return "Got it. Based on current data, prioritize high-value deals with missing key stakeholders. Pick a recommended question above for a detailed list.";
}

