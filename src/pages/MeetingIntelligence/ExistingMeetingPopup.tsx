import React, { useState } from 'react';
import { X, Search, Eraser, ChevronLeft, ChevronRight, MousePointer2 } from 'lucide-react';

interface Meeting {
  id: number;
  subject: string;
  meetingTime: string;
  clientCompany: string;
  deal: string;
}

interface ExistingMeetingPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const ExistingMeetingPopup: React.FC<ExistingMeetingPopupProps> = ({
  isVisible,
  onClose
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data - 10 meetings
  const mockMeetings: Meeting[] = [
    { id: 1, subject: 'Q4 Business Review', meetingTime: '2024-01-15 10:00', clientCompany: 'TechCorp Inc.', deal: 'Enterprise License' },
    { id: 2, subject: 'Product Demo Session', meetingTime: '2024-01-16 14:30', clientCompany: 'Global Solutions', deal: 'Software Integration' },
    { id: 3, subject: 'Contract Negotiation', meetingTime: '2024-01-17 09:00', clientCompany: 'MediaWorks Ltd.', deal: 'Annual Subscription' },
    { id: 4, subject: 'Strategic Planning', meetingTime: '2024-01-18 11:15', clientCompany: 'Innovation Hub', deal: 'Consulting Services' },
    { id: 5, subject: 'Technical Discussion', meetingTime: '2024-01-19 15:45', clientCompany: 'StartupXYZ', deal: 'Platform Migration' },
    { id: 6, subject: 'Partnership Meeting', meetingTime: '2024-01-20 13:20', clientCompany: 'Alliance Corp', deal: 'Joint Venture' },
    { id: 7, subject: 'Budget Review', meetingTime: '2024-01-21 10:30', clientCompany: 'Finance Pro', deal: 'Cost Optimization' },
    { id: 8, subject: 'Training Session', meetingTime: '2024-01-22 16:00', clientCompany: 'EduTech Solutions', deal: 'Training Package' },
    { id: 9, subject: 'Sales Presentation', meetingTime: '2024-01-23 12:00', clientCompany: 'Retail Giants', deal: 'POS System' },
    { id: 10, subject: 'Follow-up Discussion', meetingTime: '2024-01-24 14:00', clientCompany: 'Manufacturing Co.', deal: 'Equipment Upgrade' }
  ];

  const itemsPerPage = 6;
  const totalPages = Math.ceil(mockMeetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayMeetings = mockMeetings.slice(startIndex, startIndex + itemsPerPage);

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSelect = (meeting: Meeting) => {
    console.log('Selected meeting:', meeting);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
      <div className="w-[900px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer2 size={18} className="text-[#605BFF]" />
              <h3 className="text-lg font-semibold text-gray-900">Select Meeting</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Controls in Header */}
          <div className="mt-4 flex items-center gap-4">
            {/* Search Box */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200"
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200"
              />
            </div>

            {/* Clear and Search */}
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <Eraser size={16} />
                Clear
              </button>
              <button
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-[#605BFF] bg-white border border-[#605BFF] hover:bg-[#605BFF] hover:text-white rounded-lg transition-all duration-200"
              >
                <Search size={16} />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-gray-100"></div>

        {/* Body */}
        <div className="px-6 py-6 flex-1 overflow-y-auto">
          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Meeting Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Client Company</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Deal</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayMeetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{meeting.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{meeting.meetingTime}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{meeting.clientCompany}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{meeting.deal}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleSelect(meeting)}
                        className="px-4 py-1.5 text-sm font-medium text-[#605BFF] hover:text-white hover:bg-[#605BFF] border border-[#605BFF] rounded-lg transition-all duration-200"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-start mt-4">
            <div className="flex items-center gap-1">
              {/* Previous Arrow */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center rounded transition-all duration-200 ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:text-[#605BFF] hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded transition-all duration-200 ${
                    currentPage === page
                      ? 'text-[#605BFF]'
                      : 'text-gray-600 hover:text-[#605BFF] hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {/* Next Arrow */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 flex items-center justify-center rounded transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:text-[#605BFF] hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExistingMeetingPopup;