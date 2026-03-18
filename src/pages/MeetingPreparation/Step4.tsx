import React, { useState } from 'react';
import { Calendar, Users, Building2, FileText, Briefcase, User, CheckCircle, AlertCircle, Edit3 } from 'lucide-react';
import { MeetingData } from './MeetingPreparation';
import { mockDeals } from '@/data/mock';

interface Step4Props {
  data: MeetingData;
  updateData: (data: Partial<MeetingData>) => void;
}

type Contact = string | { name?: string; jobTitle?: string; company?: string };

const Step4: React.FC<Step4Props> = ({ data, updateData }) => {
  const [isScheduled, setIsScheduled] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [salesLeader, setSalesLeader] = useState('Sales Leader');
  const availableSlots = [
    '2026-03-20 10:00-10:30',
    '2026-03-20 15:00-15:30',
    '2026-03-21 09:00-09:30',
    '2026-03-21 14:00-14:30',
    '2026-03-22 11:00-11:30'
  ];
  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const computeSubject = () => {
    const typeLabel = data.coachingType === 'deals' ? 'deals' : data.coachingType === 'skills' ? 'skills' : 'others';
    const dealNames = data.selectedDealsForCoaching.slice(0, 3).map(id => {
      const d = mockDeals.find(x => x.deal_id === id);
      return d ? d.deal_name : id;
    });
    const suffix = dealNames.length > 0 ? dealNames.join(', ') : typeLabel;
    return `[coaching]-${data.repName}-${suffix}`;
  };

  const handleSendRequest = () => {
    if (!selectedSlot) return;
    const m = selectedSlot.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    if (m) {
      updateData({ startDate: m[1], startTime: m[2], endTime: m[3], subject: computeSubject() });
    } else {
      updateData({ subject: computeSubject() });
    }
    setIsScheduled(true);
    setShowScheduleModal(false);
  };

  return (
    <div className="bg-white p-2 h-[calc(100vh-16rem)]">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#605BFF]" />
                <span className="text-xs font-medium text-gray-600">Date & Time</span>
              </div>
              {isScheduled ? (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">{formatDate(data.startDate)} {formatTime(data.startTime)} - {formatTime(data.endTime)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-orange-600" />
                  <span className="text-sm font-semibold text-gray-700">Not scheduled</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isScheduled ? (
                <button onClick={() => setShowScheduleModal(true)} className="px-3 py-1.5 text-sm bg-[#605BFF] text-white rounded hover:bg-[#5248FF]">Schedule</button>
              ) : (
                <button onClick={() => setShowScheduleModal(true)} className="px-3 py-1.5 text-sm bg-white text-[#605BFF] border border-[#605BFF] rounded hover:bg-[#605BFF] hover:text-white flex items-center gap-1">
                  <Edit3 size={16} />
                  Modify
                </button>
              )}
            </div>
          </div>
          <div className="px-6 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-[#605BFF]" />
              <div>
                <div className="text-xs font-medium text-gray-500">Subject</div>
                <div className="font-semibold text-gray-700 text-sm">{data.subject || computeSubject()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase size={18} className="text-[#605BFF]" />
              <div>
                <div className="text-xs font-medium text-gray-500">Coaching Focus</div>
                <div className="font-semibold text-gray-700 text-sm">
                  {data.coachingType === 'deals' ? (data.selectedDealsForCoaching.map(id => {
                    const d = mockDeals.find(x => x.deal_id === id);
                    return d ? d.deal_name : id;
                  }).join(', ') || 'deals') : data.coachingType}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User size={18} className="text-[#605BFF]" />
              <div>
                <div className="text-xs font-medium text-gray-500">Sales Leader</div>
                <input
                  value={salesLeader}
                  onChange={(e) => setSalesLeader(e.target.value)}
                  className="text-sm font-semibold text-gray-700 bg-white border rounded px-2 py-1 w-40"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users size={18} className="text-[#605BFF]" />
              <div>
                <div className="text-xs font-medium text-gray-500">Sales</div>
                <div className="font-semibold text-gray-700 text-sm">{data.repName}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 text-base">Agenda</h3>
          </div>
          <div className="px-6 pb-6">
            {data.discussionPoints && data.discussionPoints.length > 0 ? (
              <div className="space-y-2">
                {data.discussionPoints.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-700">{p}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No agenda items yet.</div>
            )}
          </div>
        </div>
      </div>
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 w-[520px] overflow-hidden">
            <div className="px-4 py-3 border-b">
              <div className="font-semibold text-gray-900">Select time with {salesLeader}</div>
            </div>
            <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full text-left px-3 py-2 rounded border ${selectedSlot === slot ? 'border-[#605BFF] bg-[#605BFF]/10' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
              <button onClick={() => setShowScheduleModal(false)} className="px-3 py-1.5 text-sm bg-white text-gray-700 border rounded hover:bg-gray-50">Cancel</button>
              <button onClick={handleSendRequest} className="px-3 py-1.5 text-sm bg-[#605BFF] text-white rounded hover:bg-[#5248FF]">Send request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4;
