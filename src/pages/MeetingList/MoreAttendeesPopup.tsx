import React, { useState } from 'react';
import { X, Users, Copy, Check } from 'lucide-react';

interface Attendee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface MoreAttendeesPopupProps {
  isVisible: boolean;
  onClose: () => void;
  meetingData?: {
    attendees: Attendee[];
  };
}

const MoreAttendeesPopup: React.FC<MoreAttendeesPopupProps> = ({
  isVisible,
  onClose,
  meetingData={
    attendees: [
      { id: '1', name: 'John Smith', email: 'john.smith@techcorp.com' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@techcorp.com' },
      { id: '3', name: 'Mike Davis', email: 'mike.davis@techcorp.com' },
      { id: '4', name: 'Lisa Wang', email: 'lisa.wang@techcorp.com' },
      { id: '5', name: 'Robert Brown', email: 'robert.brown@techcorp.com' },
    ]
  }
}) => {
  const [copied, setCopied] = useState<string | null>(null);
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
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
      <div className="w-[500px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
        {/* Header - 可选 */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#605BFF]" />
              <h3 className="text-lg font-semibold text-gray-900">Meeting Attendees</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-200"
            >
              {/* X 图标 */}
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div>
          <div className="space-y-2">
            {meetingData.attendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {attendee.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attendee.name}</p>
                    <p className="text-xs text-gray-500">{attendee.email}</p>
                  </div>
                </div>
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
            ))}
          </div>
          {copied && (
            <div className="flex justify-center">
              <p className="text-xs text-green-600 mt-2 animate-in slide-in-from-top-1 duration-200">
                Email copied to clipboard!
              </p>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoreAttendeesPopup;