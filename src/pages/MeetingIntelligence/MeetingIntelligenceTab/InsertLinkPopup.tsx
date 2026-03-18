import React, { useState } from 'react';
import { Link } from 'lucide-react';
import Popup from './Popup';

interface InsertLinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, text: string, openInNewWindow: boolean) => void;
}

const InsertLinkPopup: React.FC<InsertLinkPopupProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [url, setUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [openInNewWindow, setOpenInNewWindow] = useState(false);

  const handleInsert = () => {
    if (url.trim()) {
      onInsert(url.trim(), linkText.trim() || url.trim(), openInNewWindow);
      handleClose();
    }
  };

  const handleClose = () => {
    setUrl('');
    setLinkText('');
    setOpenInNewWindow(false);
    onClose();
  };

  const footer = (
    <div className="flex justify-end space-x-3">
      <button
        onClick={handleClose}
        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleInsert}
        disabled={!url.trim()}
        className="px-4 py-2 bg-[#605BFF] text-white rounded-lg hover:bg-[#4A45FF] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Ok
      </button>
    </div>
  );

  const titleWithIcon = (
    <>
      <Link size={18} className="text-[#605BFF]" />
      <h2 className="text-xl font-semibold text-gray-900">Insert Link</h2>
    </>
  );

  return (
    <Popup
      isOpen={isOpen}
      onClose={handleClose}
      title={titleWithIcon}
      footer={footer}
      width="max-w-md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link Address
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF] focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link Text
          </label>
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Link display text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF] focus:border-transparent"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="newWindow"
            checked={openInNewWindow}
            onChange={(e) => setOpenInNewWindow(e.target.checked)}
            className="w-4 h-4 text-[#605BFF] bg-gray-100 border-gray-300 rounded focus:ring-[#605BFF] focus:ring-2"
          />
          <label htmlFor="newWindow" className="ml-2 text-sm text-gray-700">
            Open in new window
          </label>
        </div>
      </div>
    </Popup>
  );
};

export default InsertLinkPopup;