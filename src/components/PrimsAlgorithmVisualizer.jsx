import React, { useState, useEffect, useRef, useCallback } from 'react';

const PrimsAlgorithmVisualizer = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mstEdges, setMstEdges] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [executionTime, setExecutionTime] = useState(null);
  const svgRef = useRef(null);

  // Canvas configuration
  const CANVAS_SIZE = { width: 800, height: 600 };
  const NODE_RADIUS = 20;

  // Generate a random connected graph with circular layout
  const generateRandomGraph = useCallback(() => {
    const nodeCount = 5 + Math.floor(Math.random() * 3); // 5-7 nodes
    const newNodes = [];
    const newEdges = [];

    // Circular layout for nodes
    const angleStep = (Math.PI * 2) / nodeCount;
    const radius = Math.min(CANVAS_SIZE.width, CANVAS_SIZE.height) * 0.35;
    for (let i = 0; i < nodeCount; i++) {
      newNodes.push({
        id: i + 1,
        x: CANVAS_SIZE.width / 2 + radius * Math.cos(angleStep * i),
        y: CANVAS_SIZE.height / 2 + radius * Math.sin(angleStep * i),
        label: String.fromCharCode(65 + i)
      });
    }

    // Create minimum spanning tree first
    const shuffledNodes = [...newNodes].sort(() => Math.random() - 0.5);
    const mstNodes = [shuffledNodes[0].id];
    for (let i = 1; i < shuffledNodes.length; i++) {
      const source = shuffledNodes[Math.floor(Math.random() * i)].id;
      const target = shuffledNodes[i].id;
      const weight = Math.floor(Math.random() * 9) + 1;
      newEdges.push({
        id: `${source}-${target}`,
        source,
        target,
        weight
      });
    }

    // Add additional edges
    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        if (Math.random() < 0.3 && !newEdges.some(e => 
          (e.source === newNodes[i].id && e.target === newNodes[j].id) ||
          (e.source === newNodes[j].id && e.target === newNodes[i].id)
        )) {
          newEdges.push({
            id: `${newNodes[i].id}-${newNodes[j].id}`,
            source: newNodes[i].id,
            target: newNodes[j].id,
            weight: Math.floor(Math.random() * 9) + 1
          });
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    resetSimulation();
  }, []);

  // Prim's algorithm implementation
  const runPrimsAlgorithm = useCallback(() => {
    if (nodes.length < 2) return;

    const startTime = performance.now();
    const adjacencyList = nodes.reduce((acc, node) => {
      acc[node.id] = [];
      return acc;
    }, {});

    edges.forEach(edge => {
      adjacencyList[edge.source].push({ node: edge.target, weight: edge.weight });
      adjacencyList[edge.target].push({ node: edge.source, weight: edge.weight });
    });

    const visited = new Set([nodes[0].id]);
    const mst = [];
    const steps = [{
      type: 'initialize',
      node: nodes[0].id,
      visited: [nodes[0].id],
      mst: []
    }];

    while (visited.size < nodes.length) {
      let minEdge = null;
      let minWeight = Infinity;

      visited.forEach(source => {
        adjacencyList[source].forEach(({ node: target, weight }) => {
          if (!visited.has(target) && weight < minWeight) {
            minWeight = weight;
            minEdge = { source, target, weight };
          }
        });
      });

      if (!minEdge) break;

      visited.add(minEdge.target);
      mst.push(minEdge);
      steps.push({
        type: 'add-edge',
        edge: minEdge,
        visited: [...visited],
        mst: [...mst]
      });
    }

    setAlgorithmSteps(steps);
    setExecutionTime(performance.now() - startTime);
    setIsRunning(true);
  }, [nodes, edges]);

  // Visualization helpers
  const getEdgeCoordinates = (edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    return sourceNode && targetNode ? {
      x1: sourceNode.x,
      y1: sourceNode.y,
      x2: targetNode.x,
      y2: targetNode.y
    } : null;
  };

  const isEdgeInMST = (edge) => {
    return mstEdges.some(e =>
      (e.source === edge.source && e.target === edge.target) ||
      (e.source === edge.target && e.target === edge.source)
    );
  };

  const resetSimulation = () => {
    setMstEdges([]);
    setCurrentStep(0);
    setIsRunning(false);
    setAlgorithmSteps([]);
    setExecutionTime(null);
  };

  const updateVisualization = useCallback((step) => {
    if (step < 0 || step >= algorithmSteps.length) return;
    setCurrentStep(step);
    setMstEdges(algorithmSteps[step].mst || []);
  }, [algorithmSteps]);

  // Animation effect
  useEffect(() => {
    if (isRunning && currentStep < algorithmSteps.length - 1) {
      const timer = setTimeout(() => {
        updateVisualization(currentStep + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsRunning(false);
    }
  }, [isRunning, currentStep, algorithmSteps, speed, updateVisualization]);

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Prim's Algorithm Visualizer</h1>
        <p className="text-gray-600">Visualize minimum spanning tree construction</p>
      </header>

      <div className="flex flex-wrap gap-4 justify-center">
        <button 
          onClick={generateRandomGraph}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          New Graph
        </button>
        <button
          onClick={runPrimsAlgorithm}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          disabled={nodes.length < 2}
        >
          Start
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-4 py-2 rounded transition ${
            isRunning ? 'bg-red-500' : 'bg-yellow-500'
          } text-white`}
          disabled={!algorithmSteps.length}
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={resetSimulation}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Reset
        </button>
      </div>

      <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
        <svg 
          ref={svgRef}
          viewBox={`0 0 ${CANVAS_SIZE.width} ${CANVAS_SIZE.height}`}
          className="w-full h-96"
        >
          {edges.map(edge => {
            const coords = getEdgeCoordinates(edge);
            const inMST = isEdgeInMST(edge);
            
            return coords && (
              <g key={edge.id}>
                <line
                  {...coords}
                  stroke={inMST ? "#10b981" : "#e2e8f0"}
                  strokeWidth={inMST ? 3 : 2}
                  className="transition-all duration-300"
                />
                <text
                  x={(coords.x1 + coords.x2) / 2}
                  y={(coords.y1 + coords.y2) / 2}
                  className={`text-sm font-medium ${
                    inMST ? 'text-white' : 'text-gray-700'
                  }`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {nodes.map(node => {
            const isVisited = algorithmSteps[currentStep]?.visited?.includes(node.id);
            const isInitial = currentStep === 0 && node.id === nodes[0]?.id;

            return (
              <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                <circle
                  r={NODE_RADIUS}
                  className={`transition-colors duration-300 ${
                    isInitial ? 'fill-blue-500' : 
                    isVisited ? 'fill-green-500' : 'fill-white'
                  }`}
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                <text
                  className={`text-sm font-bold ${
                    isVisited || isInitial ? 'text-white' : 'text-gray-900'
                  }`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Controls</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="flex-1">Speed: {speed}ms</label>
              <input
                type="range"
                min="200"
                max="2000"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-48"
              />
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => updateVisualization(currentStep - 1)}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Step {currentStep + 1} of {algorithmSteps.length}
              </span>
              <button
                onClick={() => updateVisualization(currentStep + 1)}
                disabled={currentStep >= algorithmSteps.length - 1}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Progress</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Current Action:</strong> {' '}
              {algorithmSteps[currentStep]?.type?.replace('-', ' ') || 'Idle'}
            </p>
            {executionTime && (
              <p className="text-sm">
                <strong>Time:</strong> {executionTime.toFixed(2)}ms
              </p>
            )}
            {mstEdges.length > 0 && (
              <p className="text-sm">
                <strong>Total Weight:</strong> {' '}
                {mstEdges.reduce((sum, edge) => sum + edge.weight, 0)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimsAlgorithmVisualizer;