import React, { useState, useEffect, useCallback, useRef } from 'react';

/* ---------------------------------------------
 * 1) Utility: Generate a random weighted graph
 * ---------------------------------------------
 */
const generateRandomGraph = (numNodes = 6) => {
  const nodes = [];
  const centerX = 300;
  const centerY = 200;
  const radius = 150;
  
  for (let i = 0; i < numNodes; i++) {
    const angle = (i / numNodes) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    nodes.push({
      id: i,
      label: String.fromCharCode(65 + i),
      x,
      y,
    });
  }

  const edges = [];
  for (let i = 0; i < numNodes; i++) {
    edges.push({
      source: i,
      target: (i + 1) % numNodes,
      weight: Math.floor(Math.random() * 10) + 1,
    });
  }
  
  const maxExtraEdges = Math.min(numNodes - 3, 3);
  let extraEdgesAdded = 0;
  
  for (let i = 0; i < numNodes && extraEdgesAdded < maxExtraEdges; i++) {
    const target = (i + 2 + Math.floor(Math.random() * (numNodes - 4))) % numNodes;
    if (
      edges.some(e =>
        (e.source === i && e.target === target) ||
        (e.source === target && e.target === i)
      ) ||
      Math.abs(i - target) <= 1 ||
      Math.abs(i - target) === numNodes - 1
    ) {
      continue;
    }
    
    edges.push({
      source: i,
      target,
      weight: Math.floor(Math.random() * 10) + 1,
    });
    extraEdgesAdded++;
  }

  return { nodes, edges };
};

/* ---------------------------------------------------------
 * 2) Main DijkstraVisualizer component
 * ---------------------------------------------------------
 */
