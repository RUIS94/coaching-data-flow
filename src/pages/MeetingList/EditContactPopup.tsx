import React, { useState } from 'react';
import { X, User, Save, Mail, Phone, Building2, Briefcase, Plus, Upload, Smartphone, Linkedin } from 'lucide-react';

interface ContactData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  clientCompany: string;
  avatar: string | null;
  phone: string;
  mobileNumber: string;
  email: string;
  personalEmail: string;
  leadStatus: string;
  linkedin: string;
}

interface EditContactPopupProps {
  isVisible: boolean;
  onClose: () => void;
  contactData?: ContactData;
  onSave: (data: ContactData) => void;
}

const EditContactPopup: React.FC<EditContactPopupProps> = ({
  isVisible,
  onClose,
  contactData = {
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'Senior Developer',
    clientCompany: 'Tech Solutions Inc.',
    avatar: null,
    phone: '+1 (555) 123-4567',
    mobileNumber: '+1 (555) 987-6543',
    email: 'john.doe@company.com',
    personalEmail: 'john.doe@gmail.com',
    leadStatus: 'qualified',
    linkedin: 'linkedin.com/in/johndoe'
  },
  onSave
}) => {
  const [formData, setFormData] = useState<ContactData>(contactData);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showLeadStatusDropdown, setShowLeadStatusDropdown] = useState(false);

  const companyOptions = [
    'Tech Solutions Inc.',
    'Digital Innovations Corp',
    'Global Systems Ltd',
    'Modern Enterprises',
    'Future Tech Solutions'
  ];

  const leadStatusOptions = [
    { value: 'new', label: 'New Lead' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal Sent' },
    { value: 'negotiation', label: 'In Negotiation' },
    { value: 'closed-won', label: 'Closed Won' },
    { value: 'closed-lost', label: 'Closed Lost' }
  ];

  if (!isVisible) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const selectCompany = (company: string) => {
    setFormData(prev => ({
      ...prev,
      clientCompany: company
    }));
    setShowCompanyDropdown(false);
  };

  const selectLeadStatus = (status: string) => {
    setFormData(prev => ({
      ...prev,
      leadStatus: status
    }));
    setShowLeadStatusDropdown(false);
  };

  const getLeadStatusLabel = (value: string) => {
    return leadStatusOptions.find(option => option.value === value)?.label || 'Select Status';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-[600px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={18} className="text-[#605BFF]" />
              <h3 className="text-lg font-semibold text-gray-900">Edit Contact</h3>
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
            {/* Avatar Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 bg-[#605BFF] text-white rounded-full p-2 cursor-pointer hover:bg-[#5048E5] transition-colors duration-200 shadow-lg"
                >
                  <Upload size={14} />
                </label>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                  placeholder="Job title"
                />
              </div>
            </div>

            {/* Client Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Company</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={16} className="text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] text-left bg-white"
                >
                  {formData.clientCompany || 'Select company'}
                </button>
                {showCompanyDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                    {/* Input box with + button inside dropdown */}
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.clientCompany}
                          onChange={(e) => setFormData(prev => ({ ...prev, clientCompany: e.target.value }))}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                          placeholder="Type company name"
                        />
                        <button
                          type="button"
                          onClick={() => console.log('Add new company')}
                          className="px-3 py-2 bg-[#605BFF] text-white rounded-lg hover:bg-[#5048E5] transition-colors duration-200 flex items-center"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    {/* Company options */}
                    {companyOptions
                      .filter(option => 
                        option.toLowerCase().includes(formData.clientCompany.toLowerCase())
                      )
                      .map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => selectCompany(option)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Phone Numbers */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Smartphone size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>
            </div>

            {/* Emails */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                    placeholder="work@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="personalEmail"
                    value={formData.personalEmail}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF]"
                    placeholder="personal@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Lead Status & LinkedIn */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Status</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLeadStatusDropdown(!showLeadStatusDropdown)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#605BFF]/20 focus:border-[#605BFF] text-left bg-white"
                  >
                    {getLeadStatusLabel(formData.leadStatus)}
                  </button>
                  {showLeadStatusDropdown && (
                    <div className="absolute z-10 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {leadStatusOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => selectLeadStatus(option.value)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
                    placeholder="linkedin.com/in/username"
                  />
                </div>
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
      
      {/* Click outside to close dropdowns */}
      {(showCompanyDropdown || showLeadStatusDropdown) && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowCompanyDropdown(false);
            setShowLeadStatusDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default EditContactPopup;