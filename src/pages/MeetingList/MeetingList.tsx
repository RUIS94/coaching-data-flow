import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, List, ChevronLeft, ChevronRight, Copy, Eye, Search, Filter, X, Zap, CalendarPlus, Import, ChevronDown, RefreshCw } from 'lucide-react';
import { sampleMeetings } from './sampleData';
import CalendarView from './CalendarView';
import ListView from './ListView';
import QuickMeetingPopup from './QuickMeetingPopup';
import { useToastContext } from '../../contexts/ToastContext';

interface MeetingListProps {
  onNavigate?: (view: string) => void;
}

export type ViewMode = 'calendar' | 'list';
export type CalendarViewType = 'day' | 'week' | 'month';

export interface Meeting {
  id: string;
  subject: string;
  description: string;
  status: 'Draft' | 'In Progress' | 'Completed' | 'Cancelled';
  date: Date;
  startTime: string;
  endTime: string;
  attendees: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
  }>;
  clientCompany: string;
  deal: string;
  createDate: Date;
  readiness: number;
}

interface FilterState {
  type: string;
  company: string;
  deal: string;
  contact: string;
  status: string;
}
const MeetingList: React.FC<MeetingListProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showQuickMeetingMenu, setShowQuickMeetingMenu] = useState(false);
  const [showScheduleMeetingMenu, setShowScheduleMeetingMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [isQuickMeetingPopupOpen, setIsQuickMeetingPopupOpen] = useState(false);
  const [currentMeetingLink, setCurrentMeetingLink] = useState('');
  
  // Toast 功能
  const { showSuccess } = useToastContext();

  const handleOpenQuickMeetingPopup = (link: string) => {
    setCurrentMeetingLink(link); // 设置当前的会议链接
    setIsQuickMeetingPopupOpen(true);
    setShowQuickMeetingMenu(false); // 关闭下拉菜单
  };

  const handleCloseQuickMeetingPopup = () => {
    setIsQuickMeetingPopupOpen(false);
  };
  const handleJoinMeeting = () => {};
  const handlePrepareMeeting = () => {};
  const handleDeleteMeeting = () => {};
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setShowQuickMeetingMenu(false);
        setShowScheduleMeetingMenu(false);
        setShowImportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    company: '',
    deal: '',
    contact: '',
    status: ''
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateForPicker = (date: Date, viewType: CalendarViewType) => {
    if (viewType === 'day') {
      return date.toISOString().split('T')[0];
    } else if (viewType === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().split('T')[0];
    } else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
  };

  const handleDateChange = (dateString: string, viewType: CalendarViewType) => {
    if (viewType === 'day') {
      setCurrentDate(new Date(dateString));
    } else if (viewType === 'week') {
      const selectedDate = new Date(dateString);
      setCurrentDate(selectedDate);
    } else {
      const [year, month] = dateString.split('-');
      setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
    }
  };

  const getDateInputType = (viewType: CalendarViewType) => {
    if (viewType === 'month') return 'month';
    if (viewType === 'week') return 'week';
    return 'date';
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      company: '',
      deal: '',
      contact: '',
      status: ''
    });
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header ref={headerRef} className="bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="space-y-2">
              <h1 className="flex items-center text-2xl font-bold text-gray-900">
                <span className="mr-4">Meetings</span>
                  <button className="text-gray-400 hover:text-[#605BFF]">
                    <RefreshCw className="w-5 h-5" />
                  </button>
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                Manage your meetings, schedule new ones, and track your progress.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {/* Quick Meeting Dropdown */}
             <div className="relative">
               <button 
                  onClick={() => {
                    setShowQuickMeetingMenu(!showQuickMeetingMenu);
                    setShowScheduleMeetingMenu(false);
                    setShowImportMenu(false);
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <Zap size={16} />
                  <span className="text-sm font-medium">Quick Meeting</span>
                  <ChevronRight size={16} className={`transform transition-transform ${showQuickMeetingMenu ? 'rotate-90' : ''}`} />
                </button>
              {showQuickMeetingMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <button 
                      onClick={() => handleOpenQuickMeetingPopup('https://outlook.com/meeting-link-12')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700">
                      Quick Meeting in Outlook
                    </button>
                    <button 
                      onClick={() => handleOpenQuickMeetingPopup('https://zoom.us/join/84765442238')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700">
                      Quick Meeting in Zoom
                    </button>
                    <button 
                      onClick={() => handleOpenQuickMeetingPopup('https://meet.google.com/xyz-abc-def')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700">
                      Quick Meeting in Google
                    </button>
                  </div>
                </div>
              )}
            </div>
            {isQuickMeetingPopupOpen && (
              <QuickMeetingPopup
                isVisible={isQuickMeetingPopupOpen}
                onClose={handleCloseQuickMeetingPopup}
                meetingLink={currentMeetingLink}
                onJoinMeeting={handleJoinMeeting}
                onPrepareMeeting={handlePrepareMeeting}
                onDeleteMeeting={handleDeleteMeeting}
              />
            )}
            {/* Schedule Meeting Dropdown */}
             <div className="relative">
               <button 
                  onClick={() => {
                    setShowScheduleMeetingMenu(!showScheduleMeetingMenu);
                    setShowQuickMeetingMenu(false);
                    setShowImportMenu(false);
                  }}
                  className="px-4 py-2 bg-white border border-[#605BFF] text-[#605BFF] rounded-lg hover:bg-[#605BFF] hover:text-white transition-colors flex items-center space-x-2"
                >
                  <CalendarPlus size={16} />
                  <span className="text-sm font-medium">Schedule Meeting</span>
                  <ChevronRight size={16} className={`transform transition-transform ${showScheduleMeetingMenu ? 'rotate-90' : ''}`} />
                </button>
              {showScheduleMeetingMenu && (
                 <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                   <div className="py-2">
                     <button 
                       onClick={() => {
                         if (onNavigate) {
                           onNavigate('prep');
                         }
                         setShowScheduleMeetingMenu(false);
                       }}
                       className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 whitespace-nowrap"
                     >
                       Schedule Meeting in SAM
                     </button>
                     <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 whitespace-nowrap">
                       Schedule Meeting in Outlook
                     </button>
                     <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 whitespace-nowrap">
                       Schedule Meeting in Zoom
                     </button>
                     <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 whitespace-nowrap">
                       Schedule Meeting in Google
                     </button>
                   </div>
                 </div>
               )}
            </div>

            {/* Import Dropdown */}
             <div className="relative">
               <button 
                  onClick={() => {
                    setShowImportMenu(!showImportMenu);
                    setShowQuickMeetingMenu(false);
                    setShowScheduleMeetingMenu(false);
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <Import size={16} />
                  <span className="text-sm font-medium">Import</span>
                  <ChevronRight size={16} className={`transform transition-transform ${showImportMenu ? 'rotate-90' : ''}`} />
                </button>
              {showImportMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        showSuccess('We have successfully imported your Google Meetings for the current view of the calendar.');
                        setShowImportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      Google Calendar
                    </button>
                    <button 
                      onClick={() => {
                        showSuccess('We have successfully imported your Outlook Meetings for the current view of the calendar.');
                        setShowImportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      Outlook Calendar
                    </button>
                    <button 
                      onClick={() => {
                        showSuccess('We have successfully imported your Zoom Meetings for the current view of the calendar.');
                        setShowImportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      Zoom Calendar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="px-6 py-6">
        {/* View Mode Switcher and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-[#605BFF] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar size={16} />
                <span className="text-sm font-medium">Calendar</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-[#605BFF] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={16} />
                <span className="text-sm font-medium">List</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF] focus:border-transparent w-64"
              />
            </div>
            {/* Search Button */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-1.5 border border-[#605BFF] text-[#605BFF] rounded-lg hover:bg-[#605BFF] hover:text-white transition-colors"
              >
                <span className="text-sm font-medium">Search</span>
              </button>
            </div>
            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterPopup(!showFilterPopup)}
                className="flex items-center gap-2 px-3 py-1.5 text-[#FF8E1C] border border-[#FF8E1C] rounded-lg hover:bg-[#FF8E1C] hover:text-white transition-colors"
              >
                <Filter size={16} />
                <span className="text-sm font-medium">Filter</span>
              </button>

              {/* Filter Popup */}
              {showFilterPopup && (
                <div className="absolute right-0 top-full mt-3 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter size={18} className="text-[#605BFF]" />
                        <h3 className="text-lg font-semibold text-gray-900">Filter Meeting</h3>
                      </div>
                      <button
                        onClick={() => setShowFilterPopup(false)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-200"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Meeting Type</label>
                          <select
                             value={filters.type}
                             onChange={(e) => handleFilterChange('type', e.target.value)}
                             className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200 appearance-none"
                             style={{
                               backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                               backgroundPosition: 'right 0.75rem center',
                               backgroundRepeat: 'no-repeat',
                               backgroundSize: '1rem 1rem'
                             }}
                           >
                            <option value="">All Types</option>
                            <option value="demo">Demo</option>
                            <option value="review">Review</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="sync">Sync</option>
                            <option value="presentation">Presentation</option>
                            <option value="planning">Planning</option>
                            <option value="training">Training</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
                          <select
                             value={filters.status}
                             onChange={(e) => handleFilterChange('status', e.target.value)}
                             className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200 appearance-none"
                             style={{
                               backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                               backgroundPosition: 'right 0.75rem center',
                               backgroundRepeat: 'no-repeat',
                               backgroundSize: '1rem 1rem'
                             }}
                           >
                            <option value="">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Company</label>
                        <select
                           value={filters.company}
                           onChange={(e) => handleFilterChange('company', e.target.value)}
                           className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200 appearance-none"
                           style={{
                             backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                             backgroundPosition: 'right 0.75rem center',
                             backgroundRepeat: 'no-repeat',
                             backgroundSize: '1rem 1rem'
                           }}
                         >
                          <option value="">All Companies</option>
                          <option value="Acme Corp">Acme Corp</option>
                          <option value="TechCo Solutions">TechCo Solutions</option>
                          <option value="Innovate Inc">Innovate Inc</option>
                          <option value="Startup.io">Startup.io</option>
                          <option value="BigCorp Industries">BigCorp Industries</option>
                          <option value="Global Enterprises">Global Enterprises</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Deal</label>
                        <select
                           value={filters.deal}
                           onChange={(e) => handleFilterChange('deal', e.target.value)}
                           className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200 appearance-none"
                           style={{
                             backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                             backgroundPosition: 'right 0.75rem center',
                             backgroundRepeat: 'no-repeat',
                             backgroundSize: '1rem 1rem'
                           }}
                         >
                          <option value="">All Deals</option>
                          <option value="Enterprise Software License">Enterprise Software License</option>
                          <option value="Cloud Migration Project">Cloud Migration Project</option>
                          <option value="API Integration Services">API Integration Services</option>
                          <option value="SaaS Subscription">SaaS Subscription</option>
                          <option value="Custom Development">Custom Development</option>
                          <option value="Digital Transformation">Digital Transformation</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Contact Name</label>
                        <input
                          type="text"
                          placeholder="Search by contact name..."
                          value={filters.contact}
                          onChange={(e) => handleFilterChange('contact', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] transition-all duration-200 placeholder-gray-400"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                      <button
                        onClick={clearFilters}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowFilterPopup(false)}
                        className="flex-1 px-4 py-2.5 text-sm font-medium bg-white text-[#605BFF] border border-[#605BFF] rounded-lg hover:bg-[#605BFF] hover:text-white"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between mb-6">
          {/* Today Button */}
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-[#605BFF] border border-[#605BFF] rounded-lg hover:bg-[#605BFF] hover:text-white transition-colors"
          >
            <span className="text-sm font-medium">Today</span>
          </button>

          {/* Navigation Arrows and Date Picker */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1.5 text-gray-600 hover:text-[#605BFF] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            <input
              type={getDateInputType(calendarView)}
              value={formatDateForPicker(currentDate, calendarView)}
              onChange={(e) => handleDateChange(e.target.value, calendarView)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF] focus:border-transparent min-w-[150px]"
            />
            
            <button
              onClick={() => navigateDate('next')}
              className="p-1.5 text-gray-600 hover:text-[#605BFF] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* View Type Switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCalendarView('day')}
              className={`px-3 py-1.5 rounded transition-colors ${
                calendarView === 'day'
                  ? 'bg-white text-[#605BFF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-sm font-medium">Day</span>
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-3 py-1.5 rounded transition-colors ${
                calendarView === 'week'
                  ? 'bg-white text-[#605BFF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-sm font-medium">Week</span>
            </button>
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1.5 rounded transition-colors ${
                calendarView === 'month'
                  ? 'bg-white text-[#605BFF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-sm font-medium">Month</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-380px)] overflow-y-auto border-[0.2px] border-gray-200 rounded-lg">
          {viewMode === 'calendar' ? (
            <CalendarView
              meetings={sampleMeetings}
              viewType={calendarView}
              currentDate={currentDate}
            />
          ) : (
            <ListView
              meetings={sampleMeetings}
              viewType={calendarView}
              currentDate={currentDate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingList;
