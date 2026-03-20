import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { Meeting, CalendarViewType } from './MeetingList';
import MeetingDetailsPopup from './MeetingDetailsPopup';

interface CalendarViewProps {
  meetings: Meeting[];
  viewType: CalendarViewType;
  currentDate: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({ meetings, viewType, currentDate }) => {
  const [expandedDates, setExpandedDates] = React.useState<Set<string>>(new Set());
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedMeeting(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleDateExpansion = (dateKey: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDates(newExpanded);
  };
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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

  const getFilteredMeetings = () => {
    return meetings.filter(meeting => {
      if (viewType === 'day') {
        return isSameDate(meeting.date, currentDate);
      } else if (viewType === 'week') {
        return isSameWeek(meeting.date, currentDate);
      } else {
        return isSameMonth(meeting.date, currentDate);
      }
    });
  };

  const renderDayView = () => {
    const filteredMeetings = getFilteredMeetings();
    const halfHours = Array.from({ length: 48 }, (_, i) => i * 0.5);

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {halfHours.map(halfHour => {
            const hour = Math.floor(halfHour);
            const isHalfHour = halfHour % 1 !== 0;
            const halfHourMeetings = filteredMeetings.filter(meeting => {
              const meetingHour = parseInt(meeting.startTime.split(':')[0]);
              const meetingMinutes = parseInt(meeting.startTime.split(':')[1]);
              const meetingHalfHour = meetingHour + (meetingMinutes >= 30 ? 0.5 : 0);
              return meetingHalfHour === halfHour;
            });

            return (
              <div key={halfHour} className={`flex ${isHalfHour ? 'border-t border-dashed border-gray-300' : 'border-t border-solid border-gray-200'}`}>
                <div className="w-20 p-1 border-r relative">
                  {!isHalfHour && (
                    <div className="absolute top-1 left-1 text-xs text-gray-500">
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </div>
                  )}
                </div>
                <div className="flex-1 p-1 min-h-[30px] relative">
                  {halfHourMeetings.map(meeting => {
                    const startMinutes = parseInt(meeting.startTime.split(':')[1]);
                    const endTime = meeting.endTime.split(':');
                    const endHour = parseInt(endTime[0]);
                    const endMinutes = parseInt(endTime[1]);
                    
                    let duration = 30; // default 30 minutes for half hour slot
                    const meetingStartHalfHour = hour + (startMinutes >= 30 ? 0.5 : 0);
                    const meetingEndHalfHour = endHour + (endMinutes >= 30 ? 0.5 : 0);
                    
                    if (meetingEndHalfHour === halfHour) {
                      duration = isHalfHour ? (endMinutes - 30) : endMinutes;
                    } else if (meetingEndHalfHour > halfHour) {
                      duration = isHalfHour ? 30 - (startMinutes - 30) : 30 - startMinutes;
                    }
                    
                    const height = Math.max((duration / 30) * 30, 12); // minimum 12px height
                    const top = isHalfHour ? ((startMinutes - 30) / 30) * 30 : (startMinutes / 30) * 30;
                    
                    return (
                      <div
                        key={meeting.id}
                        className="bg-[#605BFF] text-white p-1 rounded mb-1 text-xs absolute left-1 right-1 cursor-pointer hover:bg-[#5048E5] transition-colors"
                        style={{ height: `${height}px`, top: `${top}px` }}
                        onClick={() => handleMeetingClick(meeting)}
                      >
                        <div className="flex items-center gap-2 h-full">
                          <div className="font-medium truncate">{meeting.subject}</div>
                          {meeting.attendees.length > 0 && (
                            <div className="text-xs opacity-90 truncate">{meeting.attendees[0].name}</div>
                          )}
                          <div className="text-xs opacity-90 whitespace-nowrap">{formatTime(meeting.startTime)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {filteredMeetings.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No meetings scheduled for this day
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const filteredMeetings = getFilteredMeetings();
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });

    const halfHours = Array.from({ length: 48 }, (_, i) => i * 0.5);

    return (
      <div className="bg-white rounded-lg shadow">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white z-10 border-b">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '80px' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="p-2 border-r bg-white"></th>
                {weekDays.map(day => (
                  <th key={day.toISOString()} className="p-2 text-center border-r bg-white">
                    <div className="text-sm font-medium text-gray-900">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
                      <span>{day.getDate()}</span>
                      <span className="text-xs text-gray-500">
                        {day.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-hidden">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '80px' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
              <col style={{ width: 'calc((100% - 80px) / 7)' }} />
            </colgroup>
            <tbody>
              {halfHours.map(halfHour => {
                const hour = Math.floor(halfHour);
                const isHalfHour = halfHour % 1 !== 0;
                
                return (
                  <tr key={halfHour} className={`${isHalfHour ? 'border-t border-dashed border-gray-300' : 'border-t border-solid border-gray-200'}`}>
                    <td className="p-1 border-r align-top relative">
                      {!isHalfHour && (
                        <div className="absolute top-1 left-1 text-xs text-gray-500">
                          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </div>
                      )}
                    </td>
                    {weekDays.map(day => {
                      const dayMeetings = filteredMeetings.filter(meeting => {
                        const meetingHour = parseInt(meeting.startTime.split(':')[0]);
                        const meetingMinutes = parseInt(meeting.startTime.split(':')[1]);
                        const meetingHalfHour = meetingHour + (meetingMinutes >= 30 ? 0.5 : 0);
                        return isSameDate(meeting.date, day) && meetingHalfHour === halfHour;
                      });

                      return (
                        <td key={day.toISOString()} className="p-1 border-r align-top overflow-hidden relative" style={{minHeight: '30px', height: '30px'}}>
                          {dayMeetings.map(meeting => {
                            const startMinutes = parseInt(meeting.startTime.split(':')[1]);
                            const endTime = meeting.endTime.split(':');
                            const endHour = parseInt(endTime[0]);
                            const endMinutes = parseInt(endTime[1]);
                            
                            let duration = 30; // default 30 minutes for half hour slot
                            const meetingStartHalfHour = hour + (startMinutes >= 30 ? 0.5 : 0);
                            const meetingEndHalfHour = endHour + (endMinutes >= 30 ? 0.5 : 0);
                            
                            if (meetingEndHalfHour === halfHour) {
                              duration = isHalfHour ? (endMinutes - 30) : endMinutes;
                            } else if (meetingEndHalfHour > halfHour) {
                              duration = isHalfHour ? 30 - (startMinutes - 30) : 30 - startMinutes;
                            }
                            
                            const height = Math.max((duration / 30) * 30, 12); // minimum 12px height
                            const top = isHalfHour ? ((startMinutes - 30) / 30) * 30 : (startMinutes / 30) * 30;
                            
                            return (
                              <div
                                key={meeting.id}
                                className="bg-[#605BFF] text-white px-1 py-0.5 rounded mb-1 text-xs absolute left-1 right-1 cursor-pointer hover:bg-[#5048E5] transition-colors"
                                style={{ height: `${height}px`, top: `${top}px` }}
                                onClick={() => handleMeetingClick(meeting)}
                              >
                                <div className="flex items-center gap-2 h-full">
                                  <div className="font-medium truncate">{meeting.subject}</div>
                                  <div className="text-xs opacity-90 whitespace-nowrap">{formatTime(meeting.startTime)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredMeetings.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No meetings scheduled for this week
          </div>
        )}
      </div>
    );
  };

  const renderMonthView = () => {
    const filteredMeetings = getFilteredMeetings();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
      days.push(new Date(day));
    }

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 border-b sticky top-0 bg-white z-10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-gray-900 border-r">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map(day => {
            const dayMeetings = filteredMeetings.filter(meeting => 
              isSameDate(meeting.date, day)
            );
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = isSameDate(day, new Date());

            return (
              <div 
                key={day.toISOString()} 
                className={`min-h-[80px] p-1 border-r border-b ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${
                  isToday 
                    ? 'bg-[#605BFF] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs' 
                    : isCurrentMonth 
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-0.5">
                  {(() => {
                    const dateKey = day.toISOString().split('T')[0];
                    const isExpanded = expandedDates.has(dateKey);
                    const displayMeetings = isExpanded ? dayMeetings : dayMeetings.slice(0, 2);
                    const remainingCount = dayMeetings.length - 2;
                    
                    return (
                      <>
                        {displayMeetings.map(meeting => (
                          <div
                            key={meeting.id}
                            className="bg-[#605BFF] text-white px-1 py-0.5 rounded text-xs flex items-center justify-between cursor-pointer hover:bg-[#5048E5] transition-colors"
                            onClick={() => handleMeetingClick(meeting)}
                          >
                            <span className="font-medium truncate flex-1">{meeting.subject}</span>
                            <span className="text-xs opacity-90 ml-1 whitespace-nowrap">{formatTime(meeting.startTime)}</span>
                          </div>
                        ))}
                        {!isExpanded && remainingCount > 0 && (
                          <div 
                            className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 py-0.5"
                            onClick={() => toggleDateExpansion(dateKey)}
                          >
                            +{remainingCount} more
                          </div>
                        )}
                        {isExpanded && dayMeetings.length > 2 && (
                          <div 
                            className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 py-0.5"
                            onClick={() => toggleDateExpansion(dateKey)}
                          >
                            Show less
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
        {filteredMeetings.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No meetings scheduled for this month
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {viewType === 'day' && renderDayView()}
      {viewType === 'week' && renderWeekView()}
      {viewType === 'month' && renderMonthView()}
      
      {/* Meeting Details Popup */}
      {showPopup && selectedMeeting && (
        <MeetingDetailsPopup
          isVisible={showPopup}
          onClose={closePopup}
          meetingData={{
            subject: selectedMeeting.subject,
            description: selectedMeeting.description,
            status: selectedMeeting.status,
            clientCompany: selectedMeeting.clientCompany,
            deal: selectedMeeting.deal,
            attendees: selectedMeeting.attendees
          }}
          onJoinMeeting={() => {}}
          onReviewMeeting={() => {}}
          onPrepareMeeting={() => {}}
          onDeleteMeeting={() => {}}
        />
      )}
    </div>
  );
};

export default CalendarView;
