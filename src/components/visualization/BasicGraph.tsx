import React, { useRef, useEffect } from 'react';
 import * as d3 from 'd3';
 import { Wallet, WalletConnection } from '../../types/wallet';
 
 interface Node extends d3.SimulationNodeDatum {
   id: string;
   balance: number;
   label: string;
   type: string;
   transactionCount: number;
   isMainWallet?: boolean;
 }
 
 interface Link extends d3.SimulationLinkDatum<Node> {
   source: string | Node;
   target: string | Node;
   value: number;
   transactions: number;
 }
 
 interface BasicGraphProps {
   wallets: Wallet[];
   connections: WalletConnection[];
   width?: number;
   height?: number;
 }
 
 export default function BasicGraph({ 
   wallets, 
   connections, 
   width = 600, 
   height = 400 
 }: BasicGraphProps) {
   const svgRef = useRef<SVGSVGElement>(null);
 
   useEffect(() => {
     if (!svgRef.current || wallets.length === 0) return;
 
     try {
       // Clear any existing visualization
       d3.select(svgRef.current).selectAll('*').remove();
 
       console.log('Rendering graph with wallets:', wallets.length, 'connections:', connections.length);
       
       if (connections.length === 0) {
         // If no connections, just show the wallets as disconnected nodes
         const svg = d3.select(svgRef.current);
         
         svg.append('text')
           .attr('x', width / 2)
           .attr('y', height / 2)
           .attr('text-anchor', 'middle')
           .text('No connections found between wallets');
         
         return;
       }
 
       // Find the most recent search wallet (assume it's the one with the highest transactionCount)
       const mainWallet = [...wallets].sort((a, b) => 
         (b.transactionCount || 0) - (a.transactionCount || 0)
       )[0];
 
       // Convert data to D3 format with improved types
       const nodes: Node[] = wallets.map(wallet => ({
         id: wallet.address,
         balance: wallet.balance || 1000, // Use a minimum for visualization
         label: wallet.label || wallet.address.slice(0, 6) + '...' + wallet.address.slice(-4),
         type: determineWalletType(wallet, connections),
         transactionCount: wallet.transactionCount || 1,
         isMainWallet: wallet.address === mainWallet.address
       }));
 
       // Ensure all nodes referenced in connections exist
       const nodeIds = new Set(nodes.map(n => n.id));
       const missingNodes: Node[] = [];
       
       connections.forEach(conn => {
         if (!nodeIds.has(conn.source)) {
           missingNodes.push({
             id: conn.source,
             balance: 500,  // Default value for visualization
             label: conn.source.slice(0, 6) + '...',
             type: 'unknown',
             transactionCount: conn.transactions,
             isMainWallet: false
           });
           nodeIds.add(conn.source);
         }
         
         if (!nodeIds.has(conn.target)) {
           missingNodes.push({
             id: conn.target,
             balance: 500,  // Default value for visualization
             label: conn.target.slice(0, 6) + '...',
             type: 'unknown',
             transactionCount: conn.transactions,
             isMainWallet: false
           });
           nodeIds.add(conn.target);
         }
       });
       
       // Add any missing nodes
       const allNodes = [...nodes, ...missingNodes];
 
       const links: Link[] = connections.map(connection => ({
         source: connection.source,
         target: connection.target,
         value: connection.value || 1,  // Use 1 as minimum for visualization
         transactions: connection.transactions
       }));
 
       // Create a color scale for node types with improved colors
       const colorScale = d3.scaleOrdinal<string>()
         .domain(['unknown', 'exchange', 'protocol', 'user', 'contract', 'high_volume', 'main'])
         .range([
           '#9ca3af', // gray for unknown
           '#60a5fa', // blue for exchange
           '#34d399', // green for protocol
           '#fbbf24', // yellow for user
           '#f87171', // red for contract
           '#a78bfa', // purple for high volume
           '#f97316'  // orange for main wallet
         ]);
 
       // Create the simulation with improved forces
       const simulation = d3.forceSimulation<Node>(allNodes)
         .force('link', d3.forceLink<Node, Link>(links)
           .id(d => d.id)
           .distance(d => 100 / (Math.sqrt((d as any).transactions || 1) + 1) + 50)) // Closer for more transactions
         .force('charge', d3.forceManyBody()
           .strength((d: any) => (d.isMainWallet ? -500 : -200))) // Stronger repulsion for main wallet
         .force('center', d3.forceCenter(width / 2, height / 2))
         .force('collision', d3.forceCollide().radius((d: any) => 
           Math.sqrt(d.balance || 1000) / 5000 + 10 + (d.isMainWallet ? 10 : 0)
         )); // Prevent overlap
 
       // Create the SVG elements
       const svg = d3.select(svgRef.current);
 
       // Add zoom functionality
       const zoomHandler = d3.zoom<SVGSVGElement, unknown>()
         .scaleExtent([0.2, 5])
         .on('zoom', (event) => {
           container.attr('transform', event.transform.toString());
         });
 
       svg.call(zoomHandler);
 
       // Create a container for all visualized elements
       const container = svg.append('g');
 
       // Create the links with improved styling
       const link = container.append('g')
         .selectAll('line')
         .data(links)
         .join('line')
         .attr('stroke', '#999')
         .attr('stroke-opacity', 0.6)
         .attr('stroke-width', d => Math.sqrt(d.transactions) + 1);
 
       // Create node groups for better organization
       const nodeGroup = container.append('g')
         .selectAll('g')
         .data(allNodes)
         .join('g')
         .call(drag(simulation) as any)
         .on('mouseover', function(event, d) {
           // Highlight connected links on hover
           link
             .attr('stroke', l => 
               ((l.source as any).id === d.id || (l.target as any).id === d.id) ? '#ff0000' : '#999'
             )
             .attr('stroke-opacity', l => 
               ((l.source as any).id === d.id || (l.target as any).id === d.id) ? 0.9 : 0.2
             )
             .attr('stroke-width', l => 
               ((l.source as any).id === d.id || (l.target as any).id === d.id) ? 
                 Math.sqrt((l as any).transactions || 1) + 2 : 
                 Math.sqrt((l as any).transactions || 1) + 1
             );
             
           // Show tooltip with detailed information
           tooltip
             .style('opacity', 1)
             .html(`
               <div class="p-2">
                 <div class="font-bold">${d.label}</div>
                 <div>Balance: ${formatBalance(d.balance || 0)} SOL</div>
                 <div>Transactions: ${d.transactionCount || 0}</div>
                 <div>Type: ${d.type}</div>
               </div>
             `)
             .style('left', (event.pageX + 10) + 'px')
             .style('top', (event.pageY - 10) + 'px');
         })
         .on('mouseout', function() {
           // Reset links on mouseout
           link
             .attr('stroke', '#999')
             .attr('stroke-opacity', 0.6)
             .attr('stroke-width', d => Math.sqrt(d.transactions) + 1);
             
           // Hide tooltip
           tooltip.style('opacity', 0);
         });
 
       // Add circles to the node groups
       nodeGroup.append('circle')
         .attr('r', d => calculateNodeSize(d))
         .attr('fill', d => d.isMainWallet ? colorScale('main') : colorScale(d.type))
         .attr('stroke', d => d.isMainWallet ? '#000' : 'none')
         .attr('stroke-width', d => d.isMainWallet ? 2 : 0);
 
       // Add labels to the node groups with better positioning
       nodeGroup.append('text')
         .text(d => d.label)
         .attr('font-size', d => d.isMainWallet ? 12 : 10)
         .attr('font-weight', d => d.isMainWallet ? 'bold' : 'normal')
         .attr('dx', d => calculateNodeSize(d) + 2)
         .attr('dy', 4)
         .attr('pointer-events', 'none'); // Prevent the text from intercepting mouse events
 
       // Create tooltip
       const tooltip = d3.select('body').append('div')
         .attr('class', 'tooltip')
         .style('position', 'absolute')
         .style('background', 'white')
         .style('border', '1px solid #ddd')
         .style('border-radius', '4px')
         .style('padding', '4px')
         .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
         .style('pointer-events', 'none')
         .style('opacity', 0);
 
       // Update node and link positions on simulation tick
       simulation.on('tick', () => {
         link
           .attr('x1', d => (d.source as Node).x || 0)
           .attr('y1', d => (d.source as Node).y || 0)
           .attr('x2', d => (d.target as Node).x || 0)
           .attr('y2', d => (d.target as Node).y || 0);
 
         nodeGroup
           .attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
       });
 
       // Helper function to calculate node size based on balance and importance
       function calculateNodeSize(d: Node): number {
         const baseSize = Math.sqrt(d.balance || 1000) / 5000 + 5;
         const transactionBonus = Math.sqrt(d.transactionCount || 1) / 2;
         const mainBonus = d.isMainWallet ? 5 : 0;
         return baseSize + transactionBonus + mainBonus;
       }
 
       // Helper function to format balance
       function formatBalance(balance: number): string {
         const solBalance = balance / 1e9;
         if (solBalance < 0.01) return '<0.01';
         return solBalance.toFixed(2);
       }
 
       // Create drag behavior
       function drag(simulation: d3.Simulation<Node, undefined>) {
         function dragstarted(event: any, d: Node) {
           if (!event.active) simulation.alphaTarget(0.3).restart();
           d.fx = d.x;
           d.fy = d.y;
         }
         
         function dragged(event: any, d: Node) {
           d.fx = event.x;
           d.fy = event.y;
         }
         
         function dragended(event: any, d: Node) {
           if (!event.active) simulation.alphaTarget(0);
           d.fx = null;
           d.fy = null;
         }
         
         return d3.drag<SVGGElement, Node>()
           .on('start', dragstarted)
           .on('drag', dragged)
           .on('end', dragended);
       }
 
       // Cleanup
       return () => {
         simulation.stop();
         d3.select('body').selectAll('.tooltip').remove();
       };
     } catch (error) {
       console.error('Error rendering visualization:', error);
       
       // Show error message in the SVG
       const svg = d3.select(svgRef.current);
       svg.selectAll('*').remove();
       
       svg.append('text')
         .attr('x', width / 2)
         .attr('y', height / 2)
         .attr('text-anchor', 'middle')
         .attr('fill', 'red')
         .text('Error rendering visualization');
     }
   }, [wallets, connections, width, height]);
 
   // Helper function to determine wallet type based on its characteristics
   function determineWalletType(wallet: Wallet, connections: WalletConnection[]): string {
     // Count connections for this wallet
     const connectionCount = connections.filter(
       conn => conn.source === wallet.address || conn.target === wallet.address
     ).length;
     
     // Check if it's a high volume wallet by connection count
     if (connectionCount > 3) return 'high_volume';
     
     // Use the existing type if available
     if (wallet.type) return wallet.type;
     
     // Try to guess based on balance
     if (wallet.balance > 10 * 1e9) return 'exchange'; // > 10 SOL might be an exchange
     if (wallet.balance > 1 * 1e9) return 'user';     // > 1 SOL likely a user
     
     // Default
     return 'unknown';
   }
 
   return (
     <div className="overflow-hidden bg-white rounded shadow">
       <h2 className="p-4 text-xl font-semibold">Wallet Interactions</h2>
       <div className="p-2 mb-2 text-xs text-center text-gray-500">
         Zoom with mouse wheel, drag to pan, click and drag nodes to reposition
       </div>
       <svg 
         ref={svgRef} 
         width={width} 
         height={height} 
         className="border border-gray-200"
       ></svg>
     </div>
   );
 }