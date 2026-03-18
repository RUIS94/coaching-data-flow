import React, { useState, useMemo } from 'react';
import { Copy, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { Meeting, CalendarViewType } from './MeetingList';
import MeetingDetailsPopup from './MeetingDetailsPopup';
import MoreAttendeesPopup from './MoreAttendeesPopup';

interface ListViewProps {
  meetings: Meeting[];
  viewType: CalendarViewType;
  currentDate: Date;
}

type SortField = 'date' | 'createDate' | 'readiness';
type SortDirection = 'asc' | 'desc';

const ListView: React.FC<ListViewProps> = ({ meetings, viewType, currentDate }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [showMoreAttendees, setShowMoreAttendees] = useState(false);
  const [moreAttendeesData, setMoreAttendeesData] = useState<Meeting | null>(null);

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isSameWeek = (date1: Date, date2: Date) => {
    const weekStart1 = new Date(date1);
    weekStart1.setDate(date1.getDate() - date1.getDay());
    const weekStart2 = new Date(date2);
    weekStart2.setDate(date2.getDate() - date2.getDay());
    return weekStart1.toDateString() === weekStart2.toDateString();
  };

  const isSameMonth = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() && 
           date1.getMonth() === date2.getMonth();
  };

  const filteredMeetings = useMemo(() => {
    console.log('All meetings:', meetings);
    console.log('Current date:', currentDate);
    console.log('View type:', viewType);
    
    return meetings.filter(meeting => {
      if (viewType === 'day') {
        return isSameDate(meeting.date, currentDate);
      } else if (viewType === 'week') {
        return isSameWeek(meeting.date, currentDate);
      } else {
        return isSameMonth(meeting.date, currentDate);
      }
    });
  }, [meetings, viewType, currentDate]);
  
  console.log('Filtered meetings:', filteredMeetings);

  const sortedMeetings = useMemo(() => {
    return [...filteredMeetings].sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortField) {
        case 'date':
          aValue = a.date.getTime();
          bValue = b.date.getTime();
          break;
        case 'createDate':
          aValue = a.createDate.getTime();
          bValue = b.createDate.getTime();
          break;
        case 'readiness':
          aValue = a.readiness;
          bValue = b.readiness;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredMeetings, sortField, sortDirection]);

  const paginatedMeetings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedMeetings.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedMeetings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedMeetings.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleViewMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingDetails(true);
  };

  const handleShowMoreAttendees = (meeting: Meeting) => {
    setMoreAttendeesData(meeting);
    setShowMoreAttendees(true);
  };

  const closeMeetingDetails = () => {
    setShowMeetingDetails(false);
    setSelectedMeeting(null);
  };

  const closeMoreAttendees = () => {
    setShowMoreAttendees(false);
    setMoreAttendeesData(null);
  };

  const copyAttendeeInfo = (attendee: { name: string; email: string; phone: string }) => {
    const info = `${attendee.name}\n${attendee.email}\n${attendee.phone}`;
    navigator.clipboard.writeText(info);
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp size={16} className="text-[#605BFF]" /> : 
      <ChevronDown size={16} className="text-[#605BFF]" />;
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow border">
      {/* Table */}
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                #
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  Meeting Date
                  <SortIcon field="date" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Subject
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Attendees
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Client Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Deal
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createDate')}
              >
                <div className="flex items-center gap-1">
                  Create Date
                  <SortIcon field="createDate" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('readiness')}
              >
                <div className="flex items-center gap-1">
                  Readiness
                  <SortIcon field="readiness" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedMeetings.map((meeting, index) => (
              <tr key={meeting.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {((currentPage - 1) * itemsPerPage) + index + 1}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div>
                    {meeting.date.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {meeting.startTime} - {meeting.endTime}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {meeting.subject}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="space-y-1">
                    {meeting.attendees.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span>{meeting.attendees[0].name}</span>
                        <button
                          onClick={() => copyAttendeeInfo(meeting.attendees[0])}
                          className="text-gray-400 hover:text-[#605BFF] transition-colors"
                          title="Copy attendee info"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    )}
                     {meeting.attendees.length > 1 && (
                      <button
                        onClick={() => handleShowMoreAttendees(meeting)}
                        className="text-xs text-[#605BFF] hover:text-[#5048E5] cursor-pointer text-left"
                      >
                        more ({meeting.attendees.length - 1})
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {meeting.clientCompany}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {meeting.deal}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {meeting.createDate.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          meeting.readiness < 40 
                            ? 'bg-red-500' 
                            : meeting.readiness < 80 
                            ? 'bg-orange-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${meeting.readiness}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${
                      meeting.readiness < 40 
                        ? 'text-red-500' 
                        : meeting.readiness < 80 
                        ? 'text-orange-500' 
                        : 'text-green-500'
                    }`}>{meeting.readiness}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => handleViewMeeting(meeting)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-[#605BFF] border border-[#605BFF] rounded hover:bg-[#605BFF] hover:text-white transition-colors"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedMeetings.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No meetings found for the selected period
        </div>
      )}

      {/* Pagination */}
      {sortedMeetings.length > 0 && (
        <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                &lt;
              </button>
              
              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded transition-colors ${
                    currentPage === pageNum
                      ? 'text-[#605BFF] font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                &gt;
              </button>
            </div>
            
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border-0 bg-transparent text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1rem',
                paddingRight: '2rem'
              }}
            >
              <option value={10}>10 / Page</option>
              <option value={20}>20 / Page</option>
              <option value={50}>50 / Page</option>
              <option value={100}>100 / Page</option>
            </select>
          </div>

          <div className="text-sm text-gray-700">
            <span className="font-bold">Total : {sortedMeetings.length}</span>
          </div>
        </div>
      )}

      {/* Meeting Details Popup */}
      {showMeetingDetails && selectedMeeting && (
        <MeetingDetailsPopup
          isVisible={showMeetingDetails}
          onClose={closeMeetingDetails}
          meetingData={{
            subject: selectedMeeting.subject,
            description: selectedMeeting.description,
            status: selectedMeeting.status,
            clientCompany: selectedMeeting.clientCompany,
            deal: selectedMeeting.deal,
            attendees: selectedMeeting.attendees
          }}
          onJoinMeeting={() => console.log('Joining meeting:', selectedMeeting.id)}
          onReviewMeeting={() => console.log('Reviewing meeting:', selectedMeeting.id)}
          onPrepareMeeting={() => console.log('Preparing meeting:', selectedMeeting.id)}
          onDeleteMeeting={() => console.log('Deleting meeting:', selectedMeeting.id)}
        />
      )}

      {/* More Attendees Popup */}
      {showMoreAttendees && moreAttendeesData && (
        <MoreAttendeesPopup
          isVisible={showMoreAttendees}
          onClose={closeMoreAttendees}
          meetingData={moreAttendeesData}
        />
      )}
    </div>
  );
};

export default ListView;
