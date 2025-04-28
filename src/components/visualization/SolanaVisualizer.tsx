import * as React from 'react';
import { useCallback, useState, FormEvent } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  FitViewOptions,
  DefaultEdgeOptions,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
  useReactFlow,
  NodeMouseHandler,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import NodeInfoPanel from './NodeInfoPanel';
import HistoryPanel from './HistoryPanel';
import { useTheme } from '../../context/ThemeContext';
import { showInfo, showError } from '../../lib/utils/notifications';

// Define nodeTypes outside the component to prevent recreation on renders
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// API URL - Will be replaced with our Next.js API route
const API_URL = '/api/graph-data';

// React Flow options
const fitViewOptions: FitViewOptions = {
  padding: 0.4,
};

// Default options for edges
const defaultEdgeOptions: DefaultEdgeOptions = {
  markerEnd: { type: MarkerType.Arrow, color: '#3B82F6', width: 15, height: 15 },
  animated: true, 
  style: { 
    strokeWidth: 2,
    stroke: '#3B82F6', 
  },
  labelStyle: { 
    fontSize: 10,
    fill: '#E5E7EB',
    fontWeight: 500,
  }, 
  labelBgStyle: { 
    fill: '#1F2937',
    fillOpacity: 0.7,
    // Remove rx and ry as they're not in the type definitions
  }, 
  labelShowBg: true,
};

export default function SolanaVisualizer() {
  const { theme } = useTheme();

  // React Flow state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { fitView } = useReactFlow();

  // UI state
  const [addressInput, setAddressInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Callbacks
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)), 
    [setEdges]
  );
  
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  // Fetch data
  const fetchGraphData = useCallback(async (address: string) => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    setSelectedNode(null);
    
    try {
      showInfo(`Fetching data for address: ${address}`);
      
      const response = await fetch(`${API_URL}?address=${encodeURIComponent(address)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        throw new Error("Invalid data format received from API");
      }
      
      // Add onExplore callback to each node
      const customNodes = data.nodes.map((node: Node) => ({ 
        ...node, 
        position: node.position || { x: Math.random() * 200, y: Math.random() * 200 }, 
        type: 'custom', 
        data: { 
          ...node.data, 
          label: node.data?.label || 'Unknown', 
          type: node.data?.type || 'Default',
          onExplore: handleExploreNode
        } 
      }));
      
      setNodes(customNodes);
      setEdges(data.edges);
      
      // Update search history
      if (!searchHistory.includes(address)) {
        setSearchHistory((prev) => [address, ...prev].slice(0, 10));
      }
      
      // Fit view after nodes are rendered
      setTimeout(() => fitView(fitViewOptions), 100);
      
    } catch (err) {
      console.error("Fetch error:", err);
      showError(err instanceof Error ? err.message : 'Unknown error fetching graph data');
      setError(err instanceof Error ? err.message : 'Unknown error');
      setNodes([]);
      setEdges([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchHistory, fitView]);

  // Handlers
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (addressInput.trim()) {
      fetchGraphData(addressInput.trim());
    }
  };
  
  const handleClearGraph = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    showInfo("Graph cleared");
  };
  
  const loadFromHistory = (address: string) => {
    setAddressInput(address);
    fetchGraphData(address);
    setIsHistoryOpen(false);
  };
  
  const handleExploreNode = (nodeId: string) => {
    if (!nodeId) return;
    
    setAddressInput(nodeId);
    setTimeout(() => {
      fetchGraphData(nodeId);
      setSelectedNode(null);
    }, 100);
  };

  return (
    <div className="w-full h-full flex flex-col border rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Search Form */}
      <div className="p-4 border-b bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex gap-3 items-center">
          <label htmlFor="solanaAddress" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Address:
          </label>
          <div className="relative flex-grow flex-shrink min-w-0 max-w-2xl">
            <input
              id="solanaAddress"
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter Solana address..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              required
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="submit"
              disabled={isLoading || !addressInput}
              className={`px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                        ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isLoading ? "Loading..." : "Visualize"}
            </button>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              title="History"
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {(nodes.length > 0 || edges.length > 0) && (
              <button
                type="button"
                onClick={handleClearGraph}
                title="Clear Graph"
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>
        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
            Error: {error}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex relative">
        {/* React Flow Canvas */}
        <div className="flex-grow relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={fitViewOptions}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            proOptions={{ hideAttribution: true }}
            style={{ background: theme.colors.bgDark }}
            minZoom={0.1}
            maxZoom={2}
          >
            <Controls />
            <MiniMap 
              nodeColor={(n: Node) => {
                if (n.id === selectedNode?.id) return theme.colors.textSecondary;
                
                // Safer approach to determine node color by type
                if (n.data?.type) {
                  const nodeType = n.data.type.toLowerCase();
                  if (nodeType.includes('wallet')) return theme.colors.nodeWallet;
                  if (nodeType.includes('program')) return theme.colors.nodeProgram;
                  if (nodeType.includes('token')) return theme.colors.nodeToken;
                }
                
                return theme.colors.nodeDefault;
              }} 
              zoomable
              pannable
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color={theme.colors.bgLight}
            />
          </ReactFlow>
          
          {/* Empty state */}
          {nodes.length === 0 && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80">
              <div className="mb-4 text-6xl text-gray-300 dark:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No Visualization Data</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Enter a Solana address above and click Visualize to see transaction relationships.
              </p>
            </div>
          )}
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 z-20">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-700 dark:text-gray-300">
                Fetching transaction data...
              </p>
            </div>
          )}
        </div>
        
        {/* Info Panel */}
        {selectedNode && (
          <NodeInfoPanel 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)}
            onExploreNode={handleExploreNode}
          />
        )}

        {/* History Panel */}
        {isHistoryOpen && (
          <HistoryPanel 
            history={searchHistory} 
            onLoad={loadFromHistory} 
            onClose={() => setIsHistoryOpen(false)} 
          />
        )}
      </div>
    </div>
  );
}