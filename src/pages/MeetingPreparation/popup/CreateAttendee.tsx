import React, { useState } from 'react';
import { X, Users } from 'lucide-react';

interface CreateAttendeeProps {
  onClose: () => void;
  onSave: (attendeeName: string) => void;
}

const CreateAttendee: React.FC<CreateAttendeeProps> = ({ onClose, onSave }) => {
  const [attendeeName, setAttendeeName] = useState('');

  const handleSave = () => {
    if (attendeeName.trim()) {
      onSave(attendeeName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-[#605BFF]" />
            <h3 className="text-lg font-semibold text-gray-900">Add New Attendee</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attendee Name
          </label>
          <input
            type="text"
            value={attendeeName}
            onChange={(e) => setAttendeeName(e.target.value)}
            placeholder="Enter attendee name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#605BFF] focus:border-[#605BFF]"
            autoFocus
          />
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!attendeeName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-[#605BFF] hover:bg-[#4c46e6] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAttendee;