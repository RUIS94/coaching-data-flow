import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Check, List } from 'lucide-react';

interface DiscussionPoint {
  content: string;
  objective: string;
  keyResults: string[];
  qualificationQuestions?: string[];
  usageMeetings?: string[];
  usageCount?: number;
}

interface PastDiscussionPointsProps {
  onClose: () => void;
  onSave: (selectedPoints: DiscussionPoint[]) => void;
  dealName?: string;
}

const PastDiscussionPoints: React.FC<PastDiscussionPointsProps> = ({ onClose, onSave, dealName }) => {
  // Mock data similar to Step2's mockAIPoints
  const [pastPoints] = useState<DiscussionPoint[]>([
    {
      content: "Discuss technology market trends and opportunities",
      objective: "Understand current market dynamics and identify growth opportunities",
      keyResults: ["Market analysis report completed", "3 key opportunities identified", "Competitive positioning strategy developed"],
      qualificationQuestions: ["What are your current pain points with existing solutions?", "How do you measure success in this area?"],
      usageMeetings: ["2024-01-20 - Q1 Strategy Sync", "2024-01-18 - CRM Evaluation Call", "2024-01-15 - Budget Review"],
      usageCount: 8
    },
    {
      content: "Present our CRM Solutions benefits",
      objective: "Demonstrate value proposition and ROI of our solutions",
      keyResults: ["Solution demo completed", "ROI calculations presented", "Client questions addressed"],
      qualificationQuestions: ["What is your budget range for this solution?", "What criteria will you use to evaluate solutions?"],
      usageMeetings: ["2024-01-18 - CRM Evaluation Call", "2024-01-17 - Sales Kickoff"],
      usageCount: 5
    },
    {
      content: "Address competitive advantages over key competitors",
      objective: "Position our solution as the superior choice in the market",
      keyResults: ["Competitive comparison chart created", "Unique differentiators highlighted", "Objections handled effectively"],
      qualificationQuestions: ["What other solutions are you considering?", "What would make you choose one vendor over another?"],
      usageMeetings: ["2024-01-16 - Vendor Evaluation", "2024-01-14 - Competitive Landscape Review", "2024-01-12 - QBR"],
      usageCount: 9
    },
    {
      content: "Explore implementation timeline for enterprise organization",
      objective: "Define realistic project timeline and resource requirements",
      keyResults: ["Implementation roadmap created", "Resource allocation plan finalized", "Milestone definitions established"],
      qualificationQuestions: ["What is your ideal implementation timeline?", "Are there any seasonal considerations?"],
      usageMeetings: ["2024-01-10 - Implementation Planning", "2024-01-08 - Enterprise Rollout"],
      usageCount: 3
    },
    {
      content: "Review ROI projections and success metrics",
      objective: "Establish clear success criteria and expected returns",
      keyResults: ["ROI model validated", "KPIs defined and agreed", "Success metrics established"],
      qualificationQuestions: ["How do you currently measure success?", "What ROI are you expecting from this investment?"],
      usageMeetings: ["2024-01-07 - Finance Alignment", "2024-01-06 - Executive Review"],
      usageCount: 7
    },
    {
      content: "Discuss integration with existing product portfolio",
      objective: "Ensure seamless integration with current systems",
      keyResults: ["Integration plan documented", "Technical requirements clarified", "Timeline established"],
      qualificationQuestions: ["What are your current integration challenges?", "How do you typically evaluate technical compatibility?"],
      usageMeetings: ["2024-01-05 - Technical Deep Dive", "2024-01-04 - Systems Integration"],
      usageCount: 6
    },
    {
      content: "Plan next steps and decision-making process",
      objective: "Define clear path forward and decision timeline",
      keyResults: ["Action items assigned", "Decision criteria established", "Follow-up scheduled"],
      qualificationQuestions: ["What is your decision-making process?", "Who has the final decision-making authority?"],
      usageMeetings: ["2024-01-03 - Decision Workshop", "2024-01-02 - Stakeholder Alignment"],
      usageCount: 10
    },
    {
      content: "Address technical requirements and support needs",
      objective: "Clarify technical specifications and ongoing support expectations",
      keyResults: ["Technical specs documented", "Support model defined", "SLA requirements agreed"],
      qualificationQuestions: ["What are your technical requirements?", "What level of support do you expect?"],
      usageMeetings: ["2024-01-01 - Support Planning", "2023-12-30 - SLA Review"],
      usageCount: 4
    }
  ]);

  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const toggleExpansion = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleSave = () => {
    const selectedPoints = Array.from(selectedItems).map(index => pastPoints[index]);
    onSave(selectedPoints);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <List size={20} className="text-[#605BFF]" />
            <h3 className="text-xl font-semibold text-gray-900">
              Past Discussion Points{dealName ? ` (${dealName})` : ''}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            {pastPoints.map((point, index) => {
              const isExpanded = expandedItems.has(index);
              const isSelected = selectedItems.has(index);
              
              return (
                <div 
                  key={index}
                  className={`rounded-lg transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-[#605BFF]/5' : ''
                  }`}
                  onClick={() => toggleExpansion(index)}
                >
                  <div className="p-4">
                    {/* Top row: checkbox + title + usage */}
                    <div className="flex gap-3 items-center">
                      {/* Checkbox column, vertically centered relative to the two lines */}
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection(index);
                          }}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-[#605BFF] border-[#605BFF] text-white' 
                              : 'border-gray-300 hover:border-[#605BFF]'
                          }`}
                        >
                          {isSelected && <Check size={14} />}
                        </button>
                      </div>

                      {/* Right column: title + usage lines */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">{point.content}</div>
                          <div className="p-1">
                            {isExpanded ? (
                              <ChevronDown size={20} className="text-gray-600" />
                            ) : (
                              <ChevronRight size={20} className="text-gray-600" />
                            )}
                          </div>
                        </div>
                        {point.usageMeetings && point.usageMeetings.length > 0 && (
                          <div className="mt-1 text-xs text-gray-600">
                            Used in: {point.usageMeetings.slice(0, 3).join(', ')}
                            {typeof point.usageCount === 'number' && point.usageCount > point.usageMeetings.length ? (
                              <span>{` (total ${point.usageCount} times)`}</span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded content placed outside the top row so checkbox aligns to title+usage only */}
                    {isExpanded && (
                      // Indent expanded content to align with the title start (to the right of checkbox)
                      <div className="mt-3 ml-8 space-y-3 text-sm">
                        {/* Objective */}
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">Objective:</div>
                          <div className="text-gray-600">{point.objective}</div>
                        </div>
                        
                        {/* Key Results */}
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">Key Results:</div>
                          <div className="text-gray-600">
                            {point.keyResults.map((result, resultIndex) => (
                              <div key={resultIndex} className="flex items-start gap-1 mb-1">
                                <span className="text-gray-400 mt-0.5">•</span>
                                <span>{result}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* My Qualification Questions */}
                        {point.qualificationQuestions && point.qualificationQuestions.length > 0 && (
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">My Qualification Questions:</div>
                            <div className="text-gray-600">
                              {point.qualificationQuestions.map((question, questionIndex) => (
                                <div key={questionIndex} className="flex items-start gap-1 mb-1">
                                  <span className="text-gray-400 mt-0.5">•</span>
                                  <span>{question}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={selectedItems.size === 0}
                className="px-4 py-2 bg-[#605BFF] text-white rounded-lg hover:bg-[#5248FF] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Save Selected Points
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastDiscussionPoints;