import React, { useState } from 'react';
import { 
  Info, 
  Pencil, 
  Share2, 
  MessageCircle, 
  Copy, 
  Printer, 
  Mail,
  Plus,
  Link,
  FileText,
  Play,
  Volume2,
  MoreHorizontal,
  Download,
  Gauge
} from 'lucide-react';
import TranscriptTab from './MeetingIntelligenceTab/TranscriptTab';
import SummaryTab from './MeetingIntelligenceTab/SummaryTab';
import FollowUpTab from './MeetingIntelligenceTab/FollowUpTab';
import AnalyticsTab from './MeetingIntelligenceTab/AnalyticsTab';
import CoachingTab from './MeetingIntelligenceTab/CoachingTab';
import AskSamTab from './MeetingIntelligenceTab/AskSamTab';
import MeetingInfoPopup from './MeetingInfoPopup';

interface MeetingIntelligenceProps {
  onNavigate?: (view: string) => void;
  onToggleEmpty?: (showEmpty: boolean) => void;
}

const MeetingIntelligence: React.FC<MeetingIntelligenceProps> = ({ onNavigate, onToggleEmpty }) => {
  const [activeTab, setActiveTab] = useState('transcript');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);
  
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
        return <SummaryTab />;
      case 'followup':
        return <FollowUpTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'coaching':
        return <CoachingTab />;
      case 'asksam':
        return <AskSamTab />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-4">
        <div>
          {/* Top row - Title and Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Meeting Intelligence</h1>
              <Info className="w-5 h-5 text-[#605BFF] cursor-pointer hover:text-[#4B46CC] transition-colors" />
            </div>
            
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Action Buttons */}
              <button 
                onClick={() => {
                  onToggleEmpty?.(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-[#605BFF] text-white rounded-lg hover:bg-[#4B46CC] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Transcript</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 border border-[#605BFF] text-[#605BFF] rounded-lg hover:bg-[#605BFF] hover:text-white transition-colors">
                <Link className="w-4 h-4" />
                <span className="text-sm font-medium">Associate With</span>
              </button>
              
              <button 
                onClick={() => setShowMeetingInfo(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-[#605BFF] text-[#605BFF] rounded-lg hover:bg-[#605BFF] hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Meeting Info</span>
              </button>
              
              {/* Icon Actions */}
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                <Share2 className="w-5 h-5 text-[#605BFF] cursor-pointer hover:text-[#4B46CC] transition-colors" />
                <MessageCircle className="w-5 h-5 text-[#605BFF] cursor-pointer hover:text-[#4B46CC] transition-colors" />
                <Copy className="w-5 h-5 text-[#605BFF] cursor-pointer hover:text-[#4B46CC] transition-colors" />
                <Printer className="w-5 h-5 text-[#605BFF] cursor-pointer hover:text-[#4B46CC] transition-colors" />
                <Mail className="w-5 h-5 text-[#605BFF] cursor-pointer hover:text-[#4B46CC] transition-colors" />
              </div>
            </div>
          </div>
          
          {/* Bottom row - Transcript info */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-gray-700 font-medium">Jul 18, 10:45 - Driving Rapid Revenue Growth</span>
              <Pencil className="w-4 h-4 text-[#FF8E1C] cursor-pointer hover:bg-gray-100 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Body Card */}
      <div className="flex-1 p-2">
        <div className="bg-white rounded-lg h-full flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            {/* Audio Player */}
            <div className="px-6 py-2 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-center space-x-4">
                {/* Play Button */}
                <button className="w-6 h-6 flex items-center justify-center hover:text-[#4B46CC] transition-colors flex-shrink-0 text-[#605BFF]">
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                </button>
                
                {/* Play Time */}
                <span className="text-sm text-gray-600 font-mono flex-shrink-0">1:22 / 6:04</span>
                
                {/* Progress Bar */}
                <div className="w-1/6 mx-4">
                  <div className="w-full bg-gray-300 rounded-full h-1 cursor-pointer">
                    <div className="bg-[#605BFF] h-1 rounded-full transition-all" style={{ width: '22%' }}></div>
                  </div>
                </div>
                
                {/* Mute Icon */}
                <button className="text-gray-600 hover:text-[#605BFF] transition-colors flex-shrink-0">
                  <Volume2 className="w-4 h-4" />
                </button>
                
                {/* Action Button with Menu */}
                <div className="relative flex-shrink-0">
                  <button 
                    onClick={() => setShowActionMenu(!showActionMenu)}
                    className="text-gray-600 hover:text-[#605BFF] transition-colors p-1"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showActionMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[180px]">
                      <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <Gauge className="w-4 h-4" />
                        <span>Playback Speed</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
      
      {/* Meeting Info Popup */}
      <MeetingInfoPopup
        isVisible={showMeetingInfo}
        onClose={() => setShowMeetingInfo(false)}
        onChooseExisting={() => {
          console.log('Choose existing meeting');
          setShowMeetingInfo(false);
        }}
        onCreateNew={() => {
          console.log('Create new meeting');
          setShowMeetingInfo(false);
        }}
      />
    </div>
  );
};

export default MeetingIntelligence;