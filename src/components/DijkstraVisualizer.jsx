import React, { useState, useEffect, useCallback, useRef } from 'react';


/* ---------------------------------------------
 * 1) Utility: Generate a random weighted graph
 * ---------------------------------------------
 * - Ensures no duplicate edges.
 * - Ensures each edge has a random weight between 1 and 15.
 * - Positions each node randomly (within the SVG view).
 */
const generateRandomGraph = (numNodes = 6) => {
  const nodes = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      id: i,
      label: String.fromCharCode(65 + i), // A, B, C, ...
      x: Math.floor(Math.random() * 500) + 50,  // range: [50..550]
      y: Math.floor(Math.random() * 300) + 50,  // range: [50..350]
    });
  }

  const edges = [];
  // Create a simple chain to ensure connectivity
  for (let i = 1; i < numNodes; i++) {
    edges.push({
      source: i - 1,
      target: i,
      weight: Math.floor(Math.random() * 15) + 1, // range: [1..15]
    });
  }
  // Add random edges
  for (let i = 0; i < numNodes; i++) {
    for (let j = i + 1; j < numNodes; j++) {
      // Skip if it already exists
      if (
        edges.some(e =>
          (e.source === i && e.target === j) ||
          (e.source === j && e.target === i)
        )
      ) {
        continue;
      }
      // With probability ~0.35, add an edge
      if (Math.random() < 0.35) {
        edges.push({
          source: i,
          target: j,
          weight: Math.floor(Math.random() * 15) + 1,
        });
      }
    }
  }

  return { nodes, edges };
};

/* ---------------------------------------------------------
 * 2) Main DijkstraVisualizer component
 * ---------------------------------------------------------
 */
