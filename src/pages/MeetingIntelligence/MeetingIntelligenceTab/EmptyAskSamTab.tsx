import React from 'react';
import { FileText, Upload } from 'lucide-react';

interface AskSamTabProps {
  onUploadClick: () => void;
}

const EmptyAskSamTab: React.FC<AskSamTabProps> = ({ onUploadClick }) => {
  return (
    <div className="p-6 h-full flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Transcript Available
        </h3>
        
        <p className="text-gray-600 mb-6">
          You must first upload a transcript before you can ask SAM anything
        </p>
        
        <button 
          onClick={onUploadClick}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#FF8E1C] text-white rounded-lg hover:bg-[#4B46CC] transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Transcript</span>
        </button>
      </div>
    </div>
  );
};

export default EmptyAskSamTab;