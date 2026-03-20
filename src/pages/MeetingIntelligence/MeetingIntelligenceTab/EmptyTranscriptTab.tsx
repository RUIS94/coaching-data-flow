import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle } from 'lucide-react';

const EmptyTranscriptTab: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (uploadedFile) {
      // Handle upload logic here
    }
  };

  return (
    <div className="px-6 pt-8 pb-6 h-full flex flex-col">
      <div className="flex flex-col">
        {/* Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition-colors max-w-4xl mx-auto ${
            dragActive
              ? 'border-[#605BFF] bg-[#605BFF]/5'
              : 'border-gray-300 hover:border-[#605BFF] hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".txt,.doc,.docx,.pdf,.mp3,.mp4,.wav,.m4a"
            onChange={handleFileSelect}
          />
          
          <FileText className="w-12 h-12 text-[#605BFF] mx-auto mb-4" />
          
          <p className="text-lg font-medium text-gray-900 mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supported file types: .txt, .vtt, .doc, .docx, .pdf, .mp3, .m4a, .wav, .aac, .avi, .mov, .mp4
          </p>
          
          <p className="text-sm text-gray-500">
            Maximum file size: 1GB
          </p>
          
          {/* Quality Message Inside Drop Area */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-[#FF8E1C] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800 whitespace-nowrap">
              The quality of the transcript directly affects the meeting summary, follow-up letter and coaching
            </p>
          </div>
        </div>

        {/* File Info */}
        {uploadedFile && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center space-x-3">
            <FileText className="w-5 h-5 text-[#605BFF]" />
            <span className="text-sm font-medium text-gray-900 flex-1">
              {uploadedFile.name}
            </span>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!uploadedFile}
          className={`max-w-md mx-auto mt-6 px-4 py-3 rounded-lg font-medium transition-colors ${
            uploadedFile
              ? 'bg-[#605BFF] text-white hover:bg-[#4B46CC]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default EmptyTranscriptTab;
