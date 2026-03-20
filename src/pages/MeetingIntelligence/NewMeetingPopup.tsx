import React, { useState } from 'react';
import { X, Save, CalendarPlus } from 'lucide-react';

interface NewMeetingPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const NewMeetingPopup: React.FC<NewMeetingPopupProps> = ({
  isVisible,
  onClose
}) => {
  const [formData, setFormData] = useState({
    clientCompany: '',
    attendee: '',
    deal: '',
    subject: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    lead: '',
    direction: ''
  });

  const clientCompanies = ['TechCorp Inc.', 'Global Solutions', 'MediaWorks Ltd.', 'Innovation Hub', 'StartupXYZ'];
  const attendees = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Robert Wilson'];
  const deals = ['New Business', 'Other Deal'];
  const leads = ['Alice Cooper', 'Bob Martin', 'Carol White', 'David Brown', 'Eva Green'];
  const directions = ['Inbound', 'Outbound'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
      <div className="w-[600px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarPlus size={18} className="text-[#605BFF]" />
              <h3 className="text-lg font-semibold text-gray-900">Create Meeting</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* Client Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Company</label>
              <select
                value={formData.clientCompany}
                onChange={(e) => handleInputChange('clientCompany', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center', 
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1rem 1rem'
                }}
              >
                <option value="">Select client company...</option>
                {clientCompanies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            {/* Attendee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendee</label>
              <select
                value={formData.attendee}
                onChange={(e) => handleInputChange('attendee', e.target.value)}
                className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center', 
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1rem 1rem'
                }}
              >
                <option value="">Select attendee...</option>
                {attendees.map(attendee => (
                  <option key={attendee} value={attendee}>{attendee}</option>
                ))}
              </select>
            </div>

            {/* Deal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deal</label>
              <select
                value={formData.deal}
                onChange={(e) => handleInputChange('deal', e.target.value)}
                className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1rem 1rem'
                }}
              >
                <option value="">Select Deal...</option>
                {deals.map(deal => (
                  <option key={deal} value={deal}>{deal}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter meeting subject..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200"
              />
            </div>

            {/* Start Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200"
                />
              </div>
            </div>

            {/* End Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200"
                />
              </div>
            </div>

            {/* Lead */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead</label>
              <select
                value={formData.lead}
                onChange={(e) => handleInputChange('lead', e.target.value)}
                className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center', 
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1rem 1rem'
                }}
              >
                <option value="">Select lead...</option>
                {leads.map(lead => (
                  <option key={lead} value={lead}>{lead}</option>
                ))}
              </select>
            </div>

           {/* Direction */}
           <div className="flex bg-gray-100 rounded-lg p-1 gap-2">
              <button
                onClick={() => handleInputChange('direction', 'Inbound')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg transition-colors ${
                  formData.direction === 'Inbound'
                    ? 'bg-white text-[#605BFF] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Inbound
              </button>
              {/* Outbound 按钮 */}
              <button
                onClick={() => handleInputChange('direction', 'Outbound')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg transition-colors ${
                  formData.direction === 'Outbound'
                    ? 'bg-white text-[#605BFF] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Outbound
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 text-sm font-medium bg-white border border-[#605BFF] text-[#605BFF] rounded-lg transition-all duration-200 shadow-lg hover:bg-[#605BFF] hover:text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMeetingPopup;
