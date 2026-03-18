import React from 'react';
import { X, FileText } from 'lucide-react';

interface DescriptionDetailPopupProps {
  isVisible: boolean;
  onClose: () => void;
  description: string;
  subject: string;
}

const DescriptionDetailPopup: React.FC<DescriptionDetailPopupProps> = ({
  isVisible,
  onClose,
  description,
  subject
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
      <div className="w-[500px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[#605BFF]" />
              <h3 className="text-lg font-semibold text-gray-900">Meeting Description</h3>
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Subject</label>
              <p className="text-sm text-gray-700 font-medium">{subject}</p>
            </div>
            <hr className="border-dashed border-t border-gray-300" />
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Full Description</label>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            </div>
            <hr className="border-dashed border-t border-gray-300" />
            <div>
              <label className="block text-sm mb-2 flex items-center space-x-2">
                <span className="font-semibold text-gray-800">Microsoft Teams</span>
                <a
                  href="#"
                  className="text-xs text-blue-600 underline hover:cursor-pointer hover:text-blue-700"
                >
                    Need help?
                </a>
              </label>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-blue-600 underline hover:cursor-pointer hover:text-blue-700">
                  Join the meeting now
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  Meeting ID: 000 000 000 000
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  Passcode: abcdefg
                </p>
              </div>
              <hr className="border-dashed border-t border-gray-300" />
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                For organizers: <a href="#" className="text-sm text-blue-600 underline hover:cursor-pointer hover:text-blue-700">Meeting options</a>
              </p>
            </div>
            
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DescriptionDetailPopup;