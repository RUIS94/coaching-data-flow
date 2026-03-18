import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, onStepClick }) => {
  const stepLabels = ['Self-Assessment', 'Deal Selection', 'Manager Questions', 'Agenda'];

  return (
    <div className="flex flex-col items-center">
      {/* Progress line container */}
        <div className="relative flex items-center" style={{ width: '360px' }}>
        {/* Background line */}
        <div className="absolute w-full h-0.5 bg-gray-200" />
        
        {/* Active line */}
        <div 
          className="absolute h-0.5 bg-[#605BFF] transition-all duration-300"
          style={{ 
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
          }}
        />
        
        {/* Step nodes */}
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isActive = isCompleted || isCurrent;
          
          return (
            <button
              key={stepNumber}
              onClick={() => onStepClick(stepNumber)}
              className={`absolute rounded-full flex items-center justify-center font-medium transition-all duration-200 z-10 ${
                isActive
                  ? 'w-6 h-6 text-xs bg-[#605BFF] text-white'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              style={{
                left: `${(index / (totalSteps - 1)) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {isActive && (isCompleted ? <Check size={10} /> : stepNumber)}
            </button>
          );
        })}
      </div>
      
      {/* Step labels */}
          <div className="relative flex items-center mt-6" style={{ width: '360px' }}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <span
              key={stepNumber}
              className={`absolute text-xs font-medium transform -translate-x-1/2 ${
                isCurrent ? 'text-[#605BFF]' : 'text-gray-600'
              }`}
              style={{
                left: `${(index / (totalSteps - 1)) * 100}%`
              }}
            >
              {stepLabels[index]}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
