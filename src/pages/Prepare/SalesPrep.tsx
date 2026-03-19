import React, { useMemo, useState, useRef, useEffect } from 'react';
import { mockDeals, mockAEReps, formatCurrency, type Deal } from '@/data/mock';
import { PageHeader } from "@/components/CommonComponents/PageHeader";
import SalesMethodologyCard from "@/components/Modules/SalesMethodologyCard";
import BuyerJourneyCard from "@/components/Modules/BuyerJourneyCard";
import BuyerObjectionsCard from "@/components/Modules/BuyerObjectionsCard";
import BuyerQuestionsCard from "@/components/Modules/BuyerQuestionsCard";
import { Bot, Gauge, Users, Building2, FileText, Search, Filter, CheckCircle, AlertCircle, Send, Database, ChevronDown, User as UserIcon, Edit3, Trash2, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";

const SalesPrep: React.FC = () => {
  const [repName] = useState<string>('Sarah Chen');
  const repDeals = useMemo(() => mockDeals.filter(d => d.owner_name === repName), [repName]);
  const topDeals = useMemo(() => repDeals.slice().sort((a, b) => b.amount - a.amount).slice(0, 6), [repDeals]);
  const topRiskDeals = useMemo(() => repDeals.filter(d => d.risk_level === 'RED').slice().sort((a, b) => b.risk_score - a.risk_score).slice(0, 6), [repDeals]);
  const strategicDeal = useMemo(() => {
    const green = repDeals.find(d => d.owner_name === 'Sarah Chen' && d.risk_level === 'GREEN');
    if (green) return green;
    const any = repDeals.find(d => d.owner_name === 'Sarah Chen');
    return any || null;
  }, [repDeals]);
  const requestedDeals = useMemo(() => repDeals.filter(d => d.risk_reasons.some(r => r.code === 'COMMIT_AT_RISK' || r.code === 'CLOSE_DATE_MOVED')).slice(0, 6), [repDeals]);
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('sales_selected_deal_ids');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [currentDealName, setCurrentDealName] = useState<string | null>(null);
  const toggleSelect = (id: string) => {
    setSelectedDealIds(prev => {
      const adding = !prev.includes(id);
      const next = adding ? [...prev, id] : prev.filter(x => x !== id);
      try { localStorage.setItem('sales_selected_deal_ids', JSON.stringify(next)); } catch { void 0 }
      if (next.length === 0) {
        setCurrentDealName(null);
      } else {
        const lastId = next[next.length - 1];
        const d = repDeals.find(dd => dd.deal_id === lastId);
        setCurrentDealName(d ? `${d.account_name} / ${d.deal_name}` : null);
      }
      return next;
    });
  };
  useEffect(() => {
    try { localStorage.setItem('sales_selected_deal_ids', JSON.stringify(selectedDealIds)); } catch { void 0 }
  }, [selectedDealIds]);
  const selectedDeals = useMemo<Deal[]>(() => {
    if (selectedDealIds.length === 0) return [];
    return repDeals.filter(d => selectedDealIds.includes(d.deal_id));
  }, [repDeals, selectedDealIds]);
  const totalAmount = useMemo(() => selectedDeals.reduce((sum, d) => sum + d.amount, 0), [selectedDeals]);
  const avgRisk = useMemo(() => selectedDeals.length ? Math.round(selectedDeals.reduce((s, d) => s + d.risk_score, 0) / selectedDeals.length) : 0, [selectedDeals]);
  const riskCount = useMemo(() => ({
    RED: selectedDeals.filter(d => d.risk_level === 'RED').length,
    AMBER: selectedDeals.filter(d => d.risk_level === 'AMBER').length,
    GREEN: selectedDeals.filter(d => d.risk_level === 'GREEN').length,
  }), [selectedDeals]);
  const buyerConfirmed = useMemo(() => selectedDeals.filter(d => d.next_step && d.next_step.is_buyer_confirmed).length, [selectedDeals]);
  const avgDwell = useMemo(() => selectedDeals.length ? Math.round(selectedDeals.reduce((s, d) => s + d.stage_dwell_days, 0) / selectedDeals.length) : 0, [selectedDeals]);
  const scoreOffset = useMemo(() => {
    if (selectedDeals.length === 0) return 0;
    const n = Math.max(-2, Math.min(2, Math.round((50 - avgRisk) / 20)));
    return n;
  }, [selectedDeals.length, avgRisk]);
  const [analyticsDetail, setAnalyticsDetail] = useState<{ title: string; content: string; value: number } | null>(null);
  const onModuleDataClick = (title: string, content: string, value: number) => {
    setAnalyticsDetail({ title, content, value });
  };
  const clearSelection = () => {
    setSelectedDealIds([]);
    setCurrentDealName(null);
    setAnalyticsDetail(null);
    try { localStorage.setItem('sales_selected_deal_ids', JSON.stringify([])); } catch { void 0 }
  };
  const predefinedQuestions = [
    'Where are the biggest risks across selected deals?',
    'Which deals need buyer-confirmed next step?',
    'Which deals should be prioritized this week?',
    'What skills should be coached for these deals?',
  ];
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; type: 'user' | 'sam'; content: string; timestamp: string }>>([
    { id: '1', type: 'sam', content: 'Hi, I am SAM. Ask anything about your selected deals or coaching focus.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isLoading]);
  const generateSamResponse = (q: string) => {
    const risks = [...new Set(selectedDeals.flatMap(d => d.risk_reasons.map(r => r.label)))].join(', ') || 'Low risk';
    const needNext = selectedDeals.filter(d => !d.next_step || !d.next_step.is_buyer_confirmed).map(d => `${d.account_name}/${d.deal_name}`).slice(0, 5).join(', ') || 'All set';
    const prioritized = selectedDeals.slice().sort((a, b) => (b.risk_score + b.amount / 10000 + (100 - b.impact_rank)) - (a.risk_score + a.amount / 10000 + (100 - a.impact_rank))).slice(0, 3).map(d => `${d.account_name}/${d.deal_name}`).join(', ') || '—';
    const skills = [
      selectedDeals.some(d => d.risk_reasons.some(r => r.code === 'MISSING_EB')) ? 'EB access & sponsor engagement' : '',
      selectedDeals.some(d => d.risk_reasons.some(r => r.code === 'SINGLE_THREADED')) ? 'Stakeholder multithreading' : '',
      selectedDeals.some(d => !d.next_step || !d.next_step.is_buyer_confirmed) ? 'Buyer-confirmed next step setting' : '',
      selectedDeals.some(d => d.stage_dwell_days > 20) ? 'Stage progression acceleration' : '',
      'Objection handling & value articulation',
    ].filter(Boolean).join(', ');
    return `Risks: ${risks}\nNeed buyer-confirmed next step: ${needNext}\nPrioritized: ${prioritized}\nSkills: ${skills}`;
  };
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const u = { id: Date.now().toString(), type: 'user' as const, content: inputValue, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatHistory(prev => [...prev, u]);
    setInputValue('');
    setIsLoading(true);
    setTimeout(() => {
      const s = { id: (Date.now() + 1).toString(), type: 'sam' as const, content: generateSamResponse(u.content), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatHistory(prev => [...prev, s]);
      setIsLoading(false);
    }, 800);
  };
  const questionBanks: Record<string, string[]> = {
    MEDDIC: [
      'What is the compelling event for this deal?',
      'Do we have a clear EB access plan?',
      'What are top quantified pains?',
      'What are the decision criteria?',
      'What is the MAP status and next steps?',
      'Where are risks blocking progression?',
    ],
    SPIN: [
      'What situation details are missing?',
      'Which problems need deeper discovery?',
      'What implications can create urgency?',
      'What need-payoff can we articulate?',
    ],
    Challenger: [
      'What insight can we teach?',
      'How do we reframe the problem?',
      'Which commercial insight applies?',
      'How to create constructive tension?',
    ],
  };
  const methodologies = ['MEDDIC', 'SPIN', 'Challenger'];
  const [selectedMethodology, setSelectedMethodology] = useState('MEDDIC');
  const [questionSearch, setQuestionSearch] = useState('');
  const filteredQuestions = (questionBanks[selectedMethodology] || []).filter(q => q.toLowerCase().includes(questionSearch.toLowerCase()));
  type PredefQ = { id: string; source: 'manager' | 'ai'; question: string; answer: string };
  const [managerQuestions, setManagerQuestions] = useState<PredefQ[]>([
    { id: 'm1', source: 'manager', question: 'What is your plan to secure EB access?', answer: '' },
    { id: 'm2', source: 'manager', question: 'Which deals need buyer-confirmed next steps?', answer: '' },
  ]);
  const [aiQuestions, setAiQuestions] = useState<PredefQ[]>([
    { id: 'a1', source: 'ai', question: 'Where are critical risks blocking progression?', answer: '' },
  ]);
  const generateAnswerForQuestion = (q: string) => {
    const risks = [...new Set(selectedDeals.flatMap(d => d.risk_reasons.map(r => r.label)))].join(', ') || 'Low risk';
    const needNext = selectedDeals.filter(d => !d.next_step || !d.next_step.is_buyer_confirmed).map(d => `${d.account_name}/${d.deal_name}`).slice(0, 5).join(', ') || 'All set';
    const prioritized = selectedDeals.slice().sort((a, b) => (b.risk_score + b.amount / 10000 + (100 - b.impact_rank)) - (a.risk_score + a.amount / 10000 + (100 - a.impact_rank))).slice(0, 3).map(d => `${d.account_name}/${d.deal_name}`).join(', ') || '—';
    const skills = [
      selectedDeals.some(d => d.risk_reasons.some(r => r.code === 'MISSING_EB')) ? 'EB access & sponsor engagement' : '',
      selectedDeals.some(d => d.risk_reasons.some(r => r.code === 'SINGLE_THREADED')) ? 'Stakeholder multithreading' : '',
      selectedDeals.some(d => !d.next_step || !d.next_step.is_buyer_confirmed) ? 'Buyer-confirmed next step setting' : '',
      selectedDeals.some(d => d.stage_dwell_days > 20) ? 'Stage progression acceleration' : '',
      'Objection handling & value articulation',
    ].filter(Boolean).join(', ');
    return `Context\nRisks: ${risks}\nNext step gaps: ${needNext}\nPriority: ${prioritized}\nSkills: ${skills}\nAnswer\n${q} → Focus on EB plan, buyer-confirmed next steps, and progression acceleration.`;
  };
  const addBankQuestionToAI = (q: string) => {
    const id = `a${Date.now()}`;
    setAiQuestions(prev => [...prev, { id, source: 'ai', question: q, answer: '' }]);
  };
  const DealCard: React.FC<{ d: Deal }> = ({ d }) => (
    <label className="flex items-center justify-between rounded border p-3 cursor-pointer">
      <div>
        <div className="text-sm font-semibold text-gray-900">{d.account_name} / {d.deal_name}</div>
        <div className="text-xs text-gray-600 mt-1">{formatCurrency(d.amount)} · {d.stage_name}</div>
        <div className="text-[11px] text-gray-500 mt-1">Last activity {d.staleness_days}d · Dwell {d.stage_dwell_days}d</div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[11px] font-semibold px-2 py-1 rounded ${
          d.risk_level === 'RED' ? 'bg-red-100 text-red-700' :
          d.risk_level === 'AMBER' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
        }`}>{d.risk_level}</span>
        <input type="checkbox" checked={selectedDealIds.includes(d.deal_id)} onChange={() => toggleSelect(d.deal_id)} className="w-4 h-4" />
      </div>
    </label>
  );
  return (
    <div className="h-full bg-white overflow-auto">
      <PageHeader
        title="P — Prepare"
        subtitle="Triage, self-assessment & prioritization — ~30 min Monday morning"
        titleClassName="text-2xl font-bold text-gray-900"
      />
      <div className="px-6 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-gray-900">Deals</div>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#605BFF]/10 text-[#605BFF]">Selected: {selectedDeals.length}</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">Amount: {formatCurrency(totalAmount)}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2">Top Deals (Size)</div>
              <div className="space-y-2">{topDeals.map(d => <DealCard key={d.deal_id} d={d} />)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2">Top Risk Deals</div>
              <div className="space-y-2">{topRiskDeals.map(d => <DealCard key={d.deal_id} d={d} />)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2">Strategic Deals</div>
              <div className="space-y-2">
                {strategicDeal ? (
                  <DealCard key={strategicDeal.deal_id} d={strategicDeal} />
                ) : (
                  <div className="text-[11px] text-gray-500">No strategic deal</div>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2">Requested/Nominated (Manager)</div>
              <div className="space-y-2">{requestedDeals.map(d => <DealCard key={d.deal_id} d={d} />)}</div>
              {requestedDeals.length === 0 && <div className="text-[11px] text-gray-500">No requested deals</div>}
            </div>
          </div>
        </div>
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-gray-900">Meeting Analytics{currentDealName ? ` — ${currentDealName}` : ''}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={selectedDeals.length === 0} onClick={clearSelection}>Clear</Button>
            </div>
          </div>
          {selectedDeals.length === 0 ? (
            <div className="mb-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 h-56 flex flex-col items-center justify-center text-gray-500">
              <div className="text-sm font-medium">Select a deal on the left to view Meeting Analytics</div>
              <div className="text-xs mt-1">Then click any card to view details</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <SalesMethodologyCard onDataClick={onModuleDataClick} scoreOffset={scoreOffset} />
                <BuyerJourneyCard onDataClick={onModuleDataClick} scoreOffset={scoreOffset} />
                <BuyerObjectionsCard onDataClick={onModuleDataClick} scoreOffset={scoreOffset} />
                <BuyerQuestionsCard onDataClick={onModuleDataClick} scoreOffset={scoreOffset} />
              </div>
              {analyticsDetail && (
                <div className="mb-6 rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-900">{analyticsDetail.title}</div>
                    <Button variant="ghost" size="sm" onClick={() => setAnalyticsDetail(null)}>Clear detail</Button>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{analyticsDetail.content}</div>
                  <div className="text-[11px] text-gray-500 mt-2">Score: {analyticsDetail.value}</div>
                </div>
              )}
            </>
          )}
          <div className="rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-gray-900">Ask SAM</div>
                <Bot size={16} className="text-[#605BFF]" />
              </div>
            </div>
            <div className="px-4 pt-2">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {chatHistory.map(m => (
                  <div key={m.id} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl ${m.type === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-lg px-3 py-2 ${m.type === 'user' ? 'bg-[#E0E6FF]' : 'bg-white border'}`}>
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">{m.content}</div>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${m.type === 'user' ? 'text-right' : ''}`}>{m.timestamp}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="relative mt-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask Sam anything about selected deals or coaching..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#605BFF] focus:border-transparent resize-none pr-10"
                  rows={3}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 bottom-2 p-2 disabled:opacity-50 disabled:cursor-not-allowed text-[#FF8E1C] hover:text-[#4B46CC] transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      </div>
    </div>
  );
};

export default SalesPrep;
