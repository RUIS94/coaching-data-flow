import React, { useState } from 'react';
import { X, Copy, Video, BookOpenCheck, Trash2, Check } from 'lucide-react';

interface QuickMeetingPopupProps {
  isVisible: boolean;
  onClose: () => void;
  meetingLink?: string;
  onJoinMeeting: () => void;
  onPrepareMeeting: () => void;
  onDeleteMeeting: () => void;
}

const QuickMeetingPopup: React.FC<QuickMeetingPopupProps> = ({
  isVisible,
  onClose,
  meetingLink = 'https://zoom.us/wc/join/84765442238',
  onJoinMeeting,
  onPrepareMeeting,
  onDeleteMeeting
}) => {
  const [copied, setCopied] = useState(false);

  if (!isVisible) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-96 bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video size={18} className="text-[#605BFF]" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Meeting</h3>
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
        <div className="px-6 py-6 max-h-96 overflow-y-auto">
          <div className="space-y-6">
            {/* Meeting Link */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Meeting Link</label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex-1 text-sm text-gray-700 font-mono break-all">
                  {meetingLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex-shrink-0 p-2 text-gray-500 hover:text-[#605BFF] hover:bg-white rounded-lg transition-all duration-200 relative"
                  title="Copy link"
                >
                  {copied ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1 animate-in slide-in-from-top-1 duration-200">
                  Link copied to clipboard!
                </p>
              )}
            </div>

            {/* Join Meeting Button */}
            <div>
              <button
                onClick={onJoinMeeting}
                className="w-full px-4 py-3 text-sm font-medium bg-gradient-to-r from-[#605BFF] to-[#7C6EFF] text-white rounded-lg hover:from-[#5048E5] hover:to-[#6B5EE5] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Video size={16} />
                Join Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onPrepareMeeting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-[#FF8E1C] bg-white border border-[#FF8E1C] hover:bg-[#FF8E1C] hover:text-white rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <BookOpenCheck size={16} />
              Prepare
            </button>
            <button
              onClick={onDeleteMeeting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickMeetingPopup;