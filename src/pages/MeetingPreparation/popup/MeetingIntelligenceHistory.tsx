import React, { useState } from 'react';
import { X, Search, Eye, ChevronLeft, ChevronRight, History } from 'lucide-react';

interface MeetingIntelligenceHistoryProps {
  onClose: () => void;
}

interface MeetingHistoryItem {
  id: number;
  date: string;
  subject: string;
  duration?: string;
}

const MeetingIntelligenceHistory: React.FC<MeetingIntelligenceHistoryProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mock data for meeting intelligence history
  const mockHistoryData: MeetingHistoryItem[] = [
    { id: 1, date: '2024-01-20', subject: 'Product Demo - Acme Corp', duration: '45 min' },
    { id: 2, date: '2024-01-19', subject: 'Discovery Call - TechStart', duration: '30 min' },
    { id: 3, date: '2024-01-18', subject: 'Negotiation - Global Solutions', duration: '60 min' },
    { id: 4, date: '2024-01-17', subject: 'Follow-up - Innovation Labs', duration: '25 min' },
    { id: 5, date: '2024-01-16', subject: 'Technical Review - StartupXYZ', duration: '40 min' },
    { id: 6, date: '2024-01-15', subject: 'Contract Discussion - MegaCorp', duration: '55 min' },
    { id: 7, date: '2024-01-14', subject: 'Demo Follow-up - TechCorp', duration: '35 min' },
    { id: 8, date: '2024-01-13', subject: 'Sales Presentation - DataFlow Inc', duration: '50 min' },
    { id: 9, date: '2024-01-12', subject: 'Requirements Gathering - CloudTech', duration: '45 min' },
    { id: 10, date: '2024-01-11', subject: 'Proposal Review - NextGen Solutions', duration: '40 min' },
    { id: 11, date: '2024-01-10', subject: 'Client Onboarding - SmartSys', duration: '30 min' },
    { id: 12, date: '2024-01-09', subject: 'Strategic Planning - FutureTech', duration: '65 min' }
  ];

  // Filter data based on search query
  const filteredData = mockHistoryData.filter(item =>
    item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.date.includes(searchQuery)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const PaginationComponent = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    totalItems, 
    itemsPerPage 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
  }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 text-sm rounded-md ${
                currentPage === page
                  ? 'text-[#605BFF] font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Total: {totalItems}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[800px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-[#605BFF]" />
            <h2 className="text-xl font-semibold text-gray-900">Meeting Intelligence History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by meeting subject or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF] focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 text-[#605BFF] bg-white rounded-lg hover:bg-[#605BFF] hover:text-white transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Meeting date</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Meeting subject</th>
                  {/*<th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Duration</th>*/}
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-900">{item.date}</td>
                      <td className="py-4 px-6 text-sm text-gray-900">{item.subject}</td>
                      {/*<td className="py-4 px-6 text-sm text-gray-600">{item.duration}</td>*/}
                      <td className="py-4 pl-3 pr-6 text-sm text-gray-600">
                        <button className="inline-flex items-center px-3 py-1 text-sm font-medium text-[#605BFF] bg-white rounded-lg hover:bg-[#605BFF] hover:text-white transition-colors gap-2">
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 px-6 text-center text-gray-500">
                      {searchQuery ? 'No meetings found matching your search.' : 'No meeting history available.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredData.length > 0 && (
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingIntelligenceHistory;