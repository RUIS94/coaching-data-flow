import React, { useState } from 'react';
import { TrendingUp, Target, Award, AlertTriangle, Lightbulb } from 'lucide-react';
import OverviewTab from './CoachingTabs/OverviewTab';
import QualificationEffectivenessTab from './CoachingTabs/QualificationEffectivenessTab';
import { UpskillTab } from './CoachingTabs/UpskillTab';



const CoachingTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'qualification' | 'upskill'>('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'qualification':
        return <QualificationEffectivenessTab />;
      case 'upskill':
        return <UpskillTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="flex h-full space-x-6">
      {/* Left Panel */}
      <div className="flex-1">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg mt-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-xs transition-colors ${
                  activeTab === 'overview'
                    ? 'border-[#605BFF] text-[#605BFF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('qualification')}
                className={`py-4 px-1 border-b-2 font-medium text-xs transition-colors ${
                  activeTab === 'qualification'
                    ? 'border-[#605BFF] text-[#605BFF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Qualification Effectiveness
              </button>
              {/*<button
                onClick={() => setActiveTab('upskill')}
                className={`py-4 px-1 border-b-2 font-medium text-xs transition-colors ${
                  activeTab === 'upskill'
                    ? 'border-[#605BFF] text-[#605BFF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upskill
              </button>*/}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-4">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-64">
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {/* Action Items Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-5 h-5 text-[#FF8E1C]" />
                <div>
                  <div className="text-2xl font-bold text-[#FF8E1C]">12</div>
                  <div className="text-sm text-gray-600">Action Items</div>
                </div>
              </div>
            </div>

            {/* Overall Score Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 relative">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-[#605BFF]" />
                  <div>
                    <div className="text-2xl font-bold text-[#605BFF]">73%</div>
                    {/* 在这里添加绝对定位的元素，放在右上角 */}
                    <div className="absolute top-2 right-4 flex items-center text-xs text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>+5%</span>
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">3</div>
                  <div className="text-sm text-gray-600">Strengths</div>
                </div>
              </div>
            </div>

            {/* Improvements Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">2</div>
                  <div className="text-sm text-gray-600">Improvements</div>
                </div>
              </div>
            </div>

            {/* Critical Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">1</div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachingTab;