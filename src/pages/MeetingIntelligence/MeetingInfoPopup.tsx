import React, { useState } from 'react';
import { X } from 'lucide-react';
import ExistingMeetingPopup from './ExistingMeetingPopup';
import NewMeetingPopup from './NewMeetingPopup';

interface MeetingInfoPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onChooseExisting: () => void;
  onCreateNew: () => void;
}

const MeetingInfoPopup: React.FC<MeetingInfoPopupProps> = ({
  isVisible,
  onClose,
  onChooseExisting,
  onCreateNew
}) => {
  const [showExist, setShowExist] = useState(false);
  const [showNew, setShowNew] = useState(false);
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
      <div className="w-[500px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          <div className="text-center mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              There is no meeting connected to this meeting intelligence, what do you want to do?
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={setShowExist}
              className="w-full px-6 py-3 text-sm font-medium text-[#FF8E1C] bg-white border border-[#FF8E1C] hover:bg-[#FF8E1C] hover:text-white rounded-lg transition-all duration-200 shadow-sm"
            >
              Choose existing meeting
            </button>
            <button
              onClick={setShowNew}
              className="w-full px-6 py-3 text-sm font-medium text-[#605BFF] bg-white border border-[#605BFF] hover:bg-[#605BFF] hover:text-white rounded-lg transition-all duration-200 shadow-sm"
            >
              Create new meeting
            </button>
          </div>
        </div>
        {/* Existing Meeting Popup */}
        <ExistingMeetingPopup
          isVisible={showExist}
          onClose={() => setShowExist(false)}
        />

        {/* New Meeting Popup */}
        <NewMeetingPopup
          isVisible={showNew}
          onClose={() => setShowNew(false)}
        />
      </div>
    </div>
  );
};

export default MeetingInfoPopup;