import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Users, Building2, ChevronLeft, ChevronRight, Plus, Sparkles, History, MoreVertical, Edit3, Trash2, Minimize2, Maximize2, Mic, ChevronDown, Bot, FilePlus2, ArrowLeft, MessageSquare, FileText, CheckCircle, Info, ArrowUpDown, List } from 'lucide-react';
import { MeetingData } from './MeetingPreparation';
import { mockDeals, formatCurrency } from '@/data/mock';
import AddDiscussionPoints from './popup/AddDiscussionPoints';
import PastDiscussionPoints from './popup/PastDiscussionPoints';
import MeetingIntelligenceHistory from './popup/MeetingIntelligenceHistory';

interface Step2Props {
  data: MeetingData;
  updateData: (data: Partial<MeetingData>) => void;
}

const Step2: React.FC<Step2Props> = ({ data, updateData }) => {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(true);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // 确保至少有一个面板是展开的
  const handleLeftPanelToggle = () => {
    if (!leftPanelCollapsed && rightPanelCollapsed) {
      // 如果左面板要收缩且右面板已收缩，则先展开右面板
      setRightPanelCollapsed(false);
    }
    setLeftPanelCollapsed(!leftPanelCollapsed);
  };

  const handleRightPanelToggle = () => {
    if (!rightPanelCollapsed && leftPanelCollapsed) {
      // 如果右面板要收缩且左面板已收缩，则先展开左面板
      setLeftPanelCollapsed(false);
    }
    setRightPanelCollapsed(!rightPanelCollapsed);
  };
  const [showAddDiscussionPopup, setShowAddDiscussionPopup] = useState(false);
  const [showPastDiscussionPopup, setShowPastDiscussionPopup] = useState(false);
  const [showMeetingHistoryPopup, setShowMeetingHistoryPopup] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // AI Generation inputs
  const [aiInputs, setAiInputs] = useState({
    attendeeJobTitle: '',
    clientIndustry: '',
    clientCompanySize: '',
    clientKeyCompetitors: '',
    clientProducts: '',
    ourSolutions: '',
    meetingDescription: ''
  });

  const [showSolutionsDropdown, setShowSolutionsDropdown] = useState(false);
  const [solutionOptions] = useState([
    'CRM Solutions',
    'Marketing Automation',
    'Sales Analytics',
    'Customer Support Platform',
    'Integration Services',
    'Custom Development'
  ]);

  const [aiGeneratedPoints, setAiGeneratedPoints] = useState<Array<{
    content: string;
    objective: string;
    keyResults: string[];
  }>>([]);
  const [showGeneratedPoints, setShowGeneratedPoints] = useState(false);
  const [expandedAIPoints, setExpandedAIPoints] = useState<Set<number>>(new Set());
  const [selectedDiscussionIndex, setSelectedDiscussionIndex] = useState<number | null>(0);
  const [discussionTable, setDiscussionTable] = useState<Array<{
    content: string;
    objective: string;
    keyResults: string;
    stakeholder: string;
  }>>([{
    content: "Discuss Q4 sales strategy and market expansion opportunities",
    objective: "Align on strategic direction for next quarter",
    keyResults: "Key Results",
    stakeholder: "John Smith\nSales Director"
  }, {
    content: "Review current product roadmap and feature prioritization",
    objective: "Ensure product development aligns with market demands",
    keyResults: "Roadmap updated, Feature priorities defined, Resource allocation confirmed",
    stakeholder: "Sarah Johnson\nProduct Manager"
  }]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      // Close solutions dropdown when clicking outside
      if (showSolutionsDropdown && !(event.target as Element).closest('.solutions-dropdown')) {
        setShowSolutionsDropdown(false);
      }
    };

    if (activeDropdown !== null || showSolutionsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown, showSolutionsDropdown]);

  const handleAddDiscussionPoint = (content: string, objective: string = '', stakeholder: string = '', keyResults: string = '') => {
    const newItem = { content, objective, keyResults: keyResults || 'Key Results', stakeholder };
    setDiscussionTable(prev => [...prev, newItem]);
  };

  const handleRemoveDiscussionPoint = (index: number) => {
    setDiscussionTable(prev => prev.filter((_, i) => i !== index));
    setActiveDropdown(null);
  };

  const handleEditDiscussionPoint = (index: number, content: string, stakeholder: string, objective: string = '', keyResults: string = '') => {
    setDiscussionTable(prev => prev.map((item, i) => 
      i === index ? { content, objective, keyResults: keyResults || 'Key Results', stakeholder } : item
    ));
    setActiveDropdown(null);
  };

  const handleGenerateAIPoints = () => {
    // Simulate AI generation based on inputs with detailed information
    const mockAIPoints = [
      {
         content: `Discuss ${aiInputs.clientIndustry} market trends and opportunities`,
         objective: "Understand current market dynamics and identify growth opportunities",
         keyResults: ["Market analysis report completed", "3 key opportunities identified", "Competitive positioning strategy developed"]
       },
       {
         content: `Present our ${aiInputs.ourSolutions} solution benefits`,
         objective: "Demonstrate value proposition and ROI of our solutions",
         keyResults: ["Solution demo completed", "ROI calculations presented", "Client questions addressed"]
       },
       {
         content: `Address competitive advantages over ${aiInputs.clientKeyCompetitors}`,
         objective: "Position our solution as the superior choice in the market",
         keyResults: ["Competitive comparison chart created", "Unique differentiators highlighted", "Objections handled effectively"]
       },
       {
         content: `Explore implementation timeline for ${aiInputs.clientCompanySize} organization`,
         objective: "Define realistic project timeline and resource requirements",
         keyResults: ["Implementation roadmap created", "Resource allocation plan finalized", "Milestone definitions established"]
       },
       {
         content: "Review ROI projections and success metrics",
         objective: "Establish clear success criteria and expected returns",
         keyResults: ["ROI model validated", "KPIs defined and agreed", "Success metrics established"]
       },
       {
         content: `Discuss integration with existing ${aiInputs.clientProducts} portfolio`,
         objective: "Ensure seamless integration with current systems",
         keyResults: ["Integration plan documented", "Technical requirements clarified", "Timeline established"]
       },
       {
         content: "Plan next steps and decision-making process",
         objective: "Define clear path forward and decision timeline",
         keyResults: ["Action items assigned", "Decision criteria established", "Follow-up scheduled"]
       },
       {
         content: "Address technical requirements and support needs",
         objective: "Clarify technical specifications and ongoing support expectations",
         keyResults: ["Technical specs documented", "Support model defined", "SLA requirements agreed"]
       }
    ].filter(point => point.content.length > 0);
    
    setAiGeneratedPoints(mockAIPoints);
    setShowGeneratedPoints(true);
  };

  const handleToggleAIView = () => {
    setShowGeneratedPoints(!showGeneratedPoints);
  };

  const handleAddAIPointToDiscussion = (point: {content: string; objective: string; keyResults: string[]}) => {
    const exists = discussionTable.some(item => item.content === point.content);
    if (!exists) {
      const keyResultsString = point.keyResults.join(', ');
      handleAddDiscussionPoint(point.content, point.objective, '', keyResultsString);
      if (leftPanelCollapsed || rightPanelCollapsed) {
        setLeftPanelCollapsed(false);
        setRightPanelCollapsed(false);
      }
    }
  };

  const submittedDeals = React.useMemo(() => {
    return Object.entries(data.dealAssessments)
      .filter(([, a]) => a.status === 'SUBMITTED')
      .map(([id]) => mockDeals.find(d => d.deal_id === id))
      .filter(Boolean) as typeof mockDeals;
  }, [data.dealAssessments]);

  const toggleDealSelection = (dealId: string) => {
    const exist = data.selectedDealsForCoaching.includes(dealId);
    const next = exist ? data.selectedDealsForCoaching.filter(id => id !== dealId) : [...data.selectedDealsForCoaching, dealId];
    updateData({ selectedDealsForCoaching: next });
  };

  const setCoachingType = (t: 'deals' | 'skills' | 'others') => {
    updateData({ coachingType: t });
  };

  const generatePointsForDeal = (dealId: string) => {
    const d = mockDeals.find(x => x.deal_id === dealId);
    if (!d) return [];
    const points: { content: string; objective: string; keyResults: string[] }[] = [];
    if (d.risk_reasons.some(r => r.code === 'MISSING_EB')) points.push({ content: `Strengthen EB access for ${d.deal_name}`, objective: 'Secure EB sponsorship', keyResults: ['EB identified', 'Intro scheduled', 'Sponsor engaged'] });
    if (!d.next_step || !d.next_step.is_buyer_confirmed) points.push({ content: `Add buyer-confirmed next step for ${d.deal_name}`, objective: 'Establish clear next step', keyResults: ['Date set', 'Buyer confirmed', 'Owner assigned'] });
    if (d.stage_dwell_days > 20) points.push({ content: `Accelerate progression from ${d.stage_name} on ${d.deal_name}`, objective: 'Reduce stage dwell', keyResults: ['Key blockers removed', 'Progress milestone achieved'] });
    if (d.risk_reasons.some(r => r.code === 'SINGLE_THREADED')) points.push({ content: `Multi-thread stakeholders on ${d.deal_name}`, objective: 'Broaden stakeholder map', keyResults: ['New contacts added', 'Roles mapped'] });
    if (d.risk_level === 'RED') points.push({ content: `Mitigate critical risks for ${d.deal_name}`, objective: 'De-risk path to close', keyResults: ['Mitigation plan drafted', 'Owner assigned'] });
    if (points.length === 0) points.push({ content: `Prepare objection handling and value reinforcement for ${d.deal_name}`, objective: 'Strengthen value narrative', keyResults: ['Objection bank prepared', 'ROI articulated'] });
    return points;
  };

  const handleGenerateFromSelection = () => {
    if (data.coachingType === 'skills') {
      const skills = [
        { content: 'Discovery questioning', objective: 'Uncover deeper pains', keyResults: ['3 pain areas uncovered', 'Impact quantified'] },
        { content: 'Objection handling', objective: 'Resolve common blockers', keyResults: ['Top 5 objections addressed'] },
        { content: 'Value articulation', objective: 'Tie outcomes to metrics', keyResults: ['Outcome-to-metric mapping drafted'] }
      ];
      setAiGeneratedPoints(skills);
      setShowGeneratedPoints(true);
      return;
    }
    if (data.coachingType === 'others') {
      const others = [
        { content: 'Meeting hygiene review', objective: 'Improve notes & follow-ups', keyResults: ['All meetings have next step', 'Notes standardized'] },
        { content: 'Account strategy refresh', objective: 'Align on multithread plan', keyResults: ['Stakeholder map updated'] }
      ];
      setAiGeneratedPoints(others);
      setShowGeneratedPoints(true);
      return;
    }
    const combined: { content: string; objective: string; keyResults: string[] }[] = [];
    data.selectedDealsForCoaching.forEach(id => {
      generatePointsForDeal(id).forEach(p => combined.push(p));
    });
    setAiGeneratedPoints(combined);
    setShowGeneratedPoints(true);
  };

  const toggleAIPointExpansion = (index: number) => {
    const newExpanded = new Set(expandedAIPoints);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedAIPoints(newExpanded);
  };

  const handleSavePastDiscussionPoints = (selectedPoints: Array<{content: string; objective: string; keyResults: string[]; qualificationQuestions?: string[]}>) => {
    selectedPoints.forEach(point => {
      const keyResultsString = point.keyResults.join(', ');
      handleAddDiscussionPoint(point.content, point.objective, '', keyResultsString);
    });
  };

  return (
    <div className="bg-white p-2 h-[calc(100vh-16rem)]">
      <div className="flex h-[650px] gap-4">
        {/* Left Panel - Discussion Points (Core) */}
        <div className={`${
          leftPanelCollapsed 
            ? 'w-12' 
            : rightPanelCollapsed 
              ? 'flex-1' 
              : 'w-[60%]'
        } bg-white backdrop-blur-sm rounded-2xl border border-gray-100 transition-all flex flex-col overflow-hidden`}>
          {leftPanelCollapsed ? (
            <div 
              onClick={() => setLeftPanelCollapsed(false)}
              className="h-full bg-gradient-to-b from-[#605BFF]/10 to-[#605BFF]/5 hover:from-[#605BFF]/20 hover:to-[#605BFF]/10 cursor-pointer transition-all duration-300 flex flex-col items-center group py-4"
            >
              <Maximize2 size={20} className="text-[#605BFF] group-hover:text-[#5248FF] transition-colors mb-4" />
              <div className="transform -rotate-90 text-sm font-medium text-[#605BFF] whitespace-nowrap group-hover:text-[#5248FF] flex-1 flex items-center justify-center">
                 Discussion Points
               </div>
            </div>
          ) : (
            <div className="flex-1 p-0">
          {/* Meeting Summary Bar */}
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-[#605BFF]" />
                <span className="font-bold text-gray-600">Time:</span>
                <span className="text-gray-900">{data.startDate} {data.startTime}-{data.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={12} className="text-[#605BFF]" />
                <span className="font-bold text-gray-600">Subject:</span>
                <span className="text-gray-900 truncate max-w-40">{data.subject || 'No subject'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={12} className="text-[#605BFF]" />
                <span className="font-bold text-gray-600">Client:</span>
                <span className="text-gray-900 truncate max-w-32">{data.clientCompany}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={12} className="text-[#605BFF]" />
                <span className="font-bold text-gray-600">Attendees:</span>
                <span className="text-gray-900">{data.attendees.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-[#605BFF]" />
                <span className="font-bold text-gray-600">Readiness:</span>
                <span className="font-bold text-green-600">85%</span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLeftPanelToggle}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors group"
                title="Toggle Panel"
              >
                <Minimize2 size={20} className="text-gray-600 group-hover:text-[#605BFF] transition-colors" />
              </button>
            </div>
          </div>
          {/* Discussion Points - Core Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900 text-base">Discussion Points</h3>
                <button className="p-1 text-gray-400 hover:text-[#605BFF] rounded-full hover:bg-[#605BFF]/10 transition-all duration-200" title="Information">
                  <Info size={18} />
                </button>
                <button className="p-1 text-gray-400 hover:text-[#605BFF] rounded hover:bg-[#605BFF]/10 transition-all duration-200" title="Reorder">
                  <ArrowUpDown size={18} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                {/* Attendees Avatars */}
                <div className="flex -space-x-1">
                  {data.attendees.slice(0, 3).map((attendee, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white shadow-sm"
                      title={attendee.name}
                    >
                      {attendee.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {data.attendees.length > 3 && (
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white shadow-sm">
                      +{data.attendees.length - 3}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setShowPastDiscussionPopup(true)}
                  className="p-2 text-[#605BFF] hover:text-[#5248FF] hover:bg-[#605BFF]/10 rounded-lg transition-all duration-200"
                  title="Past discussion points"
                >
                  <List size={20} />
                </button>
                <button 
                  onClick={() => setShowMeetingHistoryPopup(true)}
                  className="p-2 text-[#605BFF] hover:text-[#5248FF] hover:bg-[#605BFF]/10 rounded-lg transition-all duration-200"
                  title="Meeting Intelligence History"
                >
                  <History size={20} />
                </button>
                <button
                  onClick={() => setShowAddDiscussionPopup(true)}
                  className="p-2 text-[#605BFF] hover:text-[#5248FF] hover:bg-[#605BFF]/10 rounded-lg transition-all duration-200"
                  title="Add Discussion Point"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
                
            {/* Discussion Table */}
            <div className="space-y-3 h-[450px] overflow-y-auto">
              {discussionTable.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => setSelectedDiscussionIndex(selectedDiscussionIndex === index ? null : index)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedDiscussionIndex === index 
                      ? 'bg-[#605BFF]/10 shadow-md' 
                      : 'bg-white/90 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start">
                    {/* Left area - 60% */}
                    <div className="w-[60%] space-y-2">
                      <div className="font-semibold text-gray-900">{item.content}</div>
                      <div className="text-sm text-gray-600">{item.objective}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-600">Key Results:</span>
                          <FilePlus2 size={14} className="text-[#605BFF]" />
                        </div>
                        <div className="text-xs text-gray-700 ml-2">
                          {item.keyResults.split(',').map((result, resultIndex) => (
                            <div key={resultIndex} className="flex items-start gap-1 mb-1">
                              <span className="text-gray-400 mt-0.5">•</span>
                              <span>{result.trim()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Middle area - 30% */}
                    <div className="w-[30%] px-4">
                      {item.stakeholder && (
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-600">Stakeholder:</div>
                          <div className="text-sm text-gray-700">
                            <div className="font-medium">{item.stakeholder.split('\n')[0] || 'Name'}</div>
                            <div className="text-gray-500">{item.stakeholder.split('\n')[1] || 'Title'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Right area - Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit action here
                        }}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDiscussionPoint(index);
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {discussionTable.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users size={48} className="text-gray-300 mx-auto mb-4" />
                  <div className="text-lg font-medium mb-2">No discussion points yet</div>
                  <div className="text-sm">Use AI suggestions or add them manually</div>
                </div>
              )}
            </div>
          </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className={`${rightPanelCollapsed ? 'w-12' : leftPanelCollapsed ? 'flex-1' : 'w-[40%]'} bg-white backdrop-blur-sm rounded-2xl border border-gray-100 transition-all flex flex-col overflow-hidden`}>
          {rightPanelCollapsed ? (
             <div 
               onClick={() => setRightPanelCollapsed(false)}
               className="h-full bg-gradient-to-b from-[#605BFF]/10 to-[#605BFF]/5 hover:from-[#605BFF]/20 hover:to-[#605BFF]/10 cursor-pointer transition-all duration-300 flex flex-col items-center group py-4"
             >
               <Maximize2 size={20} className="text-[#605BFF] group-hover:text-[#5248FF] transition-colors mb-4" />
               <div className="transform -rotate-90 text-sm font-medium text-[#605BFF] whitespace-nowrap group-hover:text-[#5248FF] flex-1 flex items-center justify-center">
                 AI Discussion Points
               </div>
             </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-base">Recommended discussion points</h3>
                  <button
                    onClick={handleToggleAIView}
                    className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Bot size={20} className={`${showGeneratedPoints ? 'text-orange-500' : 'text-gray-400'} transition-colors`} />
                  </button>
                </div>
                <button
                   onClick={handleRightPanelToggle}
                   className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors group"
                 >
                   <Minimize2 size={20} className="text-gray-600 group-hover:text-[#605BFF] transition-colors" />
                 </button>
              </div>
          
          <div className="flex-1 p-2 flex flex-col overflow-hidden">
              {!showGeneratedPoints ? (
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCoachingType('deals')}
                        className={`px-2 py-1 text-xs rounded border ${data.coachingType === 'deals' ? 'bg-[#605BFF] text-white border-[#605BFF]' : 'bg-white text-gray-700'}`}
                      >
                        Deals (Recommended)
                      </button>
                      <button
                        onClick={() => setCoachingType('skills')}
                        className={`px-2 py-1 text-xs rounded border ${data.coachingType === 'skills' ? 'bg-[#605BFF] text-white border-[#605BFF]' : 'bg-white text-gray-700'}`}
                      >
                        Skills
                      </button>
                      <button
                        onClick={() => setCoachingType('others')}
                        className={`px-2 py-1 text-xs rounded border ${data.coachingType === 'others' ? 'bg-[#605BFF] text-white border-[#605BFF]' : 'bg-white text-gray-700'}`}
                      >
                        Others
                      </button>
                    </div>
                    <div className="text-xs text-gray-600">Select submitted self-assessments</div>
                    <div className="space-y-2">
                      {submittedDeals.map((d) => (
                        <label key={d.deal_id} className="flex items-center justify-between rounded border p-3 cursor-pointer">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{d.account_name} / {d.deal_name}</div>
                            <div className="text-xs text-gray-600 mt-1">{formatCurrency(d.amount)} · {d.stage_name}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={data.selectedDealsForCoaching.includes(d.deal_id)}
                            onChange={() => toggleDealSelection(d.deal_id)}
                            className="w-4 h-4"
                          />
                        </label>
                      ))}
                      {submittedDeals.length === 0 && (
                        <div className="text-xs text-gray-500">No submitted self-assessments</div>
                      )}
                    </div>
                    <div className="flex justify-center mt-2">
                      <button
                        onClick={handleGenerateFromSelection}
                        className="px-4 py-1.5 bg-[#605BFF] text-white rounded hover:bg-[#5248FF] font-medium text-sm"
                      >
                        Generate coaching point
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {aiGeneratedPoints.map((point, index) => (
                    <div 
                      key={index} 
                      className="rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-3 flex items-center gap-3">
                        <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             handleAddAIPointToDiscussion(point);
                           }}
                           className="p-1.5 rounded-lg bg-[#605BFF]/10 hover:bg-[#605BFF]/20 transition-all duration-200 group flex-shrink-0"
                           title="Add Discussion Point to left"
                         >
                           <ArrowLeft size={18} className="text-[#605BFF] group-hover:text-[#4F46E5] group-hover:scale-105 transition-all duration-200" />
                        </button>
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => toggleAIPointExpansion(index)}
                        >
                          <div className="text-sm text-gray-700 mb-1">{point.content}</div>
                        </div>
                        <div 
                          className="p-1 flex-shrink-0 cursor-pointer"
                          onClick={() => toggleAIPointExpansion(index)}
                        >
                          <ChevronDown 
                            size={16} 
                            className={`text-gray-500 transition-transform ${
                              expandedAIPoints.has(index) ? 'rotate-180' : ''
                            }`} 
                          />
                        </div>
                      </div>
                      {expandedAIPoints.has(index) && (
                        <div className="px-3 pb-3 ml-6 space-y-2 border-l-2 border-gray-200">
                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-1">Objective:</div>
                            <div className="text-xs text-gray-700">{point.objective}</div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-1">Key Results:</div>
                            <ul className="text-xs text-gray-700 space-y-1">
                              {point.keyResults.map((result, resultIndex) => (
                                <li key={resultIndex} className="flex items-start gap-1">
                                  <span className="text-gray-400 mt-0.5">•</span>
                                  <span>{result}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      </div>

      {/* Add Discussion Points Popup */}
      {showAddDiscussionPopup && (
        <AddDiscussionPoints
          onClose={() => setShowAddDiscussionPopup(false)}
          onAdd={(discussionPoint, objective, stakeholder, keyResults) => {
            handleAddDiscussionPoint(discussionPoint, objective, stakeholder, keyResults);
            setShowAddDiscussionPopup(false);
          }}
          attendees={data.attendees}
        />
      )}

      {/* Past Discussion Points Popup */}
      {showPastDiscussionPopup && (
        <PastDiscussionPoints
          onClose={() => setShowPastDiscussionPopup(false)}
          onSave={handleSavePastDiscussionPoints}
          dealName={data.deal}
        />
      )}

      {/* Meeting Intelligence History Popup */}
      {showMeetingHistoryPopup && (
        <MeetingIntelligenceHistory
          onClose={() => setShowMeetingHistoryPopup(false)}
        />
      )}
      
      {/* Past Discussion Points Popup */}
      {showPastDiscussionPopup && (
        <PastDiscussionPoints
          onClose={() => setShowPastDiscussionPopup(false)}
          onSave={handleSavePastDiscussionPoints}
          dealName={data.deal}
        />
      )}
    </div>
  );
};

export default Step2;
