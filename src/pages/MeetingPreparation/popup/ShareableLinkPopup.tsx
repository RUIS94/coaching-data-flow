import React, { useState } from 'react';
import { X, Copy, Check, Link } from 'lucide-react';
import { useToastContext } from '../../../contexts/ToastContext';

interface ShareableLinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const ShareableLinkPopup: React.FC<ShareableLinkPopupProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [copied, setCopied] = useState(false);
  const { showSuccess } = useToastContext();
  
  // Sample shareable link
  const shareableLink = 'https://meetingapp.com/agenda/share/abc123def456ghi789';

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      showSuccess('Shareable link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareableLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      showSuccess('Shareable link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleComplete = () => {
    showSuccess('Shareable link generated successfully!');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Generate Shareable Link</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Link className="text-blue-600" size={20} />
              <h3 className="text-lg font-medium text-gray-900">Shareable Agenda Link</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Share this link with anyone to give them access to the meeting agenda. 
              Recipients can view the agenda without needing to log in.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareableLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  copied
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Link Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• View-only access to the meeting agenda</li>
              <li>• No login required for recipients</li>
              <li>• Link expires 30 days after meeting date</li>
              <li>• Can be shared via email, messaging, or any platform</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareableLinkPopup;