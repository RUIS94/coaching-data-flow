import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageCircle, 
  Lightbulb, 
  History, 
  StickyNote, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Save,
  X,
  Bookmark,
  Lock,
  FileText,
  ChevronDown,
  Database,
  User as UserIcon,
  MoreVertical,
  Check,
  Settings,
  Globe,
  Mic
} from 'lucide-react';
import SamAvatar from '@/assets/sam-avatar.svg';
import AddNotePopup from './AddNotePopup';

interface ChatMessage {
  id: string;
  type: 'user' | 'sam';
  content: string;
  timestamp: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  isEditing?: boolean;
}

interface SavedResponse {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  isPrivate: boolean;
  originalMessageId: string;
}

interface CustomQuestion {
  id: string;
  question: string;
  category: string;
  createdAt: string;
}

const AskSamTab: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'sam',
      content: 'Hello! I\'m Sam, your AI sales assistant. I can help you analyze your meeting, suggest follow-up strategies, answer questions about your prospects, and provide sales insights. What would you like to know?',
      timestamp: '10:30 AM'
    }
  ]);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Key Insights',
      content: 'Jennifer Walsh seems to be the champion - she mentioned the pilot results multiple times and showed enthusiasm.',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      title: 'Follow-up Strategy',
      content: 'Focus on ROI metrics for Robert Chen (CFO). He\'s very numbers-driven and mentioned board presentation.',
      timestamp: '1 hour ago'
    }
  ]);
  const [savedResponses, setSavedResponses] = useState<SavedResponse[]>([
    {
      id: '1',
      title: 'Pain Points Analysis',
      content: 'Based on the meeting transcript, the main pain points mentioned were: 1) Operational inefficiencies costing 23% productivity, 2) IT concerns about CRM integration and data migration, 3) Need for zero-downtime during transition.',
      timestamp: '1 hour ago',
      isPrivate: true,
      originalMessageId: '1'
    }
  ]);
  const [activeTab, setActiveTab] = useState<'history' | 'notes' | 'saved'>('history');
  const [isLoading, setIsLoading] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [savePrivate, setSavePrivate] = useState(true);
  const [messageToSave, setMessageToSave] = useState<ChatMessage | null>(null);
  const [chatAreaWidth, setChatAreaWidth] = useState(65); // Default chat area width 70%
  const [isDragging, setIsDragging] = useState(false);
  const [recommendedQuestionsHeight, setRecommendedQuestionsHeight] = useState(350); // Default recommended questions area height
  const [isVerticalDragging, setIsVerticalDragging] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [recommendedQuestionsTab, setRecommendedQuestionsTab] = useState<'bank' | 'my'>('bank');
  const [questionSearch, setQuestionSearch] = useState('');
  const [showMethodologyMenu, setShowMethodologyMenu] = useState(false);
  const [selectedMethodology, setSelectedMethodology] = useState('MEDDIC');
  const [myQuestions, setMyQuestions] = useState<CustomQuestion[]>([
    {
      id: '1',
      question: 'What specific ROI metrics are most important to your executive team?',
      category: 'Custom',
      createdAt: '2 days ago'
    },
    {
      id: '2',
      question: 'How do you currently measure operational efficiency?',
      category: 'Discovery',
      createdAt: '1 week ago'
    }
  ]);
  const [showAddNotePopup, setShowAddNotePopup] = useState(false);

  const questionBanks = {
    'MEDDIC': [
      "What are the key pain points mentioned by the prospect?",
      "How can I better handle the pricing objections?",
      "What follow-up strategy would be most effective?",
      "Who are the key decision makers in this deal?",
      "What competitive advantages should I emphasize?",
      "How likely is this deal to close based on the conversation?",
      "What questions should I ask in the next meeting?",
      "How can I strengthen my relationship with the champion?"
    ],
    'SPIN': [
      "What situation questions should I have asked?",
      "How can I uncover more problem areas?",
      "What implication questions would create urgency?",
      "How can I get the prospect to articulate need-payoff?",
      "What problems are they not aware of yet?",
      "How can I quantify the cost of their current situation?",
      "What would happen if they don't solve this problem?",
      "How would solving this impact their business goals?"
    ],
    'Challenger': [
      "What insights can I teach this prospect?",
      "How can I challenge their current thinking?",
      "What commercial insights apply to their industry?",
      "How can I reframe their problem?",
      "What assumptions should I challenge?",
      "How can I create constructive tension?",
      "What unique perspective can I bring?",
      "How can I lead them to a new way of thinking?"
    ],
    'BANT': [
      "Is the budget confirmed and allocated?",
      "Who has the authority to make this decision?",
      "What is the specific need we're addressing?",
      "What is their timeline for implementation?",
      "How urgent is solving this problem?",
      "What happens if they don't move forward?",
      "Are there competing priorities for the budget?",
      "Who else is involved in the decision process?"
    ]
  };

  const methodologies = ['Challenger', 'Customer Centric Selling', 'Holden', 'IMPACT', 'MEDDIC', 'Sandler', 'Solution Selling', 'Spin', 'TAS', 'Value Prompter'];

  const getCurrentQuestions = () => {
    if (recommendedQuestionsTab === 'bank') {
      return questionBanks[selectedMethodology as keyof typeof questionBanks] || [];
    } else {
      return myQuestions.map(q => q.question);
    }
  };

  const filteredQuestions = getCurrentQuestions().filter(question =>
    question.toLowerCase().includes(questionSearch.toLowerCase())
  );

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const samResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'sam',
        content: generateSamResponse(inputValue),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, samResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateSamResponse = (question: string): string => {
    const responses = {
      'pain': 'Based on the meeting transcript, the main pain points mentioned were: 1) Operational inefficiencies costing 23% productivity, 2) IT concerns about CRM integration and data migration, 3) Need for zero-downtime during transition. These are strong pain points that create urgency for your solution.',
      'pricing': 'For pricing objections, emphasize the ROI: the 23% efficiency improvement from the pilot translates to significant cost savings. Position the 15% volume discount as exclusive for early adopters. Also, offer flexible payment terms aligned with their cash flow preferences.',
      'follow-up': 'Your follow-up strategy should focus on: 1) Deliver the detailed proposal by Thursday as promised, 2) Arrange the technical call with IT, 3) Provide customer references, 4) Schedule the Chicago site visit. Keep momentum high with frequent touchpoints.',
      'decision': 'Key decision makers identified: Robert Chen (CFO) - budget authority, Jennifer Walsh (VP Operations) - champion, Lisa Martinez (Procurement) - contract terms. Focus on Robert for financial justification and support Jennifer as your internal advocate.',
      'competitive': 'Emphasize your competitive advantages: 99.9% uptime SLA, 98% customer retention rate, zero-downtime migration capability, and 24/7 support. These differentiate you from the two other vendors they\'re evaluating.',
      'likelihood': 'This deal has strong potential - positive indicators include: successful pilot results, champion support from Jennifer, CFO engagement, scheduled next steps. Risk factors: competing vendors, procurement involvement. I\'d rate this as 75% likely to close.',
      'questions': 'For your next meeting, ask: 1) What specific success metrics will you use to evaluate vendors? 2) What are your biggest concerns about implementation? 3) How do the other vendors compare on uptime and support? 4) What would make this a no-brainer decision?',
      'champion': 'To strengthen your relationship with Jennifer: 1) Provide her with internal selling materials, 2) Share success stories from similar implementations, 3) Offer to present directly to her team, 4) Keep her informed of all developments and next steps.'
    };

    const lowerQuestion = question.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        return response;
      }
    }

    return 'Based on your meeting analysis, I can see several opportunities to strengthen this deal. The prospect showed strong engagement with 23% efficiency improvements from the pilot. Focus on building on Jennifer\'s champion status while addressing Robert\'s financial concerns. Would you like me to elaborate on any specific aspect?';
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
  };

  const handleAddNote = () => {
    if (!newNoteTitle.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: '',
      timestamp: 'Just now',
      isEditing: true
    };

    setNotes(prev => [newNote, ...prev]);
    setNewNoteTitle('');
    setShowAddNote(false);
  };

  const handleSaveNote = (noteId: string, content: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, content, isEditing: false, timestamp: 'Just now' }
        : note
    ));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const handleEditNote = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, isEditing: true }
        : note
    ));
  };

  const handleSaveResponse = (message: ChatMessage) => {
    setMessageToSave(message);
    setSaveTitle('');
    setSavePrivate(true);
    setSaveModalOpen(true);
  };

  const confirmSaveResponse = () => {
    if (!messageToSave || !saveTitle.trim()) return;

    const savedResponse: SavedResponse = {
      id: Date.now().toString(),
      title: saveTitle,
      content: messageToSave.content,
      timestamp: 'Just now',
      isPrivate: savePrivate,
      originalMessageId: messageToSave.id
    };

    setSavedResponses(prev => [savedResponse, ...prev]);
    setSaveModalOpen(false);
    setSaveTitle('');
    setMessageToSave(null);
  };

  const handleDeleteSavedResponse = (responseId: string) => {
    setSavedResponses(prev => prev.filter(response => response.id !== responseId));
  };

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
  };

  // Handle dragging
  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    // Calculate new width percentage, limit between 20% and 80%
    let newWidthPercent = (mouseX / containerWidth) * 100;
    newWidthPercent = Math.max(20, Math.min(80, newWidthPercent));
    
    setChatAreaWidth(newWidthPercent);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
  };

  // Add mouse move and mouse up event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // mouse move H
      if (isDragging && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;
        
        // Calculate new width percentage, limit between 20% and 80%
        let newWidthPercent = (mouseX / containerWidth) * 100;
        newWidthPercent = Math.max(20, Math.min(80, newWidthPercent));
        
        setChatAreaWidth(newWidthPercent);
      }
      // mouse move V
      if (isVerticalDragging && sidebarRef.current) {
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const mouseY = e.clientY - sidebarRect.top;
        
        // Calculate new higth percentage, limit between 100px and 400px
        let newHeight = mouseY;
        newHeight = Math.max(100, Math.min(400, newHeight));
        
        setRecommendedQuestionsHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isVerticalDragging) {
        setIsDragging(false);
        setIsVerticalDragging(false);
        document.body.style.cursor = 'default';
      }
    };

    if (isDragging || isVerticalDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isVerticalDragging]);
  
  return (
    <div className="h-full flex relative" ref={containerRef} onMouseMove={handleDrag} onMouseUp={handleDragEnd}>
      {/* Main Chat Area */}
      <div className="flex flex-col" style={{ width: `${chatAreaWidth}%` }}>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                    message.type === 'user' 
                      ? 'bg-gray-400 text-white' 
                      : ''
                  }`}>
                    {message.type === 'user' ? 'You' : (
                      <img src={SamAvatar} alt="Sam" className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-lg px-4 py-3 max-w-full ${
                      message.type === 'user'
                        ? 'bg-[#E0E6FF] text-gray-900'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {/* Message Actions */}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                      {message.type === 'sam' && (
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <Copy className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleSaveResponse(message)}
                            className="p-1 text-gray-400 hover:text-[#605BFF] transition-colors"
                            title="Save response"
                          >
                            <Bookmark className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src={SamAvatar} alt="Sam" className="w-full h-full object-cover" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask Sam anything about your meeting, prospects, or sales strategy..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#605BFF] focus:border-transparent resize-none pr-12"
              rows={3}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-3 bottom-3 p-2 disabled:opacity-50 disabled:cursor-not-allowed text-[#FF8E1C] hover:text-[#4B46CC] transition-colors"
            >
              <Send className="w-6 h-6" />
            </button>
            {/*<button
              onClick={(e) => {
                e.stopPropagation();
                // Handle mic functionality here
              }}
              className="absolute right-12 bottom-3 p-2 text-[#FF8E1C]"
            >
              <Mic className="w-6 h-6" />
            </button>*/}
          </div>
        </div>
      </div>
      
      {/* Draggable Divider */}
      <div 
        className="w-1 bg-gray-50 hover:bg-blue-300 cursor-col-resize active:bg-blue-400 transition-all duration-200 relative group border-l border-r border-gray-100"
        onMouseDown={handleDragStart}
      >
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-full flex items-center justify-center">
            <div className="w-0.5 h-8 bg-blue-500 rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="border-l border-gray-200 bg-gray-50 flex flex-col" style={{ width: `${100 - chatAreaWidth}%` }} ref={sidebarRef}>
        {/* Recommended Questions */}
         <div style={{ height: `${recommendedQuestionsHeight}px` }} className="p-4 border-b border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Recommended Questions</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowMethodologyMenu(!showMethodologyMenu)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-white hover:bg-gray-200 rounded-md transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                  <span>{selectedMethodology}</span>
                </button>
                
                {showMethodologyMenu && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[220px] max-h-64 overflow-y-auto">
                    {methodologies.map((methodology) => (
                      <button
                        key={methodology}
                        onClick={() => {
                          setSelectedMethodology(methodology);
                          setShowMethodologyMenu(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          selectedMethodology === methodology ? 'bg-blue-50 text-[#605BFF]' : 'text-gray-700'
                        }`}
                      >
                        {methodology}
                      </button>
                    ))}
                  </div>
                )}
                {showMethodologyMenu && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[220px] max-h-64 overflow-y-auto">
                    {methodologies.map((methodology) => (
                      <button
                        key={methodology}
                        onClick={() => {
                          setSelectedMethodology(methodology);
                          setShowMethodologyMenu(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          selectedMethodology === methodology ? 'bg-blue-50 text-[#605BFF]' : 'text-gray-700'
                        }`}
                      >
                        {methodology}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter keywords"
              value={questionSearch}
              onChange={(e) => setQuestionSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#605BFF] focus:border-transparent"
            />
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-3">
            <button
              onClick={() => setRecommendedQuestionsTab('bank')}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                recommendedQuestionsTab === 'bank'
                  ? 'text-[#605BFF] border-b-2 border-[#605BFF]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Question Bank</span>
            </button>
            <button
              onClick={() => setRecommendedQuestionsTab('my')}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                recommendedQuestionsTab === 'my'
                  ? 'text-[#605BFF] border-b-2 border-[#605BFF]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>My Questions</span>
            </button>
          </div>
          
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: `${recommendedQuestionsHeight - 140}px` }}>
            {filteredQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-[#605BFF] rounded-lg transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <span className="flex-1">{question}</span>
                  {recommendedQuestionsTab === 'my' && (
                    <button className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-gray-200 rounded transition-all">
                      <MoreVertical className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
              </button>
            ))}
            
            {filteredQuestions.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                {questionSearch ? 'No questions found' : 'No questions available'}
              </div>
            )}
          </div>
        </div>
        {/* Vertical Draggable Divider */}
        <div 
          className="h-1 bg-gray-50 hover:bg-blue-300 cursor-row-resize active:bg-blue-400 transition-all duration-200 relative group border-t border-b border-gray-100"
          onMouseDown={(e) => {
            setIsVerticalDragging(true);
            document.body.style.cursor = 'row-resize';
            e.preventDefault(); // Prevent text selection
          }}
        >
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-full flex items-center justify-center">
              <div className="h-0.5 w-8 bg-blue-500 rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
        {/* History and Notes Tabs */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-2 py-3 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-[#605BFF] border-b-2 border-[#605BFF] bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <History className="w-4 h-4" />
                <span>History</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 px-2 py-3 text-sm font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'text-[#605BFF] border-b-2 border-[#605BFF] bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <StickyNote className="w-4 h-4" />
                <span>Notes</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 px-2 py-3 text-sm font-medium transition-colors ${
                activeTab === 'saved'
                  ? 'text-[#605BFF] border-b-2 border-[#605BFF] bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Bookmark className="w-4 h-4" />
                <span>Saved</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'history' ? (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Recent Conversations</h4>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                {chatHistory.filter(msg => msg.type === 'user').map((message, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                    <p className="text-sm text-gray-900 line-clamp-2">{message.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
                  </div>
                ))}
              </div>
            ) : activeTab === 'notes' ? (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">My Notes</h4>
                  <button
                    onClick={() => setShowAddNotePopup(true)}
                    className="text-[#605BFF] hover:text-[#4B46CC] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add Note Form */}
                {showAddNote && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-3">
                    <input
                      type="text"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="Note title..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#605BFF] focus:border-transparent"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddNote}
                        className="px-3 py-1 bg-[#605BFF] text-white text-sm rounded hover:bg-[#4B46CC] transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddNote(false);
                          setNewNoteTitle('');
                        }}
                        className="px-3 py-1 text-gray-600 text-sm rounded hover:text-gray-900 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Notes List */}
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900 text-sm">{note.title}</h5>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditNote(note.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {note.isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          defaultValue={note.content}
                          placeholder="Add your note content..."
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#605BFF] focus:border-transparent resize-none"
                          rows={3}
                          onBlur={(e) => handleSaveNote(note.id, e.target.value)}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                              handleSaveNote(note.id, textarea?.value || '');
                            }}
                            className="px-2 py-1 bg-[#605BFF] text-white text-xs rounded hover:bg-[#4B46CC] transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700 mb-2">{note.content}</p>
                        <p className="text-xs text-gray-500">{note.timestamp}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Saved Responses</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{savedResponses.length} saved</span>
                  </div>
                </div>

                {/* Saved Responses List */}
                {savedResponses.map((response) => (
                  <div key={response.id} className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-gray-900 text-sm">{response.title}</h5>
                          <div className="flex items-center">
                            {response.isPrivate ? (
                              <span title="Private">
                                <Lock className="w-3 h-3 text-gray-400" />
                              </span>
                            ) : (
                              <span title="Public">
                                <Globe className="w-3 h-3 text-green-500" />
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{response.timestamp}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSavedResponse(response.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">{response.content}</p>
                  </div>
                ))}

                {savedResponses.length === 0 && (
                  <div className="text-center py-8">
                    <Bookmark className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No saved responses yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click the bookmark icon on Sam's responses to save them</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Response Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Save Response</h3>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Enter a title for this response..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#605BFF] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="privacy"
                      checked={savePrivate}
                      onChange={() => setSavePrivate(true)}
                      className="mr-2 text-[#605BFF] focus:ring-[#605BFF]"
                    />
                    <Lock className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">Private (only you can see this)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="privacy"
                      checked={!savePrivate}
                      onChange={() => setSavePrivate(false)}
                      className="mr-2 text-[#605BFF] focus:ring-[#605BFF]"
                    />
                    <Globe className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Public (visible to team members)</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">Response Preview:</p>
                <p className="text-sm text-gray-900 line-clamp-4">{messageToSave?.content}</p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={confirmSaveResponse}
                disabled={!saveTitle.trim()}
                className="flex-1 px-4 py-2 bg-[#605BFF] text-white rounded-lg hover:bg-[#4B46CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Response</span>
              </button>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Note Popup */}
      <AddNotePopup
        isOpen={showAddNotePopup}
        onClose={() => setShowAddNotePopup(false)}
        onSave={(content) => {
          const newNote: Note = {
            id: Date.now().toString(),
            title: 'New Note',
            content: content,
            timestamp: 'Just now'
          };
          setNotes(prev => [newNote, ...prev]);
          setShowAddNotePopup(false);
        }}
      />
    </div>
  );
};

export default AskSamTab;
