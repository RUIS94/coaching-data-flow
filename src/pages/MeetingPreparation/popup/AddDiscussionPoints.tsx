import React, { useState } from 'react';
import { X, Plus, FilePlus2, ChevronDown } from 'lucide-react';
import { Attendee } from '../MeetingPreparation';

interface AddDiscussionPointsProps {
  onClose: () => void;
  onAdd: (discussionPoint: string, objective: string, stakeholder: string, keyResults: string) => void;
  attendees: Attendee[];
}

const AddDiscussionPoints: React.FC<AddDiscussionPointsProps> = ({ onClose, onAdd, attendees }) => {
  const [discussionPoint, setDiscussionPoint] = useState('');
  const [objective, setObjective] = useState('');
  const [selectedStakeholder, setSelectedStakeholder] = useState('');
  const [showStakeholderDropdown, setShowStakeholderDropdown] = useState(false);
  const [keyResults] = useState('Key Results');

  const handleAddDiscussionPoint = () => {
    if (discussionPoint.trim() && objective.trim()) {
      onAdd(discussionPoint.trim(), objective.trim(), selectedStakeholder, keyResults);
      setDiscussionPoint('');
      setObjective('');
      setSelectedStakeholder('');
    }
  };

  const handleStakeholderSelect = (stakeholder: string) => {
    setSelectedStakeholder(stakeholder);
    setShowStakeholderDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add Discussion Points</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Discussion Point Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discussion point
            </label>
            <input
              type="text"
              value={discussionPoint}
              onChange={(e) => setDiscussionPoint(e.target.value)}
              placeholder="Enter discussion point..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#605BFF] focus:border-[#605BFF]"
            />
          </div>

          {/* Objective Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objective
            </label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Enter objective..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#605BFF] focus:border-[#605BFF]"
            />
          </div>

          {/* Stakeholder Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stakeholder
            </label>
            <div className="relative">
              <button
                onClick={() => setShowStakeholderDropdown(!showStakeholderDropdown)}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white hover:border-[#605BFF] focus:ring-[#605BFF] focus:border-[#605BFF] flex items-center justify-between"
              >
                <span className={selectedStakeholder ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedStakeholder || 'Select stakeholder...'}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showStakeholderDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {attendees.map((attendee, index) => (
                    <button
                      key={index}
                      onClick={() => handleStakeholderSelect(attendee.name)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {attendee.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Key Results */}
          <div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Key Results
              </label>
              <FilePlus2 size={16} className="text-[#605BFF]" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDiscussionPoint}
              disabled={!discussionPoint.trim() || !objective.trim()}
              className="px-4 py-2 bg-[#605BFF] text-white rounded-lg hover:bg-[#5248FF] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Add Discussion Point
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDiscussionPoints;