import React, { useState } from 'react';
import { X, Search, User, Mail, Phone, Plus } from 'lucide-react';
import { Attendee } from '../MeetingPreparation';
import CreateAttendee from './CreateAttendee';

interface SelectContactProps {
  onClose: () => void;
  onSelect: (contacts: Attendee[]) => void;
  selectedCompany?: string;
}

const SelectContact: React.FC<SelectContactProps> = ({ onClose, onSelect, selectedCompany }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [companyFilter, setCompanyFilter] = useState(selectedCompany || '');
  const [showCreateAttendee, setShowCreateAttendee] = useState(false);
  
  // Mock contact data
  const mockContacts = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+1 (555) 123-4567',
      title: 'CEO',
      company: 'Tech Solutions Inc'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 234-5678',
      title: 'CTO',
      company: 'Tech Solutions Inc'
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.brown@client.com',
      phone: '+1 (555) 345-6789',
      title: 'Product Manager',
      company: 'Client Corp'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@client.com',
      phone: '+1 (555) 456-7890',
      title: 'Marketing Director',
      company: 'Client Corp'
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.wilson@partner.com',
      phone: '+1 (555) 567-8901',
      title: 'Sales Manager',
      company: 'Partner LLC'
    }
  ];

  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = companyFilter === '' || contact.company === companyFilter;
    
    return matchesSearch && matchesCompany;
  });

  const companies = Array.from(new Set(mockContacts.map(contact => contact.company)));

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const handleConfirmSelection = () => {
    const selectedContactsData = mockContacts.filter(contact => 
      selectedContacts.includes(contact.id)
    );
    const attendees: Attendee[] = selectedContactsData.map(contact => ({
      name: contact.name,
      company: contact.company,
      title: contact.title
    }));
    onSelect(attendees);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Select Contact</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#605BFF] focus:border-[#605BFF]"
              />
            </div>
            <button
              onClick={() => setShowCreateAttendee(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#605BFF] text-white rounded-lg hover:bg-[#4c46e6] transition-colors whitespace-nowrap"
            >
              <Plus size={16} />
              Create New Contact
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Company</label>
            <div className="relative">
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full px-3 py-2 border-b border-gray-100 bg-transparent focus:outline-none focus:border-[#605BFF] appearance-none pr-8"
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-[#FF8E1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No contacts found matching your search.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleSelectContact(contact.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedContacts.includes(contact.id) 
                      ? 'bg-[#605BFF]/10' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium bg-gray-400">
                      <span className="text-sm font-bold">
                        {contact.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 flex items-center gap-4">
                        {contact.name}
                        {selectedContacts.includes(contact.id) && (
                          <span className="text-green-500 font-bold">✓</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{contact.title} at {contact.company}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail size={12} />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={12} />
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={selectedContacts.length === 0}
                className="px-4 py-2 bg-white text-[#605BFF] border border-[#605BFF] rounded-lg hover:bg-[#605BFF] hover:text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showCreateAttendee && (
        <CreateAttendee
          onClose={() => setShowCreateAttendee(false)}
          onSave={(attendeeName) => {
            // 这里可以添加新联系人到列表的逻辑
            console.log('New attendee:', attendeeName);
            setShowCreateAttendee(false);
          }}
        />
      )}
    </div>
  );
};

export default SelectContact;