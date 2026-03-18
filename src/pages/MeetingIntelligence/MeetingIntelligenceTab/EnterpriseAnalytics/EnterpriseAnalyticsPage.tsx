import React, { useState } from 'react';
import SalesMethodologyCard from './Modules/SalesMethodologyCard';
import BuyerJourneyCard from './Modules/BuyerJourneyCard';
import BuyerObjectionsCard from './Modules/BuyerObjectionsCard';
import BuyerQuestionsCard from './Modules/BuyerQuestionsCard';
import EmptyPopup from './Popup/emptyPopup';

interface PopupData {
  title: string;
  content: string;
  value: number;
}

const EnterpriseAnalyticsPage: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupData, setPopupData] = useState<PopupData | null>(null);

  const handleDataClick = (title: string, content: string, value: number) => {
    setPopupData({ title, content, value });
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupData(null);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesMethodologyCard onDataClick={handleDataClick} />
          <BuyerJourneyCard onDataClick={handleDataClick} />
          <BuyerObjectionsCard onDataClick={handleDataClick} />
          <BuyerQuestionsCard onDataClick={handleDataClick} />
        </div>
      </div>

      {isPopupOpen && popupData && (
        <EmptyPopup
          isOpen={isPopupOpen}
          onClose={closePopup}
          title={popupData.title}
          content={popupData.content}
          value={popupData.value}
        />
      )}
    </div>
  );
};

export default EnterpriseAnalyticsPage;