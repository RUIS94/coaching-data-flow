import React, { useState } from 'react';
import { MoreVertical, ArrowLeft, Save, SaveIcon, Trash2, Share2 } from 'lucide-react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import ProgressBar from './ProgressBar';
import ShareAgendaPopup from './popup/ShareAgendaPopup';
import SelectSpecificPersonPopup from './popup/SelectSpecificPersonPopup';

export interface Attendee {
  name: string;
  company: string;
  title?: string;
}

export interface DealAssessment {
  dealId: string;
  status: 'PENDING' | 'DRAFT' | 'SUBMITTED';
  answers: Array<{ id: string; question: string; answer: string }>;
  voiceTranscript?: string;
  updatedAt?: string;
}

export interface MeetingData {
  meetingType: 'Meeting' | 'Call';
  subject: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  location: string;
  clientCompany: string;
  deal: string;
  attendees: Attendee[];
  discussionPoints: string[];
  recommendedQuestions: string[];
  repName: string;
  dealAssessments: Record<string, DealAssessment>;
  selectedDealsForCoaching: string[];
  coachingType: 'deals' | 'skills' | 'others';
}

interface MeetingPreparationProps {
  onNavigate?: (view: string) => void;
}

const MeetingPreparation: React.FC<MeetingPreparationProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showShareAgendaPopup, setShowShareAgendaPopup] = useState(false);
  const [showSelectSpecificPersonPopup, setShowSelectSpecificPersonPopup] = useState(false);
  
  // Get current date and time for defaults
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  const endTime = new Date(now.getTime() + 30 * 60000).toTimeString().slice(0, 5); // 30 minutes later
  
  const [meetingData, setMeetingData] = useState<MeetingData>({
    meetingType: 'Meeting',
    subject: '',
    startDate: currentDate,
    startTime: currentTime,
    endDate: currentDate,
    endTime: endTime,
    allDay: false,
    location: '',
    clientCompany: '',
    deal: '',
    attendees: [],
    discussionPoints: [],
    recommendedQuestions: [],
    repName: 'Sarah Chen',
    dealAssessments: {},
    selectedDealsForCoaching: [],
    coachingType: 'deals'
  });

  const updateMeetingData = (data: Partial<MeetingData>) => {
    setMeetingData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleFinish = () => {
    // setShowShareAgendaPopup(true);
    if (onNavigate) {
      onNavigate('meeting-list');
    }
  };

  const handleShareAgenda = (option: 'attendees' | 'specific' | 'link') => {
    // The actual sharing logic is handled within ShareAgendaPopup component
    console.log(`Share option selected: ${option}`);
  };

  const handleNavigateToMeetingList = () => {
    if (onNavigate) {
      onNavigate('meeting-list');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 data={meetingData} updateData={updateMeetingData} />;
      case 2:
        return <Step2 data={meetingData} updateData={updateMeetingData} />;
      case 3:
        return <Step3 data={meetingData} updateData={updateMeetingData} />;
      case 4:
        return <Step4 data={meetingData} updateData={updateMeetingData} />;
      default:
        return <Step1 data={meetingData} updateData={updateMeetingData} />;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-white flex flex-col">
      {/* Fixed Header */}
      <header className="flex-shrink-0 bg-white px-6 py-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-gray-900">Coaching Preparation</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              title="Back"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
            >
              <ArrowLeft size={20} />
            </button>
            
            {currentStep === 4 && (
              <button
                onClick={() => {
                  // Handle save as draft functionality
                  console.log('Save as Draft clicked');
                }}
                title="Save as Draft"
                className="flex items-center gap-2 px-4 py-1.5 text-sm bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Save size={20} />
              </button>
            )}

            {currentStep === 4 && (
              <button
                onClick={() => setShowSelectSpecificPersonPopup(true)}
                title="Share the Agenda"
                className="flex items-center gap-2 px-4 py-1.5 text-sm bg-white text-[#605BFF] rounded-lg hover:bg-[#605BFF] hover:text-white transition-colors"
              >
                <Share2 size={20} />
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-1.5 text-sm bg-white text-[#605BFF] border border-[#605BFF] rounded-lg hover:bg-[#605BFF] hover:text-white transition-colors"
              >
                <Save size={16} />
                Save & Continue
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-4 py-1.5 text-sm bg-white text-[#605BFF] border border-[#605BFF] rounded-lg hover:bg-[#605BFF] hover:text-white transition-colors"
              >
                Finish
              </button>
            )}
            
            <div className="relative">
               <button
                 onClick={() => setShowActionMenu(!showActionMenu)}
                 className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
               >
                 <MoreVertical size={18} />
               </button>
              {showActionMenu && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                   <button
                     onClick={() => {
                       // Handle save & exit
                       console.log('Save & Exit clicked');
                        if (onNavigate) {
                          onNavigate('meeting-list');
                        }
                       setShowActionMenu(false);
                     }}
                     className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 rounded-t-lg"
                   >
                     <SaveIcon size={14} />
                     Save & Exit
                   </button>
                   <button
                     onClick={() => {
                       // Handle discard
                       console.log('Discard clicked');
                        if (onNavigate) {
                          onNavigate('meeting-list');
                        }
                       setShowActionMenu(false);
                     }}
                     className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 rounded-b-lg"
                   >
                     <Trash2 size={14} />
                     Discard
                   </button>
                 </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Bar - Node center aligned with title and buttons */}
        <div className="absolute left-1/2 transform -translate-x-1/2" style={{top: 'calc(50% + 3px)'}}>
          <ProgressBar 
            currentStep={currentStep} 
            totalSteps={4} 
            onStepClick={setCurrentStep}
          />
        </div>
      </header>

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto p-6 pt-12 min-h-0">
        <div className="max-w-full">
          {renderCurrentStep()}
        </div>
      </div>
      
      {/* Share Agenda Popup */}
      <ShareAgendaPopup
        isOpen={showShareAgendaPopup}
        onClose={() => setShowShareAgendaPopup(false)}
        onShare={handleShareAgenda}
        attendees={meetingData.attendees.map(attendee => ({
          name: attendee.name,
          email: `${attendee.name.toLowerCase().replace(' ', '.')}@${attendee.company.toLowerCase().replace(' ', '')}.com`,
          jobTitle: attendee.title || 'Team Member',
          company: attendee.company
        }))}
        meetingSubject={meetingData.subject || 'Meeting'}
        onNavigateToMeetingList={handleNavigateToMeetingList}
      />

      {/* Select Specific Person Popup for Share button */}
      {showSelectSpecificPersonPopup && (
        <SelectSpecificPersonPopup
          isOpen={showSelectSpecificPersonPopup}
          onClose={() => setShowSelectSpecificPersonPopup(false)}
          attendees={meetingData.attendees.map(attendee => ({
            name: attendee.name,
            email: `${attendee.name.toLowerCase().replace(' ', '.')}@${attendee.company.toLowerCase().replace(' ', '')}.com`,
            jobTitle: attendee.title || 'Team Member',
            company: attendee.company
          }))}
          onShare={(selectedAttendees) => {
            console.log('Agenda shared with:', selectedAttendees.map(a => a.email));
            setShowSelectSpecificPersonPopup(false);
          }}
          autoSelectAll
        />
      )}
    </div>
  );
};

export default MeetingPreparation;
