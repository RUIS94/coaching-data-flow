import React from 'react';

interface ButtonWithPopupProps {
  label: string;
  icon: React.ReactNode;
  variant?: 'primary';
  onClick?: () => void;
  popup?: React.ReactNode;
}

export const ButtonWithPopup: React.FC<ButtonWithPopupProps> = ({
  label,
  icon,
  variant = 'primary',
  onClick,
  popup,
}) => {
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPopupOpen && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopupOpen]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
    }
  };

  const handleClick = () => {
    if (popup) {
      setIsPopupOpen(!isPopupOpen);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="relative" ref={buttonRef}>
      <button
        onClick={handleClick}
        className={`
          ${getVariantClasses()}
          flex items-center justify-center gap-3 px-6 py-4 rounded-xl
          border-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1
          transition-all duration-200 ease-in-out font-medium text-sm
          min-w-[140px] h-[45px] group text-center w-full
        `}
      >
        <div className="flex items-center justify-center gap-2">
          <div className="group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
          <span className="truncate text-center">{label}</span>
        </div>
      </button>

      {popup && isPopupOpen && (
        <div className="popup-container">
          {React.cloneElement(popup as React.ReactElement, {
            isOpen: isPopupOpen,
            onClose: () => setIsPopupOpen(false),
          })}
        </div>
      )}
    </div>
  );
};

interface SimpleButtonProps {
  label: string;
  icon: React.ReactNode;
  variant?: 'primary';
  onClick?: () => void;
}

export const SimpleButton: React.FC<SimpleButtonProps> = ({ label, icon, variant = 'primary', onClick }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
    }
  };

  const handleClick = () => {
    console.log(`${label} clicked`);
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${getVariantClasses()}
        flex items-center justify-center gap-3 px-6 py-4 rounded-xl
        border-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1
        transition-all duration-200 ease-in-out font-medium text-sm
        min-w-[140px] h-[45px] group text-center w-full
      `}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
        <span className="truncate text-center">{label}</span>
      </div>
    </button>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
  color?: string;
}

export const Section: React.FC<SectionProps> = ({ title, children, color = 'blue' }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <h2 className={`text-2xl font-bold mb-6 text-${color}-800 flex items-center gap-2`}>
        <div className={`w-1 h-8 bg-${color}-600 rounded`}></div>
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
};
