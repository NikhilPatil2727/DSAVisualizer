import React, { useState, useEffect, useCallback } from 'react';

// Modified utility function to generate cleaner, more understandable graphs
const generateRandomGraph = (numNodes = 5) => {
  const nodes = [];
  // Create nodes in a more structured layout (circular arrangement)
  const radius = 150;
  const centerX = 300;
  const centerY = 200;

  for (let i = 0; i < numNodes; i++) {
    // Calculate position in a circle for better node distribution
    const angle = (i / numNodes) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    nodes.push({
      id: i,
      label: String.fromCharCode(65 + i), // A, B, C, etc.
      x: x,
      y: y,
    });
  }

  const edges = [];
  
  // First ensure basic connectivity with a circle structure
  // Connect each node to the next node in sequence
  for (let i = 0; i < numNodes; i++) {
    edges.push({ 
      source: i, 
      target: (i + 1) % numNodes 
    });
  }

  // Add just a few strategic cross-edges for variety but not complexity
  // For graphs with more than 5 nodes, add a small number of cross connections
  if (numNodes > 4) {
    // Add 1-3 cross edges depending on graph size
    const crossEdgesToAdd = Math.min(3, Math.floor(numNodes / 3));
    
    for (let i = 0; i < crossEdgesToAdd; i++) {
      // Choose nodes that aren't adjacent in the circle
      let source = Math.floor(Math.random() * numNodes);
      let target = (source + 2 + Math.floor(Math.random() * (numNodes - 4))) % numNodes;
      
      // Check if this edge already exists
      if (!edges.some(edge => 
          (edge.source === source && edge.target === target) || 
          (edge.source === target && edge.target === source))) {
        edges.push({ source, target });
      }
    }
  }
  
  return { nodes, edges };
};

const DFSVisualizer = () => {
  // Graph state.
  const [graph, setGraph] = useState(generateRandomGraph(5));
  const [nodeCount, setNodeCount] = useState(5);
  
  // DFS state.
  const [startNode, setStartNode] = useState(null);
  const [visited, setVisited] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [current, setCurrent] = useState(null);
  // Instead of just storing an edge, we store direction info: from & to.
  const [activeEdge, setActiveEdge] = useState(null);
  const [showGuide, setShowGuide] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  // Utility delay function.
  const delay = useCallback((ms) => new Promise(resolve => setTimeout(resolve, ms)), []);

  // Asynchronous recursive DFS with visual updates.
  const dfs = useCallback(async (node, visitedSet = new Set()) => {
    visitedSet.add(node);
    setVisited(Array.from(visitedSet));
    setCurrent(node);
    
    await delay(animationSpeed); // Pause to show current node.

    // Get neighbors that haven't been visited.
    const neighbors = graph.edges
      .filter(edge => edge.source === node || edge.target === node)
      .map(edge => (edge.source === node ? edge.target : edge.source))
      .filter(neighbor => !visitedSet.has(neighbor));
    // Sort to have a deterministic order.
    neighbors.sort((a, b) => a - b);

    for (let neighbor of neighbors) {
      // Determine the connecting edge.
      const connectingEdge = graph.edges.find(
        edge =>
          (edge.source === node && edge.target === neighbor) ||
          (edge.source === neighbor && edge.target === node)
      );
      // Store both the edge and the DFS direction (from current node to neighbor).
      setActiveEdge({ ...connectingEdge, from: node, to: neighbor });
      await delay(animationSpeed / 2); // Let the edge animation play.
      
      await dfs(neighbor, visitedSet);
    }
    
    // Clear active edge when finished with all neighbors.
    setActiveEdge(null);
  }, [graph.edges, delay, animationSpeed]);

  // Start DFS if a start node is selected.
  const handleStart = useCallback(() => {
    if (startNode !== null && !isRunning) {
      setIsRunning(true);
      setVisited([]);
      setCurrent(null);
      setActiveEdge(null);
      dfs(startNode, new Set()).then(() => {
        setCurrent(null);
        setIsRunning(false);
      });
    }
  }, [startNode, isRunning, dfs]);

  // Reset DFS state.
  const handleReset = useCallback(() => {
    if (!isRunning) {
      setVisited([]);
      setCurrent(null);
      setActiveEdge(null);
      setStartNode(null);
    }
  }, [isRunning]);

  // Generate a new random graph.
  const handleRandomizeGraph = useCallback(() => {
    if (!isRunning) {
      setGraph(generateRandomGraph(nodeCount));
      handleReset();
    }
  }, [isRunning, handleReset, nodeCount]);

  // Handle node click.
  const handleNodeClick = useCallback((nodeId) => {
    if (isRunning) return;
    setStartNode(nodeId);
  }, [isRunning]);

  // Handle node count change.
  const handleNodeCountChange = useCallback((e) => {
    const newCount = parseInt(e.target.value, 10);
    if (!isRunning && newCount >= 3 && newCount <= 10) {
      setNodeCount(newCount);
      setGraph(generateRandomGraph(newCount));
      handleReset();
    }
  }, [isRunning, handleReset]);

  // Handle animation speed change.
  const handleSpeedChange = useCallback((e) => {
    setAnimationSpeed(parseInt(e.target.value, 10));
  }, []);

  // Auto-hide the guide after 10 seconds.
  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Check if an edge is active (for static styling).
  const isEdgeActive = useCallback((edge) => {
    return (
      activeEdge &&
      ((edge.source === activeEdge.source && edge.target === activeEdge.target) ||
       (edge.source === activeEdge.target && edge.target === activeEdge.source))
    );
  }, [activeEdge]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* Inline CSS for edge drawing animation */}
      <style>{`
        @keyframes drawLine {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        .animate-draw {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawLine 1s forwards;
        }
      `}</style>

      {/* User Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome to DFS Visualizer</h2>
            <ul className="list-disc pl-5 mb-4 text-gray-700">
              <li>Click on any node to choose your starting point.</li>
              <li>Press <span className="font-semibold">Start DFS</span> to begin the traversal.</li>
              <li>Watch as nodes and edges animate to show the algorithm's progress.</li>
              <li>Adjust the number of nodes (3-10) and animation speed.</li>
              <li>Use <span className="font-semibold">Randomize Graph</span> to create a new graph.</li>
              <li>Click <span className="font-semibold">Reset</span> to restart the DFS on the current graph.</li>
            </ul>
            <button 
              onClick={() => setShowGuide(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">Depth-First Search Visualizer</h1>
        <p className="text-gray-600 mt-2">
          Experience an interactive, animated visualization of the DFS algorithm.
        </p>
      </header>
      
      {/* Configuration Controls */}
      <div className="w-full max-w-4xl mx-auto mb-6 bg-white p-4 rounded-md shadow grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Nodes</label>
          <div className="flex items-center">
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={nodeCount}
              onChange={handleNodeCountChange}
              disabled={isRunning}
              className="w-full mr-2"
            />
            <span className="text-gray-700">{nodeCount}</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Animation Speed (ms)</label>
          <div className="flex items-center">
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={animationSpeed}
              onChange={handleSpeedChange}
              className="w-full mr-2"
            />
            <span className="text-gray-700">{animationSpeed}</span>
          </div>
        </div>
        
        <div className="flex items-end">
          <button 
            onClick={() => setShowGuide(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Show Guide
          </button>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white rounded-md shadow border border-gray-300 p-4">
          <svg viewBox="0 0 600 400" className="w-full h-auto">
            {/* Define arrow marker for directional indication */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="blue" />
              </marker>
            </defs>

            {/* Render Edges */}
            {graph.edges.map((edge, index) => {
              const sourceNode = graph.nodes.find(n => n.id === edge.source);
              const targetNode = graph.nodes.find(n => n.id === edge.target);
              const activeClass = isEdgeActive(edge)
                ? 'animate-draw stroke-blue-500'
                : 'stroke-gray-300';
              return (
                <line
                  key={`edge-${index}`}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  strokeWidth="2"
                  className={`transition-all duration-300 ${activeClass}`}
                  // Optionally, add marker-end to indicate direction on static edges:
                  // markerEnd="url(#arrowhead)"
                />
              );
            })}

            {/* Animated traversal indicator for active edge */}
            {activeEdge && (() => {
              const sourceActive = graph.nodes.find(n => n.id === activeEdge.from);
              const targetActive = graph.nodes.find(n => n.id === activeEdge.to);
              if (!sourceActive || !targetActive) return null;
              const pathStr = `M ${sourceActive.x} ${sourceActive.y} L ${targetActive.x} ${targetActive.y}`;
              return (
                <circle r="5" fill="red">
                  <animateMotion 
                    dur={`${animationSpeed / 1000}s`} 
                    path={pathStr} 
                    fill="freeze" 
                    repeatCount="1" />
                </circle>
              );
            })()}

            {/* Render Nodes */}
            {graph.nodes.map((node) => {
              const isVisited = visited.includes(node.id);
              const isCurrent = current === node.id;
              const isStart = startNode === node.id;
              return (
                <g
                  key={`node-${node.id}`}
                  onClick={() => handleNodeClick(node.id)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    className={`
                      transition duration-500
                      ${isStart ? 'stroke-4 stroke-blue-500' : 'stroke-black'}
                      ${isCurrent ? 'fill-yellow-300 animate-pulse' : isVisited ? 'fill-green-300' : 'fill-white'}
                    `}
                    stroke="black"
                    strokeWidth="2"
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    className="font-bold text-gray-800"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={handleStart}
            disabled={startNode === null || isRunning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Start DFS'}
          </button>
          <button
            onClick={handleReset}
            disabled={isRunning}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={handleRandomizeGraph}
            disabled={isRunning}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Randomize Graph
          </button>
        </div>

        {/* DFS Details Panel */}
        <div className="mt-8 w-full max-w-4xl bg-gray-50 p-6 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">DFS Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="mb-2">
                <strong>Total Nodes:</strong> {graph.nodes.length}
              </p>
              <p className="mb-2">
                <strong>Total Edges:</strong> {graph.edges.length}
              </p>
              <p className="mb-2">
                <strong>Start Node:</strong>{' '}
                {startNode !== null 
                  ? graph.nodes.find(n => n.id === startNode).label 
                  : 'None'}
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Current Node:</strong>{' '}
                {current !== null 
                  ? graph.nodes.find(n => n.id === current).label 
                  : 'None'}
              </p>
              <p className="mb-2">
                <strong>Visited Nodes:</strong> {visited.length} of {graph.nodes.length}
              </p>
              <p>
                <strong>Visited Order:</strong>{' '}
                {visited.length > 0
                  ? visited.map(id => graph.nodes.find(n => n.id === id).label).join(' → ')
                  : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DFSVisualizer;