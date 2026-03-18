import React, { useState } from 'react';
import { X, Copy, Video, BookOpenCheck, Trash2, Check, Eye, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import DescriptionDetailPopup from './DescriptionDetailPopup';
import EditCompanyPopup from './EditCompanyPopup';
import EditDealPopup from './EditDealPopup';
import EditContactPopup from './EditContactPopup';

interface Attendee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface MeetingDetailsPopupProps {
  isVisible: boolean;
  onClose: () => void;
  meetingData?: {
    subject: string;
    description: string;
    status: 'Draft' | 'In Progress' | 'Completed' | 'Cancelled';
    clientCompany: string;
    deal: string;
    attendees: Attendee[];
  };
  onJoinMeeting: () => void;
  onReviewMeeting: () => void;
  onPrepareMeeting: () => void;
  onDeleteMeeting: () => void;
}

const MeetingDetailsPopup: React.FC<MeetingDetailsPopupProps> = ({
  isVisible,
  onClose,
  meetingData = {
    subject: 'Q4 Strategy Review Meeting',
    description: 'Comprehensive review of our Q4 business strategy, including market analysis, competitive positioning, and growth opportunities. We will discuss budget allocations, team restructuring, and key performance indicators for the upcoming quarter.',
    status: 'Draft',
    clientCompany: 'TechCorp Solutions',
    deal: 'Enterprise Software License - $450K',
    attendees: [
      { id: '1', name: 'John Smith', email: 'john.smith@techcorp.com' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@techcorp.com' },
      { id: '3', name: 'Mike Davis', email: 'mike.davis@techcorp.com' },
      { id: '4', name: 'Lisa Wang', email: 'lisa.wang@techcorp.com' },
      { id: '5', name: 'Robert Brown', email: 'robert.brown@techcorp.com' },
    ]
  },
  onJoinMeeting,
  onReviewMeeting,
  onPrepareMeeting,
  onDeleteMeeting
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const [showDescriptionDetail, setShowDescriptionDetail] = useState(false);
  const [showEditCompany, setShowEditCompany] = useState(false);
  const [showEditDeal, setShowEditDeal] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  if (!isVisible) return null;

  const handleCopyEmail = async (email: string, attendeeId: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(attendeeId);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-blue-100 text-blue-700';
      case 'In Progress':
        return 'bg-green-100 text-green-700';
      case 'Completed':
        return 'bg-gray-100 text-gray-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const displayedAttendees = showAllAttendees ? meetingData.attendees : meetingData.attendees.slice(0, 2);
  const hasMoreAttendees = meetingData.attendees.length > 2;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-96 bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
          {/* Header - Fixed */}
          <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-[#605BFF]" />
                <h3 className="text-lg font-semibold text-gray-900">Meeting Details</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body - Scrollable */}
          <div className="px-6 py-6 flex-1 overflow-y-auto">
            <div className="space-y-6">
              {/* Subject */}
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-800">Subject</label>
                <p className="text-sm text-gray-700">{meetingData.subject}</p>
              </div>

              {/* Description */}
              <div >
                <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                <div 
                  onClick={() => setShowDescriptionDetail(true)}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-700 line-clamp-2 flex-1">
                      {meetingData.description}
                    </p>
                    <Eye size={16} className="text-gray-400 group-hover:text-[#605BFF] ml-2 flex-shrink-0 mt-0.5" />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-800">Status</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meetingData.status)}`}>
                  {meetingData.status}
                </span>
              </div>

              {/* Client Company */}
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-800">Client Company</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-700">{meetingData.clientCompany}</p>
                  <button
                    onClick={() => setShowEditCompany(true)}
                    className="p-1 text-[#FF8E1C] hover:bg-orange-50 rounded transition-all duration-200"
                    title="Edit Company"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </div>

              {/* Deal */}
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-800">Deal</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-700">{meetingData.deal}</p>
                  <button
                    onClick={() => setShowEditDeal(true)}
                    className="p-1 text-[#FF8E1C] hover:bg-orange-50 rounded transition-all duration-200"
                    title="Edit Deal"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Attendees</label>
                <div className="space-y-2">
                  {displayedAttendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {attendee.name.charAt(0)}
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attendee.name}</p>
                            <p className="text-xs text-gray-500">{attendee.email}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            setSelectedContactId(attendee.id);
                            setShowEditContact(true);
                          }}
                          className="p-1 text-[#FF8E1C] hover:bg-orange-50 rounded transition-all duration-200"
                          title={`Edit ${attendee.name}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleCopyEmail(attendee.email, attendee.id)}
                          className="p-2 text-gray-400 hover:text-[#605BFF] hover:bg-white rounded-lg transition-all duration-200"
                          title={`Copy ${attendee.name}'s email`}
                        >
                          {copied === attendee.id ? (
                            <Check size={16} className="text-green-500" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {hasMoreAttendees && (
                    <label
                      onClick={() => setShowAllAttendees(!showAllAttendees)}
                      className="cursor-pointer text-[#605BFF] flex items-center justify-center gap-2"
                    >
                      {showAllAttendees ? (
                        <>
                          Show Less <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          More ({meetingData.attendees.length - 2}) <ChevronDown size={16} />
                        </>
                      )}
                    </label>
                  )}
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-2 animate-in slide-in-from-top-1 duration-200">
                    Email copied to clipboard!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <div className="space-y-3">
              {/* Join Meeting Button */}
              <button
                onClick={onJoinMeeting}
                className="w-full px-4 py-3 text-sm font-medium bg-gradient-to-r from-[#605BFF] to-[#7C6EFF] text-white rounded-lg hover:from-[#5048E5] hover:to-[#6B5EE5] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Video size={16} />
                Join Meeting
              </button>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onReviewMeeting}
                  className="flex-1 px-3 py-2.5 text-sm font-medium text-[#605BFF] bg-white border border-[#605BFF] hover:bg-[#605BFF] hover:text-white rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Review
                </button>
                <button
                  onClick={onPrepareMeeting}
                  className="flex-1 px-3 py-2.5 text-sm font-medium text-[#FF8E1C] bg-white border border-[#FF8E1C] hover:bg-[#FF8E1C] hover:text-white rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <BookOpenCheck size={16} />
                  Prepare
                </button>
                <button
                  onClick={onDeleteMeeting}
                  className="flex-1 px-3 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Detail Popup */}
      <DescriptionDetailPopup
        isVisible={showDescriptionDetail}
        onClose={() => setShowDescriptionDetail(false)}
        description={meetingData.description}
        subject={meetingData.subject}
      />

      {/* Edit Company Popup */}
      <EditCompanyPopup
        isVisible={showEditCompany}
        onClose={() => setShowEditCompany(false)}
        onSave={(data) => {
          console.log('Company data saved:', data);
          setShowEditCompany(false);
        }}
      />

      {/* Edit Deal Popup */}
      <EditDealPopup
        isVisible={showEditDeal}
        onClose={() => setShowEditDeal(false)}
        onSave={(data) => {
          console.log('Deal data saved:', data);
          setShowEditDeal(false);
        }}
      />

      {/* Edit Contact Popup */}
      <EditContactPopup
        isVisible={showEditContact}
        onClose={() => {
          setShowEditContact(false);
          setSelectedContactId(null);
        }}
        onSave={(data) => {
          console.log('Contact data saved:', data);
          setShowEditContact(false);
          setSelectedContactId(null);
        }}
      />
    </>
  );
};

export default MeetingDetailsPopup;