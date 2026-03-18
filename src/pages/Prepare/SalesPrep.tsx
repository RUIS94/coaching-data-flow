import React, { useMemo, useState, useRef, useEffect } from 'react';
import { mockDeals, mockAEReps, formatCurrency, type Deal } from '@/data/mock';
import { Bot, Gauge, Users, Building2, FileText, Search, Filter, CheckCircle, AlertCircle, Send, Database, ChevronDown, User as UserIcon, Edit3, Trash2, Lock } from 'lucide-react';

const SalesPrep: React.FC = () => {
  const [repName, setRepName] = useState<string>(mockAEReps[0]?.name || 'Sarah Chen');
  const repDeals = useMemo(() => mockDeals.filter(d => d.owner_name === repName), [repName]);
  const topDeals = useMemo(() => repDeals.slice().sort((a, b) => b.amount - a.amount).slice(0, 6), [repDeals]);
  const topRiskDeals = useMemo(() => repDeals.filter(d => d.risk_level === 'RED').slice().sort((a, b) => b.risk_score - a.risk_score).slice(0, 6), [repDeals]);
  const strategicDeals = useMemo(() => repDeals.slice().sort((a, b) => a.impact_rank - b.impact_rank).slice(0, 6), [repDeals]);
  const requestedDeals = useMemo(() => repDeals.filter(d => d.risk_reasons.some(r => r.code === 'COMMIT_AT_RISK' || r.code === 'CLOSE_DATE_MOVED')).slice(0, 6), [repDeals]);
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const toggleSelect = (id: string) => {
    setSelectedDealIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const selectedDeals = useMemo<Deal[]>(() => {
    if (selectedDealIds.length === 0) return repDeals;
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
    <div className="bg-white p-3 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-gray-900">Deals</div>
              <Filter size={16} className="text-gray-400" />
            </div>
            <select value={repName} onChange={(e) => setRepName(e.target.value)} className="px-2 py-1 text-sm border rounded">
              {mockAEReps.map(r => <option key={r.user_id} value={r.name}>{r.name}</option>)}
            </select>
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
              <div className="space-y-2">{strategicDeals.map(d => <DealCard key={d.deal_id} d={d} />)}</div>
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
            <div className="text-lg font-bold text-gray-900">Meeting Analytics</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border p-3 flex items-center gap-3">
              <FileText size={16} className="text-[#605BFF]" />
              <div>
                <div className="text-[11px] text-gray-600">Selected</div>
                <div className="font-semibold text-gray-900 text-sm">{selectedDeals.length}</div>
              </div>
            </div>
            <div className="rounded-xl border p-3 flex items-center gap-3">
              <Building2 size={16} className="text-[#605BFF]" />
              <div>
                <div className="text-[11px] text-gray-600">Amount</div>
                <div className="font-semibold text-gray-900 text-sm">{formatCurrency(totalAmount)}</div>
              </div>
            </div>
            <div className="rounded-xl border p-3 flex items-center gap-3">
              <Gauge size={16} className="text-[#605BFF]" />
              <div>
                <div className="text-[11px] text-gray-600">Avg Risk</div>
                <div className="font-semibold text-gray-900 text-sm">{avgRisk}</div>
              </div>
            </div>
            <div className="rounded-xl border p-3 flex items-center gap-3">
              <AlertCircle size={16} className="text-red-600" />
              <div>
                <div className="text-[11px] text-gray-600">RED/AMBER</div>
                <div className="font-semibold text-gray-900 text-sm">{riskCount.RED}/{riskCount.AMBER}</div>
              </div>
            </div>
            <div className="rounded-xl border p-3 flex items-center gap-3">
              <CheckCircle size={16} className="text-green-600" />
              <div>
                <div className="text-[11px] text-gray-600">Buyer-confirmed</div>
                <div className="font-semibold text-gray-900 text-sm">{buyerConfirmed}</div>
              </div>
            </div>
            <div className="rounded-xl border p-3 flex items-center gap-3">
              <Users size={16} className="text-[#605BFF]" />
              <div>
                <div className="text-[11px] text-gray-600">Avg Dwell</div>
                <div className="font-semibold text-gray-900 text-sm">{avgDwell}d</div>
              </div>
            </div>
          </div>
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
          <div className="rounded-2xl border border-gray-100 mt-4">
            <div className="px-4 py-3">
              <div className="text-lg font-bold text-gray-900">Predefined Coaching Questions</div>
            </div>
            <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-900">Manager Questions</div>
                </div>
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {managerQuestions.map((q) => (
                    <div key={q.id} className="rounded border p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-gray-700">{q.question}</div>
                        <Lock size={14} className="text-gray-400" />
                      </div>
                      <textarea
                        value={q.answer}
                        onChange={(e) => {
                          const v = e.target.value;
                          setManagerQuestions(prev => prev.map(x => x.id === q.id ? { ...x, answer: v } : x));
                        }}
                        className="w-full h-20 text-sm border rounded mt-2 p-2"
                        placeholder="Type your answer"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => {
                            const a = generateAnswerForQuestion(q.question);
                            setManagerQuestions(prev => prev.map(x => x.id === q.id ? { ...x, answer: a } : x));
                          }}
                          className="px-2 py-1 text-xs border rounded text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Bot size={14} />
                          Generate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-900">AI Suggested</div>
                  <div className="relative">
                    <button className="flex items-center space-x-1 px-2 py-1 text-xs bg-white hover:bg-gray-100 rounded">
                      <ChevronDown className="w-3 h-3" />
                      <span>{selectedMethodology}</span>
                    </button>
                    <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10 min-w-[160px]">
                      {methodologies.map(m => (
                        <button
                          key={m}
                          onClick={() => setSelectedMethodology(m)}
                          className={`w-full px-3 py-2 text-left text-sm ${selectedMethodology === m ? 'text-[#605BFF] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    placeholder="Enter keywords"
                    className="w-full pl-9 pr-4 py-2 text-sm border rounded"
                  />
                </div>
                <div className="space-y-2 max-h-28 overflow-y-auto">
                  {filteredQuestions.map((q, i) => (
                    <div key={i} className="flex items-center justify-between rounded border p-2">
                      <div className="text-xs text-gray-700">{q}</div>
                      <button
                        onClick={() => addBankQuestionToAI(q)}
                        className="px-2 py-1 text-[11px] border rounded hover:bg-gray-50"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                  {filteredQuestions.length === 0 && (
                    <div className="text-center py-2 text-gray-500 text-sm">No questions</div>
                  )}
                </div>
                <div className="space-y-3 mt-3 max-h-40 overflow-y-auto">
                  {aiQuestions.map((q) => (
                    <div key={q.id} className="rounded border p-3">
                      <div className="flex items-center justify-between">
                        <input
                          value={q.question}
                          onChange={(e) => {
                            const v = e.target.value;
                            setAiQuestions(prev => prev.map(x => x.id === q.id ? { ...x, question: v } : x));
                          }}
                          className="flex-1 text-xs font-semibold text-gray-700 border rounded px-2 py-1 mr-2"
                        />
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setAiQuestions(prev => prev.filter(x => x.id !== q.id))}
                            className="p-1 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={q.answer}
                        onChange={(e) => {
                          const v = e.target.value;
                          setAiQuestions(prev => prev.map(x => x.id === q.id ? { ...x, answer: v } : x));
                        }}
                        className="w-full h-20 text-sm border rounded mt-2 p-2"
                        placeholder="Type your answer"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => {
                            const a = generateAnswerForQuestion(q.question);
                            setAiQuestions(prev => prev.map(x => x.id === q.id ? { ...x, answer: a } : x));
                          }}
                          className="px-2 py-1 text-xs border rounded text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Bot size={14} />
                          Generate
                        </button>
                      </div>
                    </div>
                  ))}
                  {aiQuestions.length === 0 && (
                    <div className="text-center py-2 text-gray-500 text-sm">No AI questions</div>
                  )}
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
