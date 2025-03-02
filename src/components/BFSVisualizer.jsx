import React, { useState, useEffect } from 'react';

// Utility function to generate a random graph.
const generateRandomGraph = (numNodes = 5) => {
  const nodes = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      id: i,
      label: String.fromCharCode(65 + i), // A, B, C, etc.
      x: Math.floor(Math.random() * 500) + 50,  // x between 50 and 550
      y: Math.floor(Math.random() * 300) + 50,  // y between 50 and 350
    });
  }
  const edges = [];
  // Ensure connectivity by chaining nodes.
  for (let i = 1; i < numNodes; i++) {
    edges.push({ source: i - 1, target: i });
  }
  // Add additional random edges.
  for (let i = 0; i < numNodes; i++) {
    for (let j = i + 1; j < numNodes; j++) {
      if (Math.random() < 0.4) {
        edges.push({ source: i, target: j });
      }
    }
  }
  return { nodes, edges };
};

const BFSVisualizer = () => {
  // Graph state: nodes and edges.
  const [graph, setGraph] = useState(generateRandomGraph(5));

  // BFS state.
  const [startNode, setStartNode] = useState(null);
  const [visited, setVisited] = useState([]);
  const [queue, setQueue] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [current, setCurrent] = useState(null);
  const [showGuide, setShowGuide] = useState(true);

  // Animation timing.
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Asynchronous BFS with visual updates.
  const bfs = async (start) => {
    setIsRunning(true);
    const visitedSet = new Set();
    const q = [];
    visitedSet.add(start);
    q.push(start);
    setVisited([start]);
    setQueue([...q]);

    while (q.length > 0) {
      const node = q.shift();
      setCurrent(node);
      setQueue([...q]);
      await delay(1000); // Wait before processing neighbors

      // Find unvisited neighbors in the graph.
      const neighbors = graph.edges
        .filter(edge => edge.source === node || edge.target === node)
        .map(edge => (edge.source === node ? edge.target : edge.source))
        .filter(neighbor => !visitedSet.has(neighbor));

      // Animate processing of each neighbor.
      for (let neighbor of neighbors) {
        visitedSet.add(neighbor);
        q.push(neighbor);
        setVisited(prev => [...prev, neighbor]);
        setQueue([...q]);
        await delay(500);
      }
    }
    setCurrent(null);
    setIsRunning(false);
  };

  // Handle node click if not running.
  const handleNodeClick = (nodeId) => {
    if (isRunning) return;
    setStartNode(nodeId);
  };

  // Start BFS if a start node has been selected.
  const handleStart = () => {
    if (startNode !== null && !isRunning) {
      bfs(startNode);
    }
  };

  // Reset BFS state (graph remains unchanged).
  const handleReset = () => {
    setIsRunning(false);
    setVisited([]);
    setQueue([]);
    setCurrent(null);
    setStartNode(null);
  };

  // Generate a new random graph and reset BFS state.
  const handleRandomizeGraph = () => {
    setGraph(generateRandomGraph(5));
    handleReset();
  };

  // Auto-hide the guide after 10 seconds.
  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Check if an edge should animate (active edge from the current node to an unvisited neighbor).
  const isEdgeActive = (edge) => {
    if (current === null) return false;
    if (edge.source === current && !visited.includes(edge.target)) return true;
    if (edge.target === current && !visited.includes(edge.source)) return true;
    return false;
  };

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
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome to BFS Visualizer</h2>
            <ul className="list-disc pl-5 mb-4 text-gray-700">
              <li>Click on any node to choose your starting point.</li>
              <li>Press <span className="font-semibold">Start BFS</span> to begin the traversal.</li>
              <li>Watch as nodes and edges animate to show the algorithm's progress.</li>
              <li>Use <span className="font-semibold">Randomize Graph</span> to create a new graph.</li>
              <li>Click <span className="font-semibold">Reset</span> to restart the BFS on the current graph.</li>
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
        <h1 className="text-4xl font-extrabold text-gray-800">Breadth-First Search Visualizer</h1>
        <p className="text-gray-600 mt-2">
          Experience an interactive, animated visualization of the BFS algorithm.
        </p>
      </header>

      {/* Graph Visualization */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white rounded-md shadow border border-gray-300 p-4">
          <svg viewBox="0 0 600 400" className="w-full h-auto">
            {/* Render Edges */}
            {graph.edges.map((edge, index) => {
              const sourceNode = graph.nodes.find(n => n.id === edge.source);
              const targetNode = graph.nodes.find(n => n.id === edge.target);
              const activeClass = isEdgeActive(edge) ? 'animate-draw stroke-blue-500' : 'stroke-gray-300';
              return (
                <line
                  key={index}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  strokeWidth="2"
                  className={`transition-all duration-300 ${activeClass}`}
                />
              );
            })}
            {/* Render Nodes */}
            {graph.nodes.map((node) => {
              const isVisited = visited.includes(node.id);
              const isCurrent = current === node.id;
              const isStart = startNode === node.id;
              return (
                <g
                  key={node.id}
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
            {isRunning ? 'Running...' : 'Start BFS'}
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

        {/* BFS Details Panel */}
        <div className="mt-8 w-full max-w-4xl bg-gray-50 p-6 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">BFS Details</h2>
          <p className="mb-2">
            <strong>Start Node:</strong>{' '}
            {startNode !== null 
              ? graph.nodes.find(n => n.id === startNode).label 
              : 'None'}
          </p>
          <p className="mb-2">
            <strong>Current Node:</strong>{' '}
            {current !== null 
              ? graph.nodes.find(n => n.id === current).label 
              : 'None'}
          </p>
          <p className="mb-2">
            <strong>Queue:</strong>{' '}
            {queue.map(id => graph.nodes.find(n => n.id === id).label).join(', ') || 'Empty'}
          </p>
          <p>
            <strong>Visited Order:</strong>{' '}
            {visited.map(id => graph.nodes.find(n => n.id === id).label).join(' -> ') || 'None'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BFSVisualizer;