const DijkstraVisualizer = () => {
  const [graph, setGraph] = useState(generateRandomGraph(6));
  const [nodeCount, setNodeCount] = useState(6);

  const [startNode, setStartNode] = useState(0);
  const [distances, setDistances] = useState([]);
  const [previous, setPrevious] = useState([]);
  const [visited, setVisited] = useState(new Set());
  const [unvisited, setUnvisited] = useState([]);
  
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [activeEdge, setActiveEdge] = useState(null);
  const [highlightedEdges, setHighlightedEdges] = useState([]);

  const [showGuide, setShowGuide] = useState(true);

  const autoPlayRef = useRef(null);

  /* ---------------------------------------------------------
   * 3) Dijkstra Step Generation
   * ---------------------------------------------------------
   */
  const buildDijkstraSteps = useCallback((start) => {
    const n = graph.nodes.length;
    const dist = Array(n).fill(Infinity);
    const prev = Array(n).fill(null);
    const visitedSet = new Set();
    const allNodes = Array.from({ length: n }, (_, i) => i);

    dist[start] = 0;
    const stepsArray = [];

    const getNeighbors = (node) => {
      const neighbors = [];
      for (let e of graph.edges) {
        if (e.source === node) {
          neighbors.push({ neighbor: e.target, weight: e.weight });
        } else if (e.target === node) {
          neighbors.push({ neighbor: e.source, weight: e.weight });
        }
      }
      return neighbors;
    };

    const pickNextNode = () => {
      let minNode = null;
      let minDist = Infinity;
      for (let node of allNodes) {
        if (!visitedSet.has(node) && dist[node] < minDist) {
          minDist = dist[node];
          minNode = node;
        }
      }
      return minNode;
    };

    while (visitedSet.size < n) {
      const currentNode = pickNextNode();
      if (currentNode === null) break;
      visitedSet.add(currentNode);

      stepsArray.push({
        currentNode,
        distSnapshot: [...dist],
        visitedSnapshot: new Set(visitedSet),
        activeEdge: null,
        updatedNode: null,
      });

      const neighbors = getNeighbors(currentNode);
      for (let { neighbor, weight } of neighbors) {
        if (!visitedSet.has(neighbor)) {
          const alt = dist[currentNode] + weight;
          if (alt < dist[neighbor]) {
            stepsArray.push({
              currentNode,
              distSnapshot: [...dist],
              visitedSnapshot: new Set(visitedSet),
              activeEdge: { source: currentNode, target: neighbor },
              updatedNode: neighbor,
            });
            dist[neighbor] = alt;
            prev[neighbor] = currentNode;
          }
        }
      }
    }

    stepsArray.push({
      currentNode: null,
      distSnapshot: [...dist],
      visitedSnapshot: new Set(visitedSet),
      activeEdge: null,
      updatedNode: null,
      isFinal: true,
    });

    return { dist, prev, stepsArray };
  }, [graph]);

  /* ---------------------------------------------------------
   * 4) Initialize the algorithm
   * ---------------------------------------------------------
   */
  const initializeDijkstra = useCallback(() => {
    setIsRunning(true);
    setAutoPlay(false);
    setStepIndex(0);
    setActiveEdge(null);
    setHighlightedEdges([]);
    
    const { dist, prev, stepsArray } = buildDijkstraSteps(startNode);
    setDistances(dist);
    setPrevious(prev);
    setSteps(stepsArray);

    setUnvisited([...Array(graph.nodes.length).keys()]);
    setVisited(new Set());
  }, [startNode, buildDijkstraSteps, graph.nodes.length]);

  /* ---------------------------------------------------------
   * 5) Step through the algorithm
   * ---------------------------------------------------------
   */
  const runNextStep = useCallback(() => {
    if (stepIndex >= steps.length) {
      setIsRunning(false);
      return;
    }

    const step = steps[stepIndex];
    setDistances(step.distSnapshot);
    setVisited(step.visitedSnapshot);
    setActiveEdge(step.activeEdge || null);
    setStepIndex(stepIndex + 1);

    if (step.isFinal) {
      const finalEdges = [];
      for (let i = 0; i < previous.length; i++) {
        if (previous[i] !== null) {
          finalEdges.push({ source: previous[i], target: i });
        }
      }
      setHighlightedEdges(finalEdges);
      setIsRunning(false);
    }
  }, [stepIndex, steps, previous]);

  /* ---------------------------------------------------------
   * 6) Auto-play the algorithm
   * ---------------------------------------------------------
   */
  const handleAutoPlay = useCallback(() => {
    if (autoPlay) {
      setAutoPlay(false);
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    } else {
      setAutoPlay(true);
      autoPlayRef.current = setInterval(() => {
        setStepIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= steps.length) {
            clearInterval(autoPlayRef.current);
            setAutoPlay(false);
            setIsRunning(false);
            return prevIndex;
          }
          return nextIndex;
        });
      }, animationSpeed);
    }
  }, [autoPlay, steps.length, animationSpeed]);

  useEffect(() => {
    if (stepIndex < steps.length && steps.length > 0) {
      const step = steps[stepIndex];
      setDistances(step.distSnapshot);
      setVisited(step.visitedSnapshot);
      setActiveEdge(step.activeEdge || null);

      if (step.isFinal) {
        const finalEdges = [];
        for (let i = 0; i < previous.length; i++) {
          if (previous[i] !== null) {
            finalEdges.push({ source: previous[i], target: i });
          }
        }
        setHighlightedEdges(finalEdges);
        setIsRunning(false);
        setAutoPlay(false);
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
          autoPlayRef.current = null;
        }
      }
    }
  }, [stepIndex, steps, previous]);

  useEffect(() => {
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  /* ---------------------------------------------------------
   * 7) Handlers for UI
   * ---------------------------------------------------------
   */
  const handleFindPath = () => {
    initializeDijkstra();
    setTimeout(() => {
      for (let i = 0; i < steps.length; i++) {
        setTimeout(() => {
          runNextStep();
        }, i * (animationSpeed / 2));
      }
    }, 100);
  };

  const handleNextStep = () => {
    if (!isRunning && stepIndex === 0) {
      initializeDijkstra();
      setTimeout(() => runNextStep(), 100);
    } else {
      runNextStep();
    }
  };

  const handleReset = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    setAutoPlay(false);
    setIsRunning(false);
    setStepIndex(0);
    setSteps([]);
    setDistances([]);
    setPrevious([]);
    setVisited(new Set());
    setUnvisited([]);
    setActiveEdge(null);
    setHighlightedEdges([]);
  };

  const handleRandomizeGraph = () => {
    handleReset();
    setGraph(generateRandomGraph(nodeCount));
  };

  const handleNodeCountChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val >= 3 && val <= 10) {
      setNodeCount(val);
      handleReset();
      setGraph(generateRandomGraph(val));
    }
  };

  const handleStartNodeChange = (e) => {
    setStartNode(parseInt(e.target.value, 10));
  };

  const handleSpeedChange = (e) => {
    setAnimationSpeed(parseInt(e.target.value, 10));
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  /* ---------------------------------------------------------
   * 8) Rendering the Graph (UPDATED with Animations)
   * ---------------------------------------------------------
   */
  const isEdgeHighlighted = (edge) => {
    if (
      highlightedEdges.some(
        (e) =>
          (e.source === edge.source && e.target === edge.target) ||
          (e.source === edge.target && e.target === edge.source)
      )
    ) {
      return 'stroke-green-600 stroke-3 [stroke-dasharray:8] animate-final-path';
    }
    if (
      activeEdge &&
      ((activeEdge.source === edge.source && activeEdge.target === edge.target) ||
        (activeEdge.source === edge.target && activeEdge.target === edge.source))
    ) {
      return 'stroke-red-600 stroke-3 animate-active-edge';
    }
    return 'stroke-gray-300 stroke-2';
  };

  const getEdgeLabelPosition = (sourceNode, targetNode) => {
    const mx = (sourceNode.x + targetNode.x) / 2;
    const my = (sourceNode.y + targetNode.y) / 2;
    return { x: mx, y: my };
  };

  const getActiveEdgeMotion = () => {
    if (!activeEdge) return null;
    const sourceActive = graph.nodes.find((n) => n.id === activeEdge.source);
    const targetActive = graph.nodes.find((n) => n.id === activeEdge.target);
    if (!sourceActive || !targetActive) return null;
    return `M ${sourceActive.x} ${sourceActive.y} L ${targetActive.x} ${targetActive.y}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 relative">
      <style>{`
        @keyframes activeEdgePulse {
          0% { stroke-width: 2; opacity: 0.8; }
          50% { stroke-width: 4; opacity: 1; }
          100% { stroke-width: 2; opacity: 0.8; }
        }
        @keyframes finalPathDash {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .animate-active-edge {
          animation: activeEdgePulse 1s infinite;
        }
        .animate-final-path {
          animation: finalPathDash 2s linear infinite;
        }
      `}</style>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome to Dijkstra Visualizer</h2>
            <ul className="list-disc pl-5 mb-4 text-gray-700">
              <li>Select a start node from the dropdown.</li>
              <li>
                Press <span className="font-semibold">Find Path</span> to automatically animate the algorithm's execution.
              </li>
              <li>
                Use <span className="font-semibold">Next Step</span> to manually advance one step at a time.
              </li>
              <li>
                Alternatively, select <span className="font-semibold">Auto Play</span> to continuously run the algorithm.
              </li>
              <li>
                Adjust <span className="font-semibold">Node Count</span> and <span className="font-semibold">Animation Speed</span> as desired.
              </li>
              <li>
                Click <span className="font-semibold">Randomize Graph</span> for a new random weighted graph.
              </li>
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

      {/* Title */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">Dijkstra's Algorithm Visualizer</h1>
        <p className="text-gray-600 mt-2">Find the shortest paths from your chosen start node.</p>
      </header>

      {/* Controls */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 bg-white p-4 rounded shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Node Count</label>
            <div className="flex items-center">
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                value={nodeCount}
                onChange={handleNodeCountChange}
                className="w-full mr-2"
                disabled={isRunning || autoPlay}
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
                disabled={autoPlay}
              />
              <span className="text-gray-700">{animationSpeed}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Start</label>
            <select
              value={startNode}
              onChange={handleStartNodeChange}
              className="border border-gray-300 rounded px-2 py-1"
              disabled={isRunning || autoPlay}
            >
              {graph.nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleFindPath}
              disabled={isRunning || autoPlay}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Find Path
            </button>
            <button
              onClick={handleNextStep}
              disabled={autoPlay}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Next Step
            </button>
            <button
              onClick={handleAutoPlay}
              disabled={steps.length === 0 && !isRunning}
              className={`px-4 py-2 text-white rounded transition-colors ${autoPlay ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'} disabled:opacity-50`}
            >
              {autoPlay ? 'Stop' : 'Auto Play'}
            </button>
            <button
              onClick={handleReset}
              disabled={autoPlay}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={handleRandomizeGraph}
              disabled={autoPlay}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Randomize Graph
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Distances</h2>
          {distances.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {graph.nodes.map((node, idx) => (
                <div key={node.id} className="flex items-center justify-between border-b border-gray-200 pb-1">
                  <span className="text-gray-700 font-medium">{node.label}:</span>
                  <span>{distances[idx] === Infinity ? '∞' : distances[idx]}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No distance data yet.</p>
          )}
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="max-w-5xl mx-auto bg-white rounded shadow p-4">
        <svg viewBox="0 0 600 400" className="w-full h-auto">
          <defs>
            <marker 
              id="arrowhead-active" 
              markerWidth="12" 
              markerHeight="12" 
              refX="10" 
              refY="6" 
              orient="auto"
            >
              <path d="M0,0 L0,12 L12,6 Z" fill="red" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {graph.edges.map((edge, i) => {
            const sourceNode = graph.nodes[edge.source];
            const targetNode = graph.nodes[edge.target];
            const highlightClass = isEdgeHighlighted(edge);
            const isActive = highlightClass.includes('animate-active-edge');
            
            return (
              <g key={i}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  className={`transition-all duration-300 ${highlightClass}`}
                  markerEnd={isActive ? "url(#arrowhead-active)" : undefined}
                />
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2}
                  textAnchor="middle"
                  dy="-5"
                  className={`text-sm font-bold ${isActive ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Active-edge animation */}
          {activeEdge && getActiveEdgeMotion() && (
            <path d="M-5,-5 L5,0 L-5,5 Z" fill="red" filter="url(#glow)">
              <animateMotion
                dur={`${animationSpeed/1000}s`}
                path={getActiveEdgeMotion()}
                fill="freeze"
                rotate="auto"
                repeatCount="1"
              />
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </path>
          )}

          {/* Nodes */}
          {graph.nodes.map((node) => {
            const isVisited = visited.has(node.id);
            // Only mark a node as "current" while the algorithm is running.
            const isCurrent = isRunning && (steps[stepIndex - 1]?.currentNode === node.id);
            const isStart = node.id === startNode;
            return (
              <g key={node.id} className="cursor-pointer">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="18"
                  strokeWidth="2"
                  stroke={isStart ? 'blue' : 'black'}
                  className={`
                    transition-colors duration-500
                    ${isCurrent ? 'fill-yellow-300 animate-pulse' : 
                      isVisited ? 'fill-green-300' : 'fill-pink-100'}
                  `}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  className="font-bold text-gray-800 pointer-events-none"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default DijkstraVisualizer;
