import React, { useState } from 'react';
import { X, Send, Link, Users } from 'lucide-react';
import { useToastContext } from '../../../contexts/ToastContext';
import SelectSpecificPersonPopup from './SelectSpecificPersonPopup';
import ShareableLinkPopup from './ShareableLinkPopup';

interface ShareAgendaPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (option: 'attendees' | 'specific' | 'link') => void;
  attendees?: Array<{
    name: string;
    email: string;
    jobTitle?: string;
    company?: string;
  }>;
  meetingSubject?: string;
  onNavigateToMeetingList?: () => void;
}

type Attendee = {
  name: string;
  email: string;
  jobTitle?: string;
  company?: string;
};

const ShareAgendaPopup: React.FC<ShareAgendaPopupProps> = ({ 
  isOpen, 
  onClose, 
  onShare, 
  attendees = [
    { name: 'John Smith', email: 'john.smith@company.com', jobTitle: 'Product Manager', company: 'Tech Corp' },
    { name: 'Sarah Johnson', email: 'sarah.johnson@company.com', jobTitle: 'Designer', company: 'Tech Corp' },
    { name: 'Mike Chen', email: 'mike.chen@partner.com', jobTitle: 'Developer', company: 'Partner Inc' },
    { name: 'Lisa Wang', email: 'lisa.wang@client.com', jobTitle: 'Director', company: 'Client Ltd' }
  ], 
  meetingSubject = 'Meeting',
  onNavigateToMeetingList 
}) => {
  const [showSelectPersonPopup, setShowSelectPersonPopup] = useState(false);
  const [showShareableLinkPopup, setShowShareableLinkPopup] = useState(false);
  const { showSuccess } = useToastContext();

  if (!isOpen) return null;

  const handleShare = (option: 'attendees' | 'specific' | 'link') => {
    if (option === 'attendees') {
      // Send to all attendees
      const attendeeNames = attendees.map(attendee => attendee.name).join(', ');
      showSuccess(`Agenda has been successfully sent to all attendees: ${attendeeNames}`);
      handleComplete();
    } else if (option === 'specific') {
      // Show select person popup
      setShowSelectPersonPopup(true);
    } else if (option === 'link') {
      // Show shareable link popup
      setShowShareableLinkPopup(true);
    }
    onShare(option);
  };

  const handleComplete = () => {
    showSuccess(`Meeting "${meetingSubject}" has been successfully created and agenda shared.`);
    onClose();
    setTimeout(() => {
      if (onNavigateToMeetingList) {
        onNavigateToMeetingList();
      } else {
        // Navigate to meeting list page
        window.location.href = '/src/components/MeetingList/MeetingList.tsx';
      }
    }, 1000);
  };

  const handleSkip = () => {
    showSuccess(`Meeting "${meetingSubject}" has been successfully created.`);
    onClose();
    setTimeout(() => {
      if (onNavigateToMeetingList) {
        onNavigateToMeetingList();
      } else {
        // Navigate to meeting list page
        window.location.href = '/src/components/MeetingList/MeetingList.tsx';
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Share Agenda</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Would you like to share the meeting agenda?
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => handleShare('attendees')}
            className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Send to All Attendees</h4>
              <p className="text-sm text-gray-500">Share agenda with all meeting participants</p>
            </div>
          </button>
          
          <button
            onClick={() => handleShare('specific')}
            className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <Send size={20} className="text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Send to Specific Person</h4>
              <p className="text-sm text-gray-500">Choose specific recipients for the agenda</p>
            </div>
          </button>
          
          <button
            onClick={() => handleShare('link')}
            className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <Link size={20} className="text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Generate Shareable Link</h4>
              <p className="text-sm text-gray-500">Create a link that anyone can access with link</p>
            </div>
          </button>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
      
      {/* Select Specific Person Popup */}
      {showSelectPersonPopup && (
        <SelectSpecificPersonPopup
          isOpen={showSelectPersonPopup}
          onClose={() => setShowSelectPersonPopup(false)}
          attendees={attendees}
          onShare={(selectedAttendees: Attendee[]) => {
            const names = selectedAttendees.map((a) => a.name).join(', ');
            showSuccess(`Agenda has been successfully sent to: ${names}`);
            setShowSelectPersonPopup(false);
            handleComplete();
          }}
        />
      )}
      
      {/* Shareable Link Popup */}
      {showShareableLinkPopup && (
        <ShareableLinkPopup
          isOpen={showShareableLinkPopup}
          onClose={() => setShowShareableLinkPopup(false)}
          onComplete={() => {
            setShowShareableLinkPopup(false);
            handleComplete();
          }}
        />
      )}
    </div>
  );
};

export default ShareAgendaPopup;
