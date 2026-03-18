import React, { useState } from 'react';
import { Info } from 'lucide-react';
import TranscriptTab from './MeetingIntelligenceTab/EmptyTranscriptTab';
import SummaryTab from './MeetingIntelligenceTab/EmptySummaryTab';
import FollowUpTab from './MeetingIntelligenceTab/EmptyFollowUpTab';
import AnalyticsTab from './MeetingIntelligenceTab/EmptyAnalyticsTab';
import CoachingTab from './MeetingIntelligenceTab/EmptyCoachingTab';
import AskSamTab from './MeetingIntelligenceTab/EmptyAskSamTab';

interface EmptyMeetingIntelligenceProps {
  onNavigate?: (view: string) => void;
  onToggleEmpty?: (showEmpty: boolean) => void;
}

const EmptyMeetingIntelligence: React.FC<EmptyMeetingIntelligenceProps> = ({ onNavigate, onToggleEmpty }) => {
  const [activeTab, setActiveTab] = useState('transcript');
  
  const tabs = [
    { id: 'transcript', label: 'Transcript' },
    { id: 'summary', label: 'Meeting Summary' },
    { id: 'followup', label: 'Follow-up Letter' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'coaching', label: 'Coaching' },
    { id: 'asksam', label: 'Ask SAM' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'transcript':
        return <TranscriptTab />;
      case 'summary':
        return <SummaryTab onUploadClick={() => setActiveTab('transcript')} />;
      case 'followup':
        return <FollowUpTab onUploadClick={() => setActiveTab('transcript')} />;
      case 'analytics':
        return <AnalyticsTab onUploadClick={() => setActiveTab('transcript')} />;
      case 'coaching':
        return <CoachingTab onUploadClick={() => setActiveTab('transcript')} />;
      case 'asksam':
        return <AskSamTab onUploadClick={() => setActiveTab('transcript')} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white px-2 py-4">
        <div>
          {/* Top row - Title and Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Meeting Intelligence</h1>
              <Info className="w-5 h-5 text-[#605BFF] cursor-pointer hover:text-[#4B46CC] transition-colors" />
            </div>
          </div>     
        </div>
      </div>

      {/* Body Card */}
      <div className="flex-1 p-2">
        <div className="bg-white rounded-lg h-full flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="px-6">
              <nav className="flex space-x-8 justify-start">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? tab.id === 'asksam' 
                          ? 'border-[#fd7e14] text-[#fd7e14]'
                          : 'border-[#605BFF] text-[#605BFF]'
                        : tab.id === 'asksam'
                          ? 'border-transparent text-[#fd7e14] hover:text-[#fd7e14] hover:border-[#fd7e14]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 max-h-[calc(100vh-300px)] overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyMeetingIntelligence;