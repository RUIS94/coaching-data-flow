import React, { useState, useRef, useEffect } from 'react';
import { X, Building2, Save, Globe, MapPin, Phone, Mail, FileText, Linkedin, User, Plus, Search, ChevronDown } from 'lucide-react';

interface CompanyData {
  name: string;
  industry: string;
  website: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  description: string;
  primaryContact: string;
  linkedin: string;
}

interface EditCompanyPopupProps {
  isVisible: boolean;
  onClose: () => void;
  companyData?: CompanyData;
  onSave: (data: CompanyData) => void;
}

// Mock contacts data for the dropdown
const mockContacts = [
  { id: '1', name: 'John Smith', email: 'john.smith@company.com', title: 'CEO' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', title: 'CTO' },
  { id: '3', name: 'Michael Brown', email: 'michael.brown@company.com', title: 'Sales Director' },
  { id: '4', name: 'Emily Davis', email: 'emily.davis@company.com', title: 'Marketing Manager' },
  { id: '5', name: 'David Wilson', email: 'david.wilson@company.com', title: 'Operations Manager' },
];

const EditCompanyPopup: React.FC<EditCompanyPopupProps> = ({
  isVisible,
  onClose,
  companyData = {
    name: 'Acme Corporation',
    industry: 'Technology',
    website: 'https://www.acmecorp.com',
    address: '123 Business Ave, Suite 100',
    city: 'San Francisco',
    country: 'United States',
    phone: '+1 (555) 123-4567',
    email: 'info@acmecorp.com',
    description: 'Leading technology company specializing in innovative solutions for enterprise clients.',
    primaryContact: '1',
    linkedin: 'https://www.linkedin.com/company/acmecorp',
  },
  onSave
}) => {
  const [formData, setFormData] = useState<CompanyData>(companyData);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.title.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const selectedContact = mockContacts.find(contact => contact.id === formData.primaryContact);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowContactDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isVisible) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleContactSelect = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      primaryContact: contactId
    }));
    setShowContactDropdown(false);
    setContactSearch('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-[700px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-[#605BFF]" />
              <h3 className="text-lg font-semibold text-gray-900">Edit Company</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                  placeholder="Company name"
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                placeholder="e.g., Technology, Healthcare, Finance"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe size={16} className="text-gray-400" />
                </div>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                  placeholder="Street address"
                />
              </div>
            </div>

            {/* City and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                  placeholder="Country"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                    placeholder="company@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText size={16} className="text-gray-400" />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] resize-none"
                  placeholder="Brief description of the company"
                />
              </div>
            </div>

            {/* Primary Contact with Search Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact</label>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowContactDropdown(!showContactDropdown)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] bg-white text-left flex items-center justify-between"
                  >
                    <span className="truncate">
                      {selectedContact ? `${selectedContact.name} (${selectedContact.title})` : 'Select contact...'}
                    </span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                </div>

                {showContactDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                    {/* Search input */}
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex gap-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={contactSearch}
                          onChange={(e) => setContactSearch(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                          placeholder="Search contacts..."
                        />
                        <button
                          type="button"
                          onClick={() => {}}
                          className="px-3 py-2 bg-[#605BFF] text-white rounded-lg hover:bg-[#5048E5] transition-colors duration-200 flex items-center"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Contact list */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredContacts.length > 0 ? (
                        filteredContacts.map((contact) => (
                          <button
                            key={contact.id}
                            type="button"
                            onClick={() => handleContactSelect(contact.id)}
                            className="w-full px-3 py-2.5 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm border-b border-gray-50 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{contact.name}</div>
                            <div className="text-xs text-gray-500">{contact.title} • {contact.email}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-sm text-gray-500 text-center">
                          No contacts found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Linkedin size={16} className="text-gray-400" />
                </div>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                  placeholder="https://www.linkedin.com/company/yourcompany"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2.5 text-sm font-medium bg-white border border-[#605BFF] text-[#605BFF] rounded-lg transition-all duration-200 shadow-lg hover:bg-[#605BFF] hover:text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCompanyPopup;
