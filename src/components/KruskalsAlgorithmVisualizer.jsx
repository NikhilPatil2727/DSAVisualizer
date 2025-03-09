import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Sliders } from 'lucide-react';

// Custom priority queue for Kruskal's algorithm
class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  enqueue(element, priority) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.elements.shift();
  }
  isEmpty() {
    return this.elements.length === 0;
  }
}

// Disjoint Set (Union-Find) data structure for cycle detection
class DisjointSet {
  constructor(size) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = Array(size).fill(0);
  }
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    return true;
  }
}

const KruskalsAlgorithmVisualizer = () => {
  // Graph state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mst, setMst] = useState([]);
  // Renamed from currentEdge to activeEdge for consistency.
  const [activeEdge, setActiveEdge] = useState(null);
  
  // Visualization state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [step, setStep] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [message, setMessage] = useState("Welcome to Kruskal's Algorithm Visualizer");
  
  // UI state for adding nodes/edges
  const [addingNode, setAddingNode] = useState(false);
  const [addingEdge, setAddingEdge] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [edgeWeight, setEdgeWeight] = useState(1);
  
  // SVG and viewBox
  const svgRef = useRef(null);
  const [viewBox] = useState("0 0 600 400");

  // Initialize default graph on mount
  useEffect(() => {
    resetGraph();
  }, []);

  // Set up default graph with nodes and edges
  const resetGraph = () => {
    const defaultNodes = [
      { id: 0, x: 100, y: 100, label: 'A' },
      { id: 1, x: 200, y: 50, label: 'B' },
      { id: 2, x: 300, y: 100, label: 'C' },
      { id: 3, x: 100, y: 200, label: 'D' },
      { id: 4, x: 200, y: 250, label: 'E' },
      { id: 5, x: 300, y: 200, label: 'F' }
    ];

    const defaultEdges = [
      { id: 0, source: 0, target: 1, weight: 7 },
      { id: 1, source: 0, target: 3, weight: 5 },
      { id: 2, source: 1, target: 2, weight: 8 },
      { id: 3, source: 1, target: 3, weight: 9 },
      { id: 4, source: 1, target: 4, weight: 7 },
      { id: 5, source: 2, target: 4, weight: 5 },
      { id: 6, source: 2, target: 5, weight: 6 },
      { id: 7, source: 3, target: 4, weight: 15 },
      { id: 8, source: 4, target: 5, weight: 8 },
    ];

    setNodes(defaultNodes);
    setEdges(defaultEdges);
    setMst([]);
    setActiveEdge(null);
    setIsPlaying(false);
    setIsComplete(false);
    setStep(0);
    setTotalCost(0);
    setAlgorithmSteps([]);
    setMessage("Graph reset. Click 'Start' to visualize Kruskal's algorithm");
    setAddingNode(false);
    setAddingEdge(false);
    setSelectedNodes([]);
  };

  // Run Kruskal's algorithm and store each step for visualization
  const runKruskalsAlgorithm = () => {
    const steps = [];
    const result = [];
    let cost = 0;
    const pq = new PriorityQueue();
    edges.forEach(edge => pq.enqueue(edge, edge.weight));
    const ds = new DisjointSet(nodes.length);

    while (!pq.isEmpty() && result.length < nodes.length - 1) {
      const { element: edge } = pq.dequeue();

      steps.push({
        edge,
        mst: [...result],
        message: `Examining edge ${nodes[edge.source].label}-${nodes[edge.target].label} (weight: ${edge.weight})`
      });

      if (ds.union(edge.source, edge.target)) {
        result.push(edge);
        cost += edge.weight;
        steps.push({
          edge,
          mst: [...result],
          message: `Added edge ${nodes[edge.source].label}-${nodes[edge.target].label} to MST (weight: ${edge.weight})`
        });
      } else {
        steps.push({
          edge,
          mst: [...result],
          rejected: true,
          message: `Rejected edge ${nodes[edge.source].label}-${nodes[edge.target].label} (creates cycle)`
        });
      }
    }

    steps.push({
      edge: null,
      mst: [...result],
      message: `Kruskal's algorithm complete! Total MST cost: ${cost}`
    });

    setAlgorithmSteps(steps);
    return steps;
  };

  // Start the visualization by (re)initializing algorithm steps
  const startVisualization = () => {
    if (algorithmSteps.length === 0) {
      runKruskalsAlgorithm();
    }
    setIsPlaying(true);
    setIsComplete(false);
    setStep(0);
    setMst([]);
    setActiveEdge(null);
    setTotalCost(0);
    setMessage("Starting Kruskal's algorithm visualization...");
  };

  // Pause the animation
  const stopVisualization = () => {
    setIsPlaying(false);
  };

  // Reset only the visualization (keeping the current graph)
  const resetVisualization = () => {
    setIsPlaying(false);
    setIsComplete(false);
    setStep(0);
    setMst([]);
    setActiveEdge(null);
    setTotalCost(0);
    setMessage("Visualization reset. Click 'Start' to begin again");
  };

  // Animate the algorithm steps
  useEffect(() => {
    if (isPlaying && step < algorithmSteps.length) {
      const timer = setTimeout(() => {
        const currentStep = algorithmSteps[step];
        setActiveEdge(currentStep.edge);

        // If the edge is accepted, add it to the MST and update the cost
        if (currentStep.edge && !currentStep.rejected) {
          setMst(prevMst => {
            if (!prevMst.some(e => e.id === currentStep.edge.id)) {
              return [...prevMst, currentStep.edge];
            }
            return prevMst;
          });
          setTotalCost(prevCost => prevCost + currentStep.edge.weight);
        }

        setMessage(currentStep.message);
        const nextStep = step + 1;
        setStep(nextStep);
        if (nextStep >= algorithmSteps.length) {
          setIsPlaying(false);
          setIsComplete(true);
        }
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, step, algorithmSteps, speed]);

  // --- Adding Nodes/Edges Functionality ---
  const handleSvgClick = (e) => {
    if (!addingNode) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    const newNode = {
      id: nodes.length,
      x: svgP.x,
      y: svgP.y,
      label: String.fromCharCode(65 + (nodes.length % 26))
    };
    setNodes(prev => [...prev, newNode]);
    setMessage(`Added node ${newNode.label} at (${Math.round(svgP.x)}, ${Math.round(svgP.y)})`);
    setAddingNode(false);
  };

  const handleNodeClick = (nodeId) => {
    if (addingEdge) {
      const newSelected = [...selectedNodes];
      if (!newSelected.includes(nodeId)) {
        newSelected.push(nodeId);
        setSelectedNodes(newSelected);
        if (newSelected.length === 1) {
          setMessage(`Selected node ${nodes.find(n => n.id === nodeId).label}. Select another node to create an edge.`);
        } else if (newSelected.length === 2) {
          // Check if edge already exists between these nodes
          const exists = edges.some(edge =>
            (edge.source === newSelected[0] && edge.target === newSelected[1]) ||
            (edge.source === newSelected[1] && edge.target === newSelected[0])
          );
          if (exists) {
            setMessage("Edge already exists between these nodes.");
            setSelectedNodes([]);
            return;
          }
          const newEdge = {
            id: edges.length,
            source: newSelected[0],
            target: newSelected[1],
            weight: edgeWeight
          };
          setEdges(prev => [...prev, newEdge]);
          setMessage(`Added edge between ${nodes[newSelected[0]].label} and ${nodes[newSelected[1]].label} (weight: ${edgeWeight})`);
          setSelectedNodes([]);
          setAddingEdge(false);
        }
      }
    }
  };

  // Helper functions for edge styling
  const isEdgeActive = (edge) => {
    return (
      activeEdge &&
      ((edge.source === activeEdge.source && edge.target === activeEdge.target) ||
       (edge.source === activeEdge.target && edge.target === activeEdge.source))
    );
  };

  const getEdgeStatus = (edge) => {
    if (mst.some(e => e.id === edge.id)) return 'included';
    if (activeEdge && activeEdge.id === edge.id && algorithmSteps[step - 1]?.rejected) return 'rejected';
    if (activeEdge && activeEdge.id === edge.id) return 'considering';
    return 'normal';
  };

  const getEdgeColor = (status) => {
    switch (status) {
      case 'included': return 'text-green-500 stroke-green-500';
      case 'rejected': return 'text-red-500 stroke-red-500';
      case 'considering': return 'text-yellow-500 stroke-yellow-500';
      default: return 'text-gray-400 stroke-gray-400';
    }
  };

  const getEdgeAnimation = (status) => {
    switch (status) {
      case 'included': return 'animate-pulse';
      case 'rejected': return 'animate-bounce';
      case 'considering': return 'animate-pulse';
      default: return '';
    }
  };

  const getEdgeLabelPosition = (sourceNode, targetNode) => {
    const mx = (sourceNode.x + targetNode.x) / 2;
    const my = (sourceNode.y + targetNode.y) / 2;
    return { x: mx, y: my };
  };

  const getActiveEdgeMotion = () => {
    if (!activeEdge) return null;
    const sourceActive = nodes.find(n => n.id === activeEdge.source);
    const targetActive = nodes.find(n => n.id === activeEdge.target);
    if (!sourceActive || !targetActive) return null;
    const pathStr = `M ${sourceActive.x} ${sourceActive.y} L ${targetActive.x} ${targetActive.y}`;
    return pathStr;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">Kruskal's Algorithm Visualizer</h1>
      
      {/* Controls Panel */}
      <div className="w-full flex flex-wrap justify-center gap-4 mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-2">
          <button
            onClick={startVisualization}
            disabled={isPlaying}
            className={`flex items-center gap-1 px-4 py-2 rounded ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          >
            <Play size={16} /> Start
          </button>
          <button
            onClick={stopVisualization}
            disabled={!isPlaying}
            className={`flex items-center gap-1 px-4 py-2 rounded ${!isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
          >
            <Pause size={16} /> Pause
          </button>
          <button
            onClick={resetVisualization}
            className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={resetGraph}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
          >
            Reset Graph
          </button>
          <button
            onClick={() => {
              setAddingNode(true);
              setAddingEdge(false);
              setSelectedNodes([]);
              setMessage('Click on the canvas to add a node');
            }}
            className={`flex items-center gap-1 px-4 py-2 rounded ${addingNode ? 'bg-purple-600 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
          >
            <Plus size={16} /> Add Node
          </button>
          <button
            onClick={() => {
              setAddingEdge(true);
              setAddingNode(false);
              setSelectedNodes([]);
              setMessage('Select two nodes to create an edge');
            }}
            className={`flex items-center gap-1 px-4 py-2 rounded ${addingEdge ? 'bg-blue-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            <Plus size={16} /> Add Edge
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <Sliders size={16} />
            <span>Speed:</span>
            <input
              type="range"
              min={100}
              max={2000}
              step={100}
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-32"
            />
          </label>
        </div>
        
        {addingEdge && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <span>Edge Weight:</span>
              <input
                type="number"
                min={1}
                value={edgeWeight}
                onChange={e => setEdgeWeight(Number(e.target.value))}
                className="w-16 p-1 border rounded"
              />
            </label>
          </div>
        )}
      </div>
      
      {/* Algorithm Status */}
      <div className="w-full bg-white p-4 mb-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-semibold">Step:</span> {step}/{algorithmSteps.length}
          </div>
          <div>
            <span className="font-semibold">MST Cost:</span> {totalCost}
          </div>
        </div>
        <div className="p-3 bg-gray-100 rounded-lg min-h-12">
          <p className="text-gray-800">{message}</p>
        </div>
      </div>
      
      {/* Graph Visualization */}
      <div className="w-full bg-white p-4 rounded-lg shadow overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-96 border border-gray-200 rounded cursor-pointer"
          onClick={handleSvgClick}
        >
          <g>
            {/* Render edges */}
            {edges.map(edge => {
              const sourceNode = nodes[edge.source];
              const targetNode = nodes[edge.target];
              const status = getEdgeStatus(edge);
              const edgeColor = getEdgeColor(status);
              const edgeAnimation = getEdgeAnimation(status);
              return (
                <g key={`edge-${edge.id}`} className={`${edgeColor} ${edgeAnimation}`}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    strokeWidth={status === 'included' ? 3 : 2}
                    className="transition-all duration-300"
                  />
                  <rect
                    x={(sourceNode.x + targetNode.x) / 2 - 10}
                    y={(sourceNode.y + targetNode.y) / 2 - 10}
                    width="20"
                    height="20"
                    rx="4"
                    fill="white"
                    stroke="currentColor"
                  />
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2 + 5}
                    textAnchor="middle"
                    className="text-xs font-bold fill-current"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}
  
            {/* Animated traversal indicator on active edge */}
            {activeEdge && getActiveEdgeMotion() && (
              <circle r="5" fill="red">
                <animateMotion 
                  dur={`${speed / 1000}s`} 
                  path={getActiveEdgeMotion()} 
                  fill="freeze" 
                  repeatCount="1" 
                />
              </circle>
            )}
  
            {/* Render nodes */}
            {nodes.map(node => {
              const isSelected = selectedNodes.includes(node.id);
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
                    className={`${isSelected ? 'fill-blue-500' : 'fill-indigo-500'} stroke-white stroke-2 transition-all`}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    className="text-white font-bold"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-4 mt-6">
        <button
          onClick={startVisualization}
          disabled={isPlaying}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isPlaying ? 'Running...' : 'Start'}
        </button>
        <button
          onClick={stopVisualization}
          disabled={!isPlaying}
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50"
        >
          Pause
        </button>
        <button
          onClick={resetVisualization}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={resetGraph}
          className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
        >
          Reset Graph
        </button>
      </div>
      
      {/* Algorithm Info Panel */}
      <div className="w-full bg-white p-4 mt-6 rounded-lg shadow">
        <div className="mb-2">
          <h2 className="text-xl font-bold text-indigo-700">Kruskal's Algorithm</h2>
          <p className="text-gray-700 mt-2">
            Kruskal's algorithm finds a minimum spanning tree (MST) for a connected weighted graph by selecting the smallest edges while avoiding cycles.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <h3 className="font-semibold">Legend</h3>
            <div className="flex items-center mt-2">
              <div className="w-4 h-4 bg-gray-400 mr-2"></div>
              <span>Regular Edge</span>
            </div>
            <div className="flex items-center mt-1">
              <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
              <span>Currently Considering</span>
            </div>
            <div className="flex items-center mt-1">
              <div className="w-4 h-4 bg-green-500 mr-2"></div>
              <span>Included in MST</span>
            </div>
            <div className="flex items-center mt-1">
              <div className="w-4 h-4 bg-red-500 mr-2"></div>
              <span>Rejected (Cycle)</span>
            </div>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <h3 className="font-semibold">Time Complexity</h3>
            <p className="mt-1">O(E log E) or O(E log V)</p>
            <p className="text-sm text-gray-600 mt-1">
              E = number of edges<br />
              V = number of vertices
            </p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <h3 className="font-semibold">Space Complexity</h3>
            <p className="mt-1">O(V + E)</p>
            <p className="text-sm text-gray-600 mt-1">
              Space for disjoint-set and edge storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KruskalsAlgorithmVisualizer;
