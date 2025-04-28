import * as React from 'react';
import { Node } from 'reactflow';
import { useTheme } from '../../context/ThemeContext';

interface NodeInfoPanelProps {
  node: Node;
  onClose: () => void;
  onExploreNode: (nodeId: string) => void;
}

function getNodeTypeColor(theme: any, type: string): string {
  const typeStr = type?.toLowerCase() || '';
  if (typeStr.includes('wallet')) return theme.colors.nodeWallet;
  if (typeStr.includes('program')) return theme.colors.nodeProgram;
  if (typeStr.includes('token')) return theme.colors.nodeToken;
  return theme.colors.nodeDefault;
}

const NodeInfoPanel: React.FC<NodeInfoPanelProps> = ({ node, onClose, onExploreNode }) => {
  const { theme } = useTheme();

  return (
    <div 
      className="w-80 border-l shadow-lg flex flex-col gap-3"
      style={{ 
        backgroundColor: theme.colors.bgMedium, 
        borderColor: theme.colors.border, 
        color: theme.colors.textPrimary 
      }}
    >
      <div className="flex justify-between items-center border-b p-3" style={{ borderColor: theme.colors.borderMedium }}>
        <h3 className="text-lg font-medium">Node Details</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded"
          aria-label="Close panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-3 overflow-y-auto flex-grow p-3">
        <InfoSection theme={theme} title="Address">
          <div className="text-sm break-all font-mono" style={{ color: theme.colors.textSecondary }}>{node.id}</div>
        </InfoSection>
        
        <InfoSection theme={theme} title="Label">
          <div className="font-medium text-base" style={{ color: theme.colors.textSecondary }}>{node.data?.label || '(none)'}</div>
        </InfoSection>
        
        {node.data?.type && (
          <InfoSection theme={theme} title="Type">
            <div className="flex items-center gap-2">
              <span 
                className="w-3 h-3 inline-block rounded-full"
                style={{ 
                  backgroundColor: getNodeTypeColor(theme, node.data.type) 
                }}
              />
              <span style={{ color: theme.colors.textSecondary }} className="text-sm">{node.data.type}</span>
            </div>
          </InfoSection>
        )}
        
        {node.data?.details && (
          <InfoSection theme={theme} title="Details">
            <details className="mt-1">
              <summary 
                className="cursor-pointer text-sm hover:underline"
                style={{ color: theme.colors.accent }}
              >
                Show Raw Data
              </summary>
              <pre 
                className="text-xs overflow-x-auto mt-1 p-2 rounded bg-gray-800"
                style={{ borderColor: theme.colors.borderMedium, color: theme.colors.textSecondary }}
              >
                {JSON.stringify(node.data.details, null, 2)}
              </pre>
            </details>
          </InfoSection>
        )}
        
        <div className="flex gap-3 pt-3 border-t" style={{ borderColor: theme.colors.borderMedium }}>
          <button 
            className="flex-grow px-3 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 text-sm"
            onClick={() => {
              window.open(`https://explorer.solana.com/address/${node.id}`, '_blank');
            }}
          >
            View in Explorer
          </button>
          <button 
            className="px-3 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700 text-sm"
            onClick={() => onExploreNode(node.id)}
          >
            Explore Node
          </button>
        </div>
      </div>
    </div>
  );
};

interface InfoSectionProps {
    title: string;
    children: React.ReactNode;
    theme: any;
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, children, theme }) => (
  <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-3" style={{ backgroundColor: theme.colors.bgLight }}>
    <div className="text-xs uppercase font-semibold mb-2" style={{ color: theme.colors.textMuted }}>{title}</div>
    {children}
  </div>
);

export default NodeInfoPanel;