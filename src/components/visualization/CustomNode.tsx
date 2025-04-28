import * as React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { useTheme } from '../../context/ThemeContext';

interface CustomNodeData {
  label: string;
  type?: string;
  details?: any;
  onExplore?: (nodeId: string) => void;
}

// Helper function to get color by node type
const getNodeColor = (theme: any, type?: string) => {
  if (!type) return theme.colors.nodeDefault;
  
  const typeStr = type.toLowerCase();
  if (typeStr.includes('wallet')) return theme.colors.nodeWallet;  
  if (typeStr.includes('program')) return theme.colors.nodeProgram; 
  if (typeStr.includes('token')) return theme.colors.nodeToken;    
  
  return theme.colors.nodeDefault;
};

// Chain link icon SVG component
const ChainLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M11 15H7C5.34315 15 4 13.6569 4 12C4 10.3431 5.34315 9 7 9H11M8 12H16M13 9H17C18.6569 9 20 10.3431 20 12C20 13.6569 18.6569 15 17 15H13" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ id, data, selected }) => {
  const { theme } = useTheme();
  const nodeColor = getNodeColor(theme, data.type);
  
  const isProgram = data.type?.toLowerCase().includes('program');
  
  // Double-click handler for direct exploration
  const handleDoubleClick = () => {
    if (data.onExplore) {
      data.onExplore(id);
    }
  };
  
  return (
    <div 
      className="flex flex-col items-center"
      onDoubleClick={handleDoubleClick}
      title="Double-click to explore this node"
    >
      {/* Circular node shape */}
      <div 
        className={`flex items-center justify-center rounded-full w-12 h-12 relative cursor-pointer ${
          selected ? 'ring-2 ring-offset-1 ring-opacity-80' : ''
        } hover:ring-1 hover:ring-opacity-50 hover:ring-blue-400`}
        style={{ 
          backgroundColor: theme.colors.bgMedium, 
          borderColor: nodeColor,
          border: '1px solid',
          color: theme.colors.textPrimary,
          boxShadow: selected ? `0 0 5px ${theme.colors.textSecondary}` : 'none',
        }}
      >
        {/* Handle for connections */}
        <Handle type="source" position={Position.Bottom} style={{ background: nodeColor }} />
        <Handle type="target" position={Position.Top} style={{ background: nodeColor }} />
        
        {/* Chain link icon in white */}
        <div className="text-white">
          <ChainLinkIcon />
        </div>
      </div>
      
      {/* Label below the node */}
      <div className="mt-1 text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
        {data.label?.length > 12 ? data.label.substring(0, 6) + '...' + data.label.substring(data.label.length - 4) : data.label}
      </div>
      
      {/* Type indicator - smaller and subtler */}
      {data.type && (
        <div className="text-xs opacity-50" style={{ color: theme.colors.textSecondary }}>
          {data.type}
        </div>
      )}
    </div>
  );
};

export default CustomNode;