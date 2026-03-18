import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Lightbulb, 
  Award, 
  MessageSquare, 
  Clock, 
  Users, 
  Brain,
  Star,
  ArrowRight,
  BookOpen,
  Play,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Zap,
  Shield,
  Eye,
  Mic,
  Volume2,
  Search,
  Filter,
  BarChart3,
  DollarSign,
  Settings,
  UserCheck,
  Trophy,
  AlertCircle,
  FileText
} from 'lucide-react';

interface QualificationSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  score: number;
  maxScore: number;
  whatWasUncovered: string[];
  gap: string[];
  recommendedQuestions: string[];
}

const QualificationEffectivenessTab: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedRecommendations, setExpandedRecommendations] = useState<boolean>(false);
  const [expandedConsequences, setExpandedConsequences] = useState<boolean>(false);

  // Sample recommendations data from backend
  const recommendations = [
    "David needs to understand the key business issues that Realtor are facing.",
    "David needs to follow up with Chris around mid to late July to see if Capa Services are needed.",
    "David needs to find out who are the key stakeholders involved in the decision making process.",
    "David needs to understand the specific metric Realtor is trying to improve."
  ];

  const qualificationSections: QualificationSection[] = [
    {
      id: 'issues',
      title: 'Issues, Implication & Influence',
      icon: null,
      score: 8,
      maxScore: 10,
      whatWasUncovered: [
        'Operational inefficiencies costing 23% productivity identified',
        'IT concerns about CRM integration and data migration understood',
        'Zero-downtime requirement for customer operations recognized',
        'Board focus on cash flow impact this quarter mentioned',
        'Competing with two other vendors in evaluation process'
      ],
      gap: [
        'Need for comprehensive risk assessment not fully explored',
        'Specific pain points of current inefficiencies not quantified',
        'Impact on customer satisfaction not discussed',
        'Regulatory compliance requirements not addressed'
      ],
      recommendedQuestions: [
        'What specific operational processes are causing the 23% efficiency loss?',
        'How is this inefficiency impacting your customer satisfaction scores?',
        'What compliance or regulatory requirements must we consider?',
        'What would happen if these inefficiencies continue for another quarter?'
      ]
    },
    {
      id: 'money',
      title: 'Money & Metrics',
      icon: null,
      score: 6,
      maxScore: 10,
      whatWasUncovered: [
        '23% efficiency improvement quantified from pilot program',
        '15% volume discount for expanded deployment confirmed',
        'ROI projections to be included in proposal mentioned',
        'Phased payment structure discussed as option'
      ],
      gap: [
        'Specific budget amount not confirmed',
        'Executive committee budget approval process unclear',
        'Cost of current inefficiencies not quantified',
        'Comparison with competitor pricing not established'
      ],
      recommendedQuestions: [
        'What is the allocated budget range for this initiative?',
        'How much is the current inefficiency costing you annually?',
        'What ROI threshold does the executive committee require?',
        'How do our competitors\' pricing proposals compare?'
      ]
    },
    {
      id: 'processes',
      title: 'Processes, Parameters & Priorities for Decision',
      icon: null,
      score: 7,
      maxScore: 10,
      whatWasUncovered: [
        'Executive committee presentation scheduled for next Friday',
        'Procurement team review process identified',
        'IT department technical assessment planned',
        'Customer reference calls planned'
      ],
      gap: [
        'Specific evaluation criteria not fully defined',
        'Decision-making timeline beyond presentation unclear',
        'Vendor scoring methodology not understood',
        'Final decision authority not confirmed'
      ],
      recommendedQuestions: [
        'What specific criteria will the executive committee use to evaluate vendors?',
        'How will vendors be scored and ranked in the evaluation?',
        'What is the timeline from presentation to final decision?',
        'Who has the final authority to approve the vendor selection?'
      ]
    },
    {
      id: 'access',
      title: 'Access To Decision Makers',
      icon: null,
      score: 8,
      maxScore: 10,
      whatWasUncovered: [
        'Direct access to CFO (Robert Chen) - budget decision maker',
        'Strong relationship with VP Operations (Jennifer Walsh)',
        'Procurement Director (Lisa Martinez) involvement confirmed',
        'IT Director participation scheduled',
        'Executive committee presentation opportunity secured'
      ],
      gap: [
        'Board-level visibility limited to CFO reporting',
        'Other executive committee members not identified',
        'Influencers outside the core team not mapped',
        'Decision-making hierarchy not fully understood'
      ],
      recommendedQuestions: [
        'Who else sits on the executive committee that will evaluate this?',
        'Are there other stakeholders who could influence this decision?',
        'How does the board typically get involved in decisions of this size?',
        'What is the reporting structure from committee to final approval?'
      ]
    },
    {
      id: 'competition',
      title: 'Competition, Champion & Coach',
      icon: null,
      score: 5,
      maxScore: 10,
      whatWasUncovered: [
        'Two other vendors identified in evaluation process',
        'Jennifer Walsh (VP Operations) identified as champion',
        'Robert Chen (CFO) focused on financial metrics',
        'Competitive differentiators mentioned (99.9% uptime, 98% retention)'
      ],
      gap: [
        'Specific competitor names and strengths unknown',
        'Coach relationship not established within organization',
        'Competitor pricing and proposals not understood',
        'Internal politics and preferences not mapped'
      ],
      recommendedQuestions: [
        'Which specific vendors are you evaluating against us?',
        'What are their key strengths and how are they positioning?',
        'Who internally might provide insights on the evaluation process?',
        'What has been your experience with similar vendor selections?'
      ]
    },
    {
      id: 'timing',
      title: 'Timing & Timeframe',
      icon: null,
      score: 9,
      maxScore: 10,
      whatWasUncovered: [
        'Detailed proposal due by end of day Thursday',
        'Follow-up meeting scheduled for next Tuesday at 2 PM EST',
        'Executive committee presentation next Friday',
        'Q4 planning alignment with 8-week implementation timeline',
        'Site visit to Chicago customer location planned'
      ],
      gap: [
        'Backup timeline if primary schedule slips not discussed',
        'Seasonal or business cycle impacts not considered',
        'Implementation resource availability not confirmed'
      ],
      recommendedQuestions: [
        'What happens if the decision timeline needs to be extended?',
        'Are there any seasonal factors that could impact implementation?',
        'Do you have the internal resources available for the proposed timeline?',
        'What would cause you to delay or accelerate this decision?'
      ]
    }
  ];

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const overallScore = qualificationSections.reduce((sum, section) => sum + section.score, 0);
  const maxOverallScore = qualificationSections.reduce((sum, section) => sum + section.maxScore, 0);
  const overallPercentage = Math.round((overallScore / maxOverallScore) * 100);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="space-y-6">
      {/* Qualification Sections */}
      <div className="space-y-4">
        {qualificationSections.map((section) => {
          const percentage = Math.round((section.score / section.maxScore) * 100);
          const isExpanded = expandedSection === section.id;
          
          return (
            <div key={section.id} className="bg-white rounded-lg border border-gray-200">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-[#FF8E1C]">
                    {section.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    </div>
                  </div>
                </div>
                
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                }`} />
              </div>
              
              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="border-t border-gray-100 pt-4">
                    <div className="space-y-6">
                      {/* What Was Uncovered */}
                      <div>
                        <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          What Was Uncovered
                        </h4>
                        <div className="space-y-2 ml-6">
                          {section.whatWasUncovered.map((item, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Gap */}
                      <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Gap
                        </h4>
                        <div className="space-y-2 ml-6">
                          {section.gap.map((item, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Questions */}
                      <div>
                        <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center">
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Recommended Questions
                        </h4>
                        <div className="space-y-2 ml-6">
                          {section.recommendedQuestions.map((question, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-700">{question}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
       {/* Consequences of Inaction */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedConsequences(!expandedConsequences)}
        >
          <div className="flex items-center space-x-4">
            <div className="text-[#FF8E1C]">
              {/* Space */}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">Consequences of Inaction</h3>
              </div>
            </div>
          </div>
          
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
              expandedConsequences ? 'rotate-90' : ''
          }`} />
        </div>
        
        {expandedConsequences && (
          <div className="px-4 pb-4">
            <div className="border-t border-gray-100 pt-4">
              <div className="space-y-4">
                <div className="p-4 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    The consequences of not moving forward with this solution were not explicitly outlined during the meeting, but based on the discussion, several critical risks emerge. The salesperson missed an opportunity to create urgency by not directly asking about the impact of maintaining the status quo with 23% efficiency losses and Q4 target pressures.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span>Financial & Operational Impact</span>
                      </h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start space-x-2 ml-7">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Continued 23% efficiency losses costing significant productivity</span>
                        </div>
                        <div className="flex items-start space-x-2 ml-7">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Missing Q4 efficiency targets and board expectations</span>
                        </div>
                        <div className="flex items-start space-x-2 ml-7">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Increased operational costs due to inefficient processes</span>
                        </div>
                        <div className="flex items-start space-x-2 ml-7">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Delayed ROI realization pushing benefits into next fiscal year</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span>Strategic & Competitive Risks</span>
                      </h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start space-x-2 ml-7">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Competitive disadvantage if other vendors are selected</span>
                        </div>
                        <div className="flex items-start space-x-2 ml-7">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Lost opportunities for volume pricing and favorable terms</span>
                        </div>
                        <div className="flex items-start space-x-2 ml-7">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Potential for competitor to establish foothold in organization</span>
                        </div>
                        <div className="flex items-start space-x-2 ml-7">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Team morale impact from continued operational challenges</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Summary of Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedRecommendations(!expandedRecommendations)}
        >
          <div className="flex items-center space-x-4">
            <div className="text-[#FF8E1C]">
              {/* Space */}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-[#605BFF]">Recommended Action Points</h3>
              </div>
            </div>
          </div>
          
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
              expandedRecommendations ? 'rotate-90' : ''
          }`} />
        </div>
        
        {expandedRecommendations && (
          <div className="px-4 pb-4">
            <div className="border-t border-gray-100 pt-4">
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">  
                    <div className="w-2 h-2 bg-[#605BFF] rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 leading-relaxed">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualificationEffectivenessTab;