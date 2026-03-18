import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useToastContext } from '../../../contexts/ToastContext';

interface Attendee {
  name: string;
  email: string;
  jobTitle?: string;
  company?: string;
}

interface SelectSpecificPersonPopupProps {
  isOpen: boolean;
  onClose: () => void;
  attendees: Attendee[];
  onShare: (selectedAttendees: Attendee[]) => void;
  autoSelectAll?: boolean;
}

const SelectSpecificPersonPopup: React.FC<SelectSpecificPersonPopupProps> = ({
  isOpen,
  onClose,
  attendees,
  onShare,
  autoSelectAll = false
}) => {
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(new Set());
  const { showSuccess } = useToastContext();

  useEffect(() => {
    if (isOpen && autoSelectAll) {
      setSelectedAttendees(new Set(attendees.map(a => a.email)));
    }
  }, [isOpen, autoSelectAll, attendees]);

  if (!isOpen) return null;

  const handleToggleAttendee = (email: string) => {
    const newSelected = new Set(selectedAttendees);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedAttendees(newSelected);
  };

  const handleShare = () => {
    const selected = attendees.filter(attendee => selectedAttendees.has(attendee.email));
    if (selected.length > 0) {
      onShare(selected);
      showSuccess('Agenda shared successfully');
    }
  };

  const handleSelectAll = () => {
    if (selectedAttendees.size === attendees.length) {
      setSelectedAttendees(new Set());
    } else {
      setSelectedAttendees(new Set(attendees.map(a => a.email)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Attendees</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Select the attendees you want to share the agenda with:
            </p>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedAttendees.size === attendees.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="overflow-y-auto max-h-96">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 w-12">Select</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Job title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Company</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee, index) => (
                  <tr
                    key={attendee.email}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedAttendees.has(attendee.email) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleToggleAttendee(attendee.email)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <div
                          className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                            selectedAttendees.has(attendee.email)
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedAttendees.has(attendee.email) && <Check size={12} />}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{attendee.name}</td>
                    <td className="py-3 px-4 text-gray-600">{attendee.email}</td>
                    <td className="py-3 px-4 text-gray-600">{attendee.jobTitle || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{attendee.company || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {attendees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attendees available
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedAttendees.size} of {attendees.length} attendees selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={selectedAttendees.size === 0}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedAttendees.size > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Share Agenda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectSpecificPersonPopup;
