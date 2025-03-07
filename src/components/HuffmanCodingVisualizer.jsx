import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, RotateCcw, Play, Pause, Plus, Minus } from 'lucide-react';

const HuffmanCodingVisualizer = () => {
  // State variables for visualization and controls
  const [inputText, setInputText] = useState('hello world');
  const [speed, setSpeed] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [frequencies, setFrequencies] = useState({});
  const [huffmanTree, setHuffmanTree] = useState(null);
  const [huffmanCodes, setHuffmanCodes] = useState({});
  const [encodedText, setEncodedText] = useState('');
  const [steps, setSteps] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [showUserGuide, setShowUserGuide] = useState(false);

  const svgRef = useRef(null);

  // Calculate the frequency of each character in the text
  const calculateFrequencies = (text) => {
    const freq = {};
    for (let char of text) {
      freq[char] = (freq[char] || 0) + 1;
    }
    return freq;
  };

  // Build the Huffman Tree from the frequency map
  const buildHuffmanTree = (freqs) => {
    let nodes = Object.keys(freqs).map(char => ({
      char,
      freq: freqs[char],
      left: null,
      right: null,
      id: Math.random().toString(36).substr(2, 9)
    }));

    // Edge-case: only one unique character
    if (nodes.length === 1) return nodes[0];

    while (nodes.length > 1) {
      // Always pick the two nodes with the lowest frequency
      nodes.sort((a, b) => a.freq - b.freq);
      const left = nodes.shift();
      const right = nodes.shift();
      const newNode = {
        char: left.char + right.char,
        freq: left.freq + right.freq,
        left,
        right,
        id: Math.random().toString(36).substr(2, 9)
      };
      nodes.push(newNode);
    }
    return nodes[0] || null;
  };

  // Generate Huffman codes by traversing the tree recursively
  const generateCodes = (node, code = '', codes = {}) => {
    if (!node) return codes;
    // If the node is a leaf, assign the accumulated code (or '0' if empty)
    if (!node.left && !node.right) {
      codes[node.char] = code || '0';
    } else {
      generateCodes(node.left, code + '0', codes);
      generateCodes(node.right, code + '1', codes);
    }
    return codes;
  };

  // Encode the input text using the generated Huffman codes
  const encodeText = (text, codes) => {
    return text.split('').map(char => codes[char]).join('');
  };

  // Simulate the tree-building process to generate visualization steps
  const simulateBuildSteps = (initialNodes) => {
    const steps = [];
    let nodes = [...initialNodes];

    // If only one node exists, simply return it as a step
    if (nodes.length === 1) {
      steps.push([...nodes]);
      return steps;
    }

    while (nodes.length > 1) {
      nodes.sort((a, b) => a.freq - b.freq);
      // Save the current state of nodes
      steps.push([...nodes]);
      const left = nodes.shift();
      const right = nodes.shift();
      const newNode = {
        char: left.char + right.char,
        freq: left.freq + right.freq,
        left,
        right,
        id: Math.random().toString(36).substr(2, 9)
      };
      nodes.push(newNode);
    }
    // Final tree state
    if (nodes.length > 0) steps.push([...nodes]);
    return steps;
  };

  // Generate all visualization steps for the algorithm
  const generateVisualizationSteps = (freqs, tree, codes, encoded) => {
    const steps = [];

    // Step 1: Display frequency table
    steps.push({
      type: 'frequency',
      data: freqs,
      description: 'Step 1: Calculate frequency of each character in the input text.'
    });

    // Step 2: Show initial leaf nodes
    const initialNodes = Object.keys(freqs).map(char => ({
      char,
      freq: freqs[char],
      left: null,
      right: null,
      id: Math.random().toString(36).substr(2, 9)
    }));
    steps.push({
      type: 'initialNodes',
      data: [...initialNodes].sort((a, b) => a.freq - b.freq),
      description: 'Step 2: Create leaf nodes for each character, sorted by frequency.'
    });

    // Step 3+: Simulate building the tree step by step
    const buildSteps = simulateBuildSteps(initialNodes);
    buildSteps.forEach((buildState, index) => {
      steps.push({
        type: 'buildTree',
        data: buildState,
        description: `Step ${index + 3}: Build Huffman tree by combining nodes.`
      });
    });

    // Penultimate step: Display the Huffman codes and complete tree
    steps.push({
      type: 'codes',
      data: { tree, codes },
      description: 'Final Step: Display the Huffman codes for each character and visualize the complete tree.'
    });

    // Final step: Show the encoded text and compression statistics
    steps.push({
      type: 'encoded',
      data: encoded,
      description: 'Final Step: Encode the text using the generated Huffman codes and display compression results.'
    });

    return steps;
  };

  // Layout the Huffman tree for SVG visualization (calculates positions for nodes and links)
  const layoutTree = (node, level = 0, position = 0, nodes = [], links = []) => {
    if (!node) return { nodes, links };

    const levelHeight = 70;
    const siblingSpacing = 50;

    // Add the current node with its position
    nodes.push({
      id: node.id,
      x: position,
      y: level * levelHeight,
      char: node.char,
      freq: node.freq,
      isLeaf: !node.left && !node.right
    });

    // Process left child (assigning a left offset)
    if (node.left) {
      const leftPosition = position - siblingSpacing * (2 ** (level / 2));
      links.push({
        source: node.id,
        target: node.left.id,
        label: '0'
      });
      layoutTree(node.left, level + 1, leftPosition, nodes, links);
    }

    // Process right child (assigning a right offset)
    if (node.right) {
      const rightPosition = position + siblingSpacing * (2 ** (level / 2));
      links.push({
        source: node.id,
        target: node.right.id,
        label: '1'
      });
      layoutTree(node.right, level + 1, rightPosition, nodes, links);
    }

    return { nodes, links };
  };

  // Reset and reinitialize the visualization based on the current input text
  const resetVisualization = () => {
    if (!inputText) return;
    const freqs = calculateFrequencies(inputText);
    setFrequencies(freqs);

    const tree = buildHuffmanTree(freqs);
    setHuffmanTree(tree);

    const codes = generateCodes(tree);
    setHuffmanCodes(codes);

    const encoded = encodeText(inputText, codes);
    setEncodedText(encoded);

    const vizSteps = generateVisualizationSteps(freqs, tree, codes, encoded);
    setSteps(vizSteps);

    setCurrentStep(0);
    setIsPlaying(false);
    setActiveNode(null);
  };

  // Animation control handlers
  const togglePlay = () => setIsPlaying(prev => !prev);
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };
  const prevStep = () => currentStep > 0 && setCurrentStep(prev => prev - 1);

  // Auto-play effect: advance steps based on speed setting
  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(nextStep, 3000 / speed);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, speed, steps.length]);

  // Recompute visualization whenever the input text changes
  useEffect(() => {
    resetVisualization();
  }, [inputText]);

  // Render the visualization for the current step
  const renderCurrentStep = () => {
    if (!steps.length || currentStep >= steps.length) return null;
    const step = steps[currentStep];

    switch (step.type) {
      case 'frequency':
        return (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-2">Frequency Table</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Character</div>
              <div className="font-semibold">Frequency</div>
              {Object.entries(step.data).map(([char, freq]) => (
                <React.Fragment key={char}>
                  <div className="bg-blue-100 p-2 rounded">{char === ' ' ? '(space)' : char}</div>
                  <div className="bg-blue-100 p-2 rounded">{freq}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      case 'initialNodes':
        return (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-2">Initial Nodes (Sorted by Frequency)</h3>
            <div className="flex flex-wrap gap-2">
              {step.data.map((node) => (
                <div key={node.id} className="bg-blue-100 p-2 rounded flex flex-col items-center">
                  <div className="font-semibold">{node.char === ' ' ? '(space)' : node.char}</div>
                  <div>{node.freq}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'buildTree':
        return (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-2">Building Huffman Tree</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {step.data.map((node) => (
                <div key={node.id} className={`p-2 rounded flex flex-col items-center ${node.left || node.right ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <div className="font-semibold">{node.char === ' ' ? '(space)' : node.char}</div>
                  <div>{node.freq}</div>
                </div>
              ))}
            </div>
            {step.data.length === 1 && (
              <div className="mt-4" ref={svgRef}>
                <TreeVisualization tree={step.data[0]} />
              </div>
            )}
          </div>
        );

      case 'codes':
        return (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-2">Huffman Codes & Tree Visualization</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="font-semibold">Character</div>
              <div className="font-semibold">Code</div>
              {Object.entries(step.data.codes).map(([char, code]) => (
                <React.Fragment key={char}>
                  <div className="bg-blue-100 p-2 rounded">{char === ' ' ? '(space)' : char}</div>
                  <div className="bg-green-100 p-2 rounded font-mono">{code}</div>
                </React.Fragment>
              ))}
            </div>
            <div className="mt-4" ref={svgRef}>
              <TreeVisualization 
                tree={step.data.tree} 
                showCodes={true} 
                codes={step.data.codes}
                onNodeHover={setActiveNode}
                activeNode={activeNode}
              />
            </div>
          </div>
        );

      case 'encoded':
        return (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-2">Encoded Text & Compression</h3>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="font-semibold mb-1">Original Text:</p>
              <p className="break-all">{inputText}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">Encoded Text:</p>
              <p className="break-all font-mono text-sm">{step.data}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Compression Results:</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>Original Size:</div>
                <div>{inputText.length * 8} bits</div>
                <div>Encoded Size:</div>
                <div>{step.data.length} bits</div>
                <div>Compression Ratio:</div>
                <div>{((1 - step.data.length / (inputText.length * 8)) * 100).toFixed(2)}%</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // SVG-based Tree Visualization Component
  const TreeVisualization = ({ tree, showCodes = false, codes = {}, onNodeHover = null, activeNode = null }) => {
    if (!tree) return null;
    const { nodes, links } = layoutTree(tree);
    const minX = Math.min(...nodes.map(n => n.x)) - 50;
    const maxX = Math.max(...nodes.map(n => n.x)) + 50;
    const minY = Math.min(...nodes.map(n => n.y)) - 20;
    const maxY = Math.max(...nodes.map(n => n.y)) + 50;
    const width = maxX - minX;
    const height = maxY - minY;
    const viewBox = `${minX} ${minY} ${width} ${height}`;

    return (
      <svg width="100%" height="300" viewBox={viewBox} className="overflow-visible">
        {links.map(link => {
          const source = nodes.find(n => n.id === link.source);
          const target = nodes.find(n => n.id === link.target);
          if (!source || !target) return null;
          return (
            <g key={`${source.id}-${target.id}`}>
              <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="#666" strokeWidth="2" />
              <text
                x={(source.x + target.x) / 2}
                y={(source.y + target.y) / 2 - 5}
                textAnchor="middle"
                fontSize="12"
                fill="#333"
                className="select-none"
              >
                {link.label}
              </text>
            </g>
          );
        })}
        {nodes.map(node => {
          const isActive = activeNode === node.id;
          const nodeColor = node.isLeaf ? "rgb(219, 234, 254)" : "rgb(220, 252, 231)";
          const strokeColor = isActive ? "#3b82f6" : "#666";
          return (
            <g 
              key={node.id}
              onMouseEnter={() => onNodeHover && onNodeHover(node.id)}
              onMouseLeave={() => onNodeHover && onNodeHover(null)}
              className="cursor-pointer"
            >
              <circle cx={node.x} cy={node.y} r="20" fill={nodeColor} stroke={strokeColor} strokeWidth={isActive ? "3" : "1"} />
              <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle" fontSize="12" className="select-none">
                {node.char === ' ' ? '␣' : (node.char.length > 3 ? '...' : node.char)}
              </text>
              <text x={node.x} y={node.y + 30} textAnchor="middle" fontSize="11" fill="#666" className="select-none">
                {node.freq}
              </text>
              {showCodes && node.isLeaf && (
                <text x={node.x} y={node.y - 25} textAnchor="middle" fontSize="10" fill="#0d6939" fontWeight="bold" className="select-none">
                  {codes[node.char] || ''}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Huffman Coding Visualizer</h1>
        <p className="opacity-90">Interactive visualization of the Huffman coding algorithm</p>
      </div>

      {/* User Guide Toggle */}
      <div className="p-4">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowUserGuide(prev => !prev)}
        >
          {showUserGuide ? 'Hide User Guide' : 'Show User Guide'}
        </button>
        {showUserGuide && (
          <div className="mt-4 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">User Guide</h2>
            <p className="mb-2">
              Enter the text you want to encode in the input area. The visualizer will compute character frequencies,
              build the Huffman tree, generate codes, and finally encode the text.
            </p>
            <ul className="list-disc ml-6">
              <li><strong>Input Text:</strong> Type any string. The visualization updates automatically.</li>
              <li><strong>Reset Button:</strong> Resets the visualization using the current text.</li>
              <li><strong>Animation Speed:</strong> Adjust the speed with the plus and minus buttons.</li>
              <li><strong>Step Navigation:</strong> Use the play/pause and navigation buttons to move through each algorithm step.</li>
              <li><strong>Visualization:</strong> Hover over tree nodes to highlight them and see code details.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar: Controls */}
        <div className="w-full md:w-64 bg-white p-4 shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Input Text</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <button
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
              onClick={resetVisualization}
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Animation Speed</label>
            <div className="flex items-center">
              <button className="p-1 rounded hover:bg-gray-100" onClick={() => setSpeed(Math.max(1, speed - 1))}>
                <Minus size={16} />
              </button>
              <div className="flex-1 mx-2 bg-gray-200 h-2 rounded">
                <div className="bg-blue-500 h-2 rounded" style={{ width: `${(speed / 5) * 100}%` }} />
              </div>
              <button className="p-1 rounded hover:bg-gray-100" onClick={() => setSpeed(Math.min(5, speed + 1))}>
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium mb-2">Algorithm Steps</h3>
            <ol className="text-sm space-y-1">
              <li className="flex items-start">
                <span className="bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">1</span>
                Calculate character frequencies
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">2</span>
                Create leaf nodes for each character
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">3</span>
                Build Huffman tree by combining nodes
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">4</span>
                Generate Huffman codes by traversing the tree
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">5</span>
                Encode the text using generated codes
              </li>
            </ol>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="mb-4 bg-white p-3 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Step {currentStep + 1} of {steps.length}
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded hover:bg-gray-100" onClick={prevStep} disabled={currentStep === 0}>
                  <ChevronRight className="rotate-180" size={20} />
                </button>
                <button className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600" onClick={togglePlay}>
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button className="p-2 rounded hover:bg-gray-100" onClick={nextStep} disabled={currentStep === steps.length - 1}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <p className="text-gray-600 mt-1">{steps[currentStep]?.description || ''}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default HuffmanCodingVisualizer;
