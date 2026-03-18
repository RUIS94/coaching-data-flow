import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Link,
  RemoveFormatting,
  FileText
} from 'lucide-react';
import Popup from './Popup';
import InsertLinkPopup from './InsertLinkPopup';

interface AddNotePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
}

const AddNotePopup: React.FC<AddNotePopupProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [content, setContent] = useState('');
  const [showInsertLink, setShowInsertLink] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatText = (command: string, value?: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = content;
    const newStart = start;
    let newEnd = end;

    switch (command) {
      case 'bold':
        newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
        newEnd = end + 4;
        break;
      case 'italic':
        newText = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
        newEnd = end + 2;
        break;
      case 'underline':
        newText = content.substring(0, start) + `<u>${selectedText}</u>` + content.substring(end);
        newEnd = end + 7;
        break;
      case 'alignLeft':
        newText = content.substring(0, start) + `<div style="text-align: left;">${selectedText}</div>` + content.substring(end);
        newEnd = end + 48;
        break;
      case 'alignCenter':
        newText = content.substring(0, start) + `<div style="text-align: center;">${selectedText}</div>` + content.substring(end);
        newEnd = end + 50;
        break;
      case 'alignRight':
        newText = content.substring(0, start) + `<div style="text-align: right;">${selectedText}</div>` + content.substring(end);
        newEnd = end + 49;
        break;
      case 'bulletList':
        {
          const bulletLines = selectedText.split('\n').map(line => line.trim() ? `• ${line}` : line).join('\n');
          newText = content.substring(0, start) + bulletLines + content.substring(end);
          newEnd = start + bulletLines.length;
          break;
        }
      case 'numberList':
        {
          const numberLines = selectedText.split('\n').map((line, index) => 
            line.trim() ? `${index + 1}. ${line}` : line
          ).join('\n');
          newText = content.substring(0, start) + numberLines + content.substring(end);
          newEnd = start + numberLines.length;
          break;
        }
      case 'removeFormatting':
        {
          const cleanText = selectedText
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/<u>(.*?)<\/u>/g, '$1')
            .replace(/<div[^>]*>(.*?)<\/div>/g, '$1')
            .replace(/^([•]|\d+\.)\s/gm, '');
          newText = content.substring(0, start) + cleanText + content.substring(end);
          newEnd = start + cleanText.length;
          break;
        }
    }

    setContent(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newStart, newEnd);
      }
    }, 0);
  };

  const handleInsertLink = (url: string, text: string, openInNewWindow: boolean) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const linkText = openInNewWindow 
      ? `<a href="${url}" target="_blank">${text}</a>`
      : `<a href="${url}">${text}</a>`;
    
    const newText = content.substring(0, start) + linkText + content.substring(end);
    setContent(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + linkText.length, start + linkText.length);
      }
    }, 0);
  };

  const handleSave = () => {
    onSave(content);
    setContent('');
    onClose();
  };

  const handleClose = () => {
    setContent('');
    onClose();
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: AlignLeft, command: 'alignLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'alignCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'alignRight', title: 'Align Right' },
    { icon: List, command: 'bulletList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'numberList', title: 'Numbered List' },
    { icon: RemoveFormatting, command: 'removeFormatting', title: 'Remove Formatting' },
  ];

  const footer = (
    <div className="flex justify-end space-x-3">
      <button
        onClick={handleClose}
        className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        className="px-4 py-2.5 text-sm font-medium bg-white border border-[#605BFF] text-[#605BFF] rounded-lg transition-all duration-200 hover:bg-[#605BFF] hover:text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
      >
        Save & Close
      </button>
    </div>
  );

  const titleWithIcon = (
    <>
      <FileText size={18} className="text-[#605BFF]" />
      <h2 className="text-xl font-semibold text-gray-900">Add Note</h2>
    </>
  );

  return (
    <>
      <Popup
        isOpen={isOpen}
        onClose={handleClose}
        title={titleWithIcon}
        footer={footer}
      >
        <div className="space-y-4">
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
            {toolbarButtons.map(({ icon: Icon, command, title }) => (
              <button
                key={command}
                onClick={() => formatText(command)}
                title={title}
                className="p-2 rounded hover:bg-white hover:shadow-sm transition-all duration-200"
              >
                <Icon className="w-4 h-4 text-gray-600" />
              </button>
            ))}
            <button
              onClick={() => setShowInsertLink(true)}
              title="Insert Link"
              className="p-2 rounded hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <Link className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Text Input */}
          <div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#605BFF] focus:border-transparent"
            />
          </div>
        </div>
      </Popup>

      <InsertLinkPopup
        isOpen={showInsertLink}
        onClose={() => setShowInsertLink(false)}
        onInsert={handleInsertLink}
      />
    </>
  );
};

export default AddNotePopup;
