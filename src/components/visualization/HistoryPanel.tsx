import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface HistoryPanelProps {
  history: string[];
  onLoad: (address: string) => void;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad, onClose }) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className="absolute top-0 right-0 h-full w-64 border-l z-20 flex flex-col shadow-lg"
      style={{ backgroundColor: theme.colors.bgMedium, borderColor: theme.colors.border }}
    >
      {/* Header */}
      <div 
        className="p-3 border-b flex justify-between items-center" 
        style={{ borderColor: theme.colors.borderMedium }}
      >
        <span className="font-medium" style={{ color: theme.colors.textPrimary }}>Search History</span>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-gray-700 rounded"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* List */}
      {history.length > 0 ? (
        <ul className="flex-grow overflow-y-auto">
          {history.map((address, index) => (
            <li key={index} className="border-b" style={{ borderColor: theme.colors.borderMedium }}>
              <button
                onClick={() => onLoad(address)}
                className="w-full text-left p-3 hover:bg-blue-500 hover:bg-opacity-20 truncate block"
                style={{ color: theme.colors.textSecondary }}
              >
                <div className="text-xs text-blue-400 mb-1">Address {index + 1}</div>
                <div className="font-mono text-sm truncate">{address}</div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-center" style={{ color: theme.colors.textMuted }}>
          No search history yet.
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;