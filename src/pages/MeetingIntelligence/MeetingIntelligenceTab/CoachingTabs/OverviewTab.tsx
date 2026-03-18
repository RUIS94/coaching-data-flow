import React, { useState } from 'react';
import { 
  User,
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight,
  Star,
  Target,
  Lightbulb,
  Award,
  Eye
} from 'lucide-react';

interface SpeakerCoaching {
  speakerName: string;
  overallAssessment: string;
  areasOfStrength: {
    title: string;
    description: string;
  }[];
  areasOfImprovement: {
    title: string;
    description: string;
  }[];
}

const OverviewTab: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'strengths' | 'improvements' | 'critical'>('all');

  // Sample data based on your format
  const speakersData: SpeakerCoaching[] = [
    {
      speakerName: "David Miller",
      overallAssessment: "David demonstrated strong sales skills by proactively reaching out, clearly articulating the value proposition of Capa Services, and adapting his approach based on Jennifer's feedback. He handled the objection regarding REA's internal focus gracefully by suggesting a follow-up at a later date.",
      areasOfStrength: [
        {
          title: "Objection Handling",
          description: "Effectively addressed the concern about internal resources by proposing a follow-up."
        },
        {
          title: "Building Rapport",
          description: "Maintained a friendly and professional tone throughout the conversation."
        },
        {
          title: "Active Listening",
          description: "Adjusted his pitch based on Jennifer's updates regarding the acquisition and internal shift."
        }
      ],
      areasOfImprovement: [
        {
          title: "Deeper Qualification",
          description: "Could have asked more probing questions earlier to uncover potential pain points or dissatisfaction with the upcoming internal changes."
        },
        {
          title: "Quantifiable Value",
          description: "Could have provided specific examples or case studies demonstrating the potential ROI Capa Services could deliver."
        }
      ]
    }
    /*{
      speakerName: "Jennifer Walsh",
      overallAssessment: "Jennifer was polite and informative, providing a clear overview of Realtor's current situation and future plans. She was upfront about the company's preference for internal resources but remained open to future conversations. She could have been more direct about his needs and challenges, potentially leading to a more tailored solution from David.",
      areasOfStrength: [],
      areasOfImprovement: []
    }*/
  ];

  const getFilteredContent = (speaker: SpeakerCoaching) => {
    switch (selectedFilter) {
      case 'strengths':
        return { strengths: speaker.areasOfStrength, improvements: [] };
      case 'improvements':
        return { strengths: [], improvements: speaker.areasOfImprovement };
      default:
        return { strengths: speaker.areasOfStrength, improvements: speaker.areasOfImprovement };
    }
  };

  const getTotalCounts = () => {
    const totalStrengths = speakersData.reduce((sum, speaker) => sum + speaker.areasOfStrength.length, 0);
    const totalImprovements = speakersData.reduce((sum, speaker) => sum + speaker.areasOfImprovement.length, 0);
    return { totalStrengths, totalImprovements };
  };

  const { totalStrengths, totalImprovements } = getTotalCounts();

  return (
    <div className="space-y-6">
      {/* Speaker Analysis Cards */}
      <div className="space-y-4">
        {speakersData.map((speaker) => {
          const filteredContent = getFilteredContent(speaker);
          
          return (
            <div key={speaker.speakerName} className="bg-white rounded-lg">
              {/* Speaker Header */}
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{speaker.speakerName}</h3>
                    {(speaker.areasOfStrength.length > 0 || speaker.areasOfImprovement.length > 0) && (
                      <div className="flex items-center space-x-4 mt-1">
                        {speaker.areasOfStrength.length > 0 && (
                          <span className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {speaker.areasOfStrength.length} Strengths
                          </span>
                        )}
                        {speaker.areasOfImprovement.length > 0 && (
                          <span className="text-sm text-yellow-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {speaker.areasOfImprovement.length} Improvements
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content - Always Expanded */}
              <div className="px-6 pb-6 border-t border-gray-100">
                {/* Overall Assessment */}
                <div className="mb-6 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-[#605BFF]" />
                    Overall Assessment
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {speaker.overallAssessment}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Areas of Strength */}
                  {(selectedFilter === 'all' || selectedFilter === 'strengths') && filteredContent.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-4 flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        Areas of Strength ({filteredContent.strengths.length})
                      </h4>
                      <div className="space-y-3">
                        {filteredContent.strengths.map((strength, index) => (
                          <div key={index} className="border border-green-200 rounded-lg p-4 bg-transparent">
                            <h5 className="font-medium text-black mb-2">{strength.title}</h5>
                            <p className="text-sm text-black">{strength.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Areas of Improvement */}
                  {(selectedFilter === 'all' || selectedFilter === 'improvements') && filteredContent.improvements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-700 mb-4 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Areas of Improvement ({filteredContent.improvements.length})
                      </h4>
                      <div className="space-y-3">
                        {filteredContent.improvements.map((improvement, index) => (
                          <div key={index} className="border border-yellow-200 rounded-lg p-4 bg-transparent">
                            <h5 className="font-medium text-black mb-2">{improvement.title}</h5>
                            <p className="text-sm text-black">{improvement.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OverviewTab;