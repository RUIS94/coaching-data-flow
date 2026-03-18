import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Filter, Mic, Users, MoreVertical, Bot } from 'lucide-react';
import { MeetingData, Attendee, DealAssessment } from './MeetingPreparation';
import { mockDeals, formatCurrency } from '@/data/mock';
import SelectContact from './popup/SelectContact';
import CreateCompany from './popup/CreateCompany';
import CreateDeal from './popup/CreateDeal';
import CreateAttendee from './popup/CreateAttendee';

interface Step1Props {
  data: MeetingData;
  updateData: (data: Partial<MeetingData>) => void;
}

const Step1: React.FC<Step1Props> = ({ data, updateData }) => {
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [showCreateAttendee, setShowCreateAttendee] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [editingAttendee, setEditingAttendee] = useState<{index: number, name: string, company: string, title: string} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [stageFilter, setStageFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<'All' | 'RED' | 'AMBER' | 'GREEN'>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const repDeals = useMemo(() => mockDeals.filter(d => d.owner_name === data.repName), [data.repName]);
  const stages = useMemo(() => Array.from(new Set(repDeals.map(d => d.stage_name))), [repDeals]);
  const filteredDeals = useMemo(() => {
    return repDeals.filter(d => {
      const stageOk = stageFilter === 'All' ? true : d.stage_name === stageFilter;
      const riskOk = riskFilter === 'All' ? true : d.risk_level === riskFilter;
      const term = searchTerm.toLowerCase();
      const termOk = term ? (d.deal_name.toLowerCase().includes(term) || d.account_name.toLowerCase().includes(term)) : true;
      return stageOk && riskOk && termOk;
    });
  }, [repDeals, stageFilter, riskFilter, searchTerm]);
  const [selectedDealId, setSelectedDealId] = useState<string>(filteredDeals[0]?.deal_id || repDeals[0]?.deal_id || '');
  useEffect(() => {
    if (!selectedDealId || !filteredDeals.find(d => d.deal_id === selectedDealId)) {
      setSelectedDealId(filteredDeals[0]?.deal_id || repDeals[0]?.deal_id || '');
    }
  }, [filteredDeals, repDeals, selectedDealId]);
  const currentDeal = useMemo(() => mockDeals.find(d => d.deal_id === selectedDealId) || filteredDeals[0] || repDeals[0], [selectedDealId, filteredDeals, repDeals]);
  const currentAssessment: DealAssessment | undefined = data.dealAssessments[selectedDealId];
  const defaultQuestions = [
    { id: 'q1', question: 'TOP DEAL THIS WEEK' },
    { id: 'q2', question: ' BIGGEST RISK' },
    { id: 'q3', question: 'WHERE I NEED HELP' }
  ];
  const [answers, setAnswers] = useState<Array<{ id: string; question: string; answer: string }>>(
    defaultQuestions.map(q => ({
      id: q.id,
      question: q.question,
      answer: currentAssessment?.answers.find(a => a.id === q.id)?.answer || ''
    }))
  );
  const [transcript, setTranscript] = useState<string>(currentAssessment?.voiceTranscript || '');
  useEffect(() => {
    const a = data.dealAssessments[selectedDealId];
    setAnswers(defaultQuestions.map(q => ({
      id: q.id,
      question: q.question,
      answer: a?.answers.find(x => x.id === q.id)?.answer || ''
    })));
    setTranscript(a?.voiceTranscript || '');
  }, [selectedDealId, data.dealAssessments]);
  const status = currentAssessment?.status || 'PENDING';
  const statusLabel = status === 'DRAFT' ? 'Draft' : status === 'SUBMITTED' ? 'Submitted' : 'Pending';
  const statusColor = status === 'DRAFT' ? 'bg-amber-100 text-amber-700' : status === 'SUBMITTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';
  const saveAssessment = (nextStatus: 'PENDING' | 'DRAFT' | 'SUBMITTED') => {
    if (!selectedDealId) return;
    const next: DealAssessment = {
      dealId: selectedDealId,
      status: nextStatus,
      answers,
      voiceTranscript: transcript,
      updatedAt: new Date().toISOString()
    };
    const merged = { ...data.dealAssessments, [selectedDealId]: next };
    updateData({ dealAssessments: merged });
  };
  const handleGenerateAnswers = () => {
    if (!currentDeal) return;
    const topDeal = `${currentDeal.deal_name} (${formatCurrency(currentDeal.amount)} · ${currentDeal.stage_name})`;
    const risks = currentDeal.risk_reasons && currentDeal.risk_reasons.length > 0
      ? currentDeal.risk_reasons.map(r => r.label).join(', ')
      : 'Low risk';
    let help = '';
    if (currentDeal.risk_reasons.some(r => r.code === 'MISSING_EB')) help = 'Need EB access and sponsor engagement';
    else if (currentDeal.risk_reasons.some(r => r.code === 'SINGLE_THREADED')) help = 'Need multithreading across stakeholders';
    else if (!currentDeal.next_step || !currentDeal.next_step.is_buyer_confirmed) help = 'Need buyer-confirmed next step';
    else if (currentDeal.stage_dwell_days > 20) help = 'Need to accelerate stage progression';
    else help = 'Need objection handling and stronger value articulation';
    const nextAnswers = defaultQuestions.map(q => {
      const a = q.id === 'q1' ? topDeal : q.id === 'q2' ? risks : help;
      return { id: q.id, question: q.question, answer: a };
    });
    setAnswers(nextAnswers);
  };
  const handleQuestionTranscribe = (index: number) => {
    const cur = answers[index];
    const isTranscribed = cur.answer.startsWith('Transcribed: ');
    const base = `Transcribed: ${cur.question}${currentDeal ? ` — ${currentDeal.deal_name}` : ''}`;
    const next = [...answers];
    next[index] = { ...cur, answer: isTranscribed ? '' : base };
    setAnswers(next);
  };
  const handleAttachAudio = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  // Format date to display as "08 Aug 2025"
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const locationOptions = [
    'Zoom', 'Teams', 'Google Meet', 'Skype', 'Webex', 'Chime', 'Other'
  ];

  const [clientCompanyOptions, setClientCompanyOptions] = useState([
    'Tech Solutions Inc',
    'Client Corp',
    'Partner LLC',
    'Innovation Labs',
    'Digital Dynamics',
    'Future Systems',
    'Global Enterprises'
  ]);

  const [dealOptions, setDealOptions] = useState([
    'Q1 Software License Deal',
    'Enterprise Integration Project',
    'Cloud Migration Services',
    'Digital Transformation Initiative',
    'AI Implementation Project',
    'Security Audit Contract',
    'Custom Development Agreement'
  ]);

  const handleInputChange = (field: keyof MeetingData, value: MeetingData[keyof MeetingData]) => {
    updateData({ [field]: value });
  };

  const handleCreateCompany = (companyName: string) => {
    setClientCompanyOptions(prev => [...prev, companyName]);
    handleInputChange('clientCompany', companyName);
  };

  const handleCreateDeal = (dealName: string) => {
    setDealOptions(prev => [...prev, dealName]);
    handleInputChange('deal', dealName);
  };

  const handleCreateAttendee = (attendeeName: string) => {
    const newAttendee: Attendee = {
      name: attendeeName,
      company: data.clientCompany || 'Unknown Company'
    };
    const newAttendees = [...data.attendees, newAttendee];
    handleInputChange('attendees', newAttendees);
  };

  const handleEditAttendee = (index: number, newName: string, newCompany: string, newTitle: string) => {
    const newAttendees = [...data.attendees];
    newAttendees[index] = { ...newAttendees[index], name: newName, company: newCompany, title: newTitle };
    handleInputChange('attendees', newAttendees);
    setEditingAttendee(null);
    setActiveDropdown(null);
  };

  const handleRemoveAttendee = (index: number) => {
    const newAttendees = data.attendees.filter((_, i) => i !== index);
    handleInputChange('attendees', newAttendees);
    setActiveDropdown(null);
  };

  return (
    <div className="bg-white rounded-lg p-2">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">My deals</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="pl-7 pr-3 py-2 text-sm border rounded-lg w-52"
                  placeholder="Search deals or accounts"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Filter size={18} className="text-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg"
            >
              <option value="All">All stages</option>
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as 'All' | 'RED' | 'AMBER' | 'GREEN')}
              className="px-3 py-2 text-sm border rounded-lg"
            >
              <option value="All">All risks</option>
              <option value="RED">RED</option>
              <option value="AMBER">AMBER</option>
              <option value="GREEN">GREEN</option>
            </select>
          </div>
          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {filteredDeals.map(d => (
              <div
                key={d.deal_id}
                onClick={() => setSelectedDealId(d.deal_id)}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedDealId === d.deal_id ? 'border-[#605BFF] ring-2 ring-[#605BFF]/20' : 'hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{d.account_name} / {d.deal_name}</div>
                    <div className="text-xs text-gray-600 mt-1">{formatCurrency(d.amount)} · {d.stage_name}</div>
                    <div className="text-xs text-gray-500 mt-1">Last activity {d.staleness_days} days ago</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    d.risk_level === 'RED' ? 'bg-red-100 text-red-700' :
                    d.risk_level === 'AMBER' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>{d.risk_level}</span>
                </div>
              </div>
            ))}
            {filteredDeals.length === 0 && (
              <div className="text-xs text-gray-500">No deals found</div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-gray-900">Self-Assessment</div>
              <button
                onClick={handleGenerateAnswers}
                className="px-2 py-1 text-xs border rounded-lg flex items-center gap-1 text-gray-700 hover:bg-gray-50"
              >
                <Bot size={14} />
                Generate
              </button>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor}`}>{statusLabel}</span>
          </div>
          {currentDeal ? (
            <div className="space-y-6">
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{currentDeal.account_name} / {currentDeal.deal_name}</div>
                    <div className="text-xs text-gray-600 mt-1">{formatCurrency(currentDeal.amount)} · {currentDeal.stage_name}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    currentDeal.risk_level === 'RED' ? 'bg-red-100 text-red-700' :
                    currentDeal.risk_level === 'AMBER' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>{currentDeal.risk_level}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {answers.map((a, idx) => (
                  <div key={a.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-gray-700">{a.question}</div>
                      <button
                        onClick={() => handleQuestionTranscribe(idx)}
                        className="px-2 py-1 text-xs border rounded-lg flex items-center gap-1 text-gray-700 hover:bg-gray-50"
                      >
                        <Mic size={14} />
                        {a.answer.startsWith('Transcribed: ') ? 'Clear' : 'Transcribe'}
                      </button>
                    </div>
                    <textarea
                      value={a.answer}
                      onChange={(e) => {
                        const next = [...answers];
                        next[idx] = { ...next[idx], answer: e.target.value };
                        setAnswers(next);
                      }}
                      className="w-full h-24 text-sm border rounded-lg p-2"
                      placeholder="Type your answer"
                    />
                  </div>
                ))}
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-gray-700">Voice-to-text self-assessment</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTranscript(transcript ? '' : 'Transcribed: I feel confident about stakeholder alignment, but EB access remains a gap. Next step: schedule EB meeting.')}
                      className="px-2 py-1 text-xs border rounded-lg flex items-center gap-1 text-gray-700 hover:bg-gray-50"
                    >
                      <Mic size={14} />
                      {transcript ? 'Clear' : 'Transcribe'}
                    </button>
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="px-2 py-1 text-xs border rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Attach audio
                    </button>
                    {audioUrl && (
                      <button
                        onClick={() => setAudioUrl(null)}
                        className="px-2 py-1 text-xs border rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Remove audio
                      </button>
                    )}
                  </div>
                </div>
                {audioUrl && (
                  <audio controls src={audioUrl} className="w-full mb-2" />
                )}
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleAttachAudio(e.target.files?.[0])}
                  className="hidden"
                />
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full h-28 text-sm border rounded-lg p-2"
                  placeholder="Speak or paste your transcript here"
                />
              </div>
              <div className="flex items-center justify-end">
                {status === 'PENDING' && (
                  <button
                    onClick={() => saveAssessment('DRAFT')}
                    className="px-4 py-2 text-sm bg-white text-[#605BFF] border border-[#605BFF] rounded-lg hover:bg-[#605BFF] hover:text-white transition-colors"
                  >
                    Save
                  </button>
                )}
                {status === 'DRAFT' && (
                  <button
                    onClick={() => saveAssessment('SUBMITTED')}
                    className="px-4 py-2 text-sm bg-[#605BFF] text-white rounded-lg hover:bg-[#5248FF] transition-colors"
                  >
                    Submit
                  </button>
                )}
                {status === 'SUBMITTED' && (
                  <button
                    onClick={() => saveAssessment('DRAFT')}
                    className="px-4 py-2 text-sm bg-white text-[#605BFF] border border-[#605BFF] rounded-lg hover:bg-[#605BFF] hover:text-white transition-colors"
                  >
                    Update
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Select a deal to start self-assessment</div>
          )}
        </div>
      </div>

      {/* Select Contact Popup */}
      {showContactPopup && (
        <SelectContact
          onClose={() => setShowContactPopup(false)}
          onSelect={(contacts) => {
            const newAttendees = [...data.attendees, ...contacts];
            handleInputChange('attendees', newAttendees);
            setShowContactPopup(false);
          }}
          selectedCompany={data.clientCompany}
        />
      )}

      {/* Create Company Popup */}
      {showCreateCompany && (
        <CreateCompany
          onClose={() => setShowCreateCompany(false)}
          onSave={handleCreateCompany}
        />
      )}

      {/* Create Deal Popup */}
      {showCreateDeal && (
        <CreateDeal
          onClose={() => setShowCreateDeal(false)}
          onSave={handleCreateDeal}
        />
      )}

      {/* Create Attendee Popup */}
      {showCreateAttendee && (
        <CreateAttendee
          onClose={() => setShowCreateAttendee(false)}
          onSave={handleCreateAttendee}
        />
      )}
    </div>
  );
};

export default Step1;