const DijkstraVisualizer = () => {
  // ---- Graph states ----
  const [graph, setGraph] = useState(generateRandomGraph(6));
  const [nodeCount, setNodeCount] = useState(6);

  // ---- Dijkstra states ----
  const [startNode, setStartNode] = useState(0);   // index of the start node
  const [distances, setDistances] = useState([]);  // final distance to each node
  const [previous, setPrevious] = useState([]);    // to reconstruct final paths
  const [visited, setVisited] = useState(new Set());
  const [unvisited, setUnvisited] = useState([]);
  
  // For stepping through the algorithm
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState([]);          // a list of "snapshot" objects
  const [isRunning, setIsRunning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  
  // Animation
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [activeEdge, setActiveEdge] = useState(null);   // {source, target} being relaxed
  const [highlightedEdges, setHighlightedEdges] = useState([]); // final shortest-path edges

  // UI
  const [showGuide, setShowGuide] = useState(true);

  // Reference for auto-play interval
  const autoPlayRef = useRef(null);

  /* ---------------------------------------------------------
   * 3) Dijkstra Step Generation
   *    We generate a sequence of "steps" so we can animate 
   *    them one at a time with Next Step or Auto Play.
   * ---------------------------------------------------------
   */
  const buildDijkstraSteps = useCallback((start) => {
    const n = graph.nodes.length;
    const dist = Array(n).fill(Infinity);
    const prev = Array(n).fill(null);
    const visitedSet = new Set();
    const allNodes = Array.from({ length: n }, (_, i) => i);

    dist[start] = 0;

    // We'll store each "step" as an object describing the state
    const stepsArray = [];

    const getNeighbors = (node) => {
      // return array of { neighbor, weight }
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

    // A simple "priority queue" approach using unvisited + dist
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
      if (currentNode === null) {
        // All remaining nodes are unreachable
        break;
      }
      visitedSet.add(currentNode);

      // Record a step: we've chosen currentNode
      stepsArray.push({
        currentNode,
        distSnapshot: [...dist],
        visitedSnapshot: new Set(visitedSet),
        activeEdge: null,
        updatedNode: null,
      });

      // Relax edges
      const neighbors = getNeighbors(currentNode);
      for (let { neighbor, weight } of neighbors) {
        if (!visitedSet.has(neighbor)) {
          const alt = dist[currentNode] + weight;
          if (alt < dist[neighbor]) {
            // We'll push a step for the "relaxation" of neighbor
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

    // Final step: record the final distances
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
    
    // Build steps
    const { dist, prev, stepsArray } = buildDijkstraSteps(startNode);
    setDistances(dist);
    setPrevious(prev);
    setSteps(stepsArray);

    // We'll keep track of unvisited so we can highlight them if needed
    setUnvisited([...Array(graph.nodes.length).keys()]);
    setVisited(new Set());

  }, [startNode, buildDijkstraSteps, graph.nodes.length]);

  /* ---------------------------------------------------------
   * 5) Step through the algorithm
   * ---------------------------------------------------------
   */
  const runNextStep = useCallback(() => {
    if (stepIndex >= steps.length) {
      // No more steps
      setIsRunning(false);
      return;
    }

    const step = steps[stepIndex];
    // Update distances, visited, activeEdge, etc. based on this step
    setDistances(step.distSnapshot);
    setVisited(step.visitedSnapshot);
    setActiveEdge(step.activeEdge || null);

    setStepIndex(stepIndex + 1);

    // If this is the final step, highlight final shortest paths
    if (step.isFinal) {
      // Build final highlight edges from 'previous' array
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
   * 6) Auto-play the algorithm (step-by-step with a timer)
   * ---------------------------------------------------------
   */
  const handleAutoPlay = useCallback(() => {
    if (autoPlay) {
      // Stop auto-play
      setAutoPlay(false);
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    } else {
      // Start auto-play
      setAutoPlay(true);
      autoPlayRef.current = setInterval(() => {
        setStepIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= steps.length) {
            // Stop
            clearInterval(autoPlayRef.current);
            setAutoPlay(false);
            setIsRunning(false);
            return prevIndex; // remain
          }
          return nextIndex;
        });
      }, animationSpeed);
    }
  }, [autoPlay, steps.length, animationSpeed]);

  // Whenever stepIndex changes in auto-play, we update the states
  useEffect(() => {
    if (stepIndex < steps.length && steps.length > 0) {
      const step = steps[stepIndex];
      setDistances(step.distSnapshot);
      setVisited(step.visitedSnapshot);
      setActiveEdge(step.activeEdge || null);

      if (step.isFinal) {
        // highlight final shortest paths
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

  // Clear auto-play interval on unmount
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
    // Simply initialize, then run all steps at once
    initializeDijkstra();
    setTimeout(() => {
      // after building steps, we can step through them all quickly
      for (let i = 0; i < steps.length; i++) {
        setTimeout(() => {
          runNextStep();
        }, i * (animationSpeed / 2));
      }
    }, 100);
  };

  const handleNextStep = () => {
    // If not initialized, do so
    if (!isRunning && stepIndex === 0) {
      initializeDijkstra();
      setTimeout(() => runNextStep(), 100);
    } else {
      runNextStep();
    }
  };

  const handleReset = () => {
    // Stop everything, reset states
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

  // Auto-hide the guide after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  /* ---------------------------------------------------------
   * 8) Rendering the Graph
   * ---------------------------------------------------------
   * We'll highlight:
   * - The active edge (pink or a special color).
   * - The final shortest path edges (green).
   * - The visited nodes (different fill color).
   * - The current node (yellow).
   * - The start node (blue stroke).
   */
  const isEdgeHighlighted = (edge) => {
    // If it's in the final shortest path edges
    if (
      highlightedEdges.some(
        (e) =>
          (e.source === edge.source && e.target === edge.target) ||
          (e.source === edge.target && e.target === edge.source)
      )
    ) {
      return 'stroke-green-500';
    }
    // If it's currently being relaxed
    if (
      activeEdge &&
      ((activeEdge.source === edge.source && activeEdge.target === edge.target) ||
        (activeEdge.source === edge.target && activeEdge.target === edge.source))
    ) {
      return 'stroke-pink-500 animate-draw';
    }
    // default
    return 'stroke-gray-300';
  };

  // Reconstruct the text for weight on each edge
  const getEdgeLabelPosition = (sourceNode, targetNode) => {
    // midpoint
    const mx = (sourceNode.x + targetNode.x) / 2;
    const my = (sourceNode.y + targetNode.y) / 2;
    return { x: mx, y: my };
  };

  // For final path highlight motion
  const getActiveEdgeMotion = () => {
    if (!activeEdge) return null;
    const sourceActive = graph.nodes.find((n) => n.id === activeEdge.source);
    const targetActive = graph.nodes.find((n) => n.id === activeEdge.target);
    if (!sourceActive || !targetActive) return null;
    const pathStr = `M ${sourceActive.x} ${sourceActive.y} L ${targetActive.x} ${targetActive.y}`;
    return pathStr;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 relative">
      {/* Inline CSS for stroke-dash animations */}
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

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome to Dijkstra Visualizer</h2>
            <ul className="list-disc pl-5 mb-4 text-gray-700">
              <li>Select a start node from the dropdown.</li>
              <li>Press <span className="font-semibold">Find Path</span> to run the entire algorithm at once.</li>
              <li>Use <span className="font-semibold">Next Step</span> or <span className="font-semibold">Auto Play</span> to step through it.</li>
              <li>Adjust <span className="font-semibold">Node Count</span> and <span className="font-semibold">Animation Speed</span> as desired.</li>
              <li>Click <span className="font-semibold">Randomize Graph</span> for a new random weighted graph.</li>
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
        {/* Left controls */}
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
              className={`px-4 py-2 text-white rounded transition-colors 
                ${autoPlay ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'} 
                disabled:opacity-50`}
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
        
        {/* Right: Distances Table */}
        <div className="flex-1 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Distances</h2>
          {distances.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {graph.nodes.map((node, idx) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-1"
                >
                  <span className="text-gray-700 font-medium">{node.label}:</span>
                  <span>
                    {distances[idx] === Infinity ? '∞' : distances[idx]}
                  </span>
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
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="blue" />
            </marker>
          </defs>

          {/* Edges */}
          {graph.edges.map((edge, i) => {
            const sourceNode = graph.nodes[edge.source];
            const targetNode = graph.nodes[edge.target];
            const highlightClass = isEdgeHighlighted(edge);
            return (
              <g key={i}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  strokeWidth="2"
                  className={`transition-all duration-300 ${highlightClass}`}
                />
                {/* Edge weight label at midpoint */}
                {(() => {
                  const { x, y } = getEdgeLabelPosition(sourceNode, targetNode);
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dy="-5"
                      className="fill-gray-700 font-semibold text-sm"
                    >
                      {edge.weight}
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* Active-edge traveler animation (a small circle) */}
          {activeEdge && getActiveEdgeMotion() && (
            <circle r="5" fill="red">
              <animateMotion
                dur={`${animationSpeed / 1000}s`}
                path={getActiveEdgeMotion()}
                fill="freeze"
                repeatCount="1"
              />
            </circle>
          )}

          {/* Nodes */}
          {graph.nodes.map((node) => {
            const isVisited = visited.has(node.id);
            const isCurrent = steps[stepIndex - 1]?.currentNode === node.id;
            const isStart = node.id === startNode;
            return (
              <g
                key={node.id}
                className="cursor-pointer"
              >
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
