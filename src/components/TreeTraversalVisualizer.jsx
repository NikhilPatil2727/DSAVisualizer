import React, { useState, useCallback, useRef, useEffect } from 'react';

// Helper function to construct a binary tree from a level-order array with unique IDs
const buildTree = (nodes) => {
  if (!nodes || nodes.length === 0 || nodes[0] === null) return null;

  let idCounter = 1;
  const root = { id: idCounter++, value: nodes[0], left: null, right: null };
  const queue = [root];
  let i = 1;

  while (i < nodes.length) {
    const current = queue.shift();
    if (!current) continue;

    // Process left child
    if (i < nodes.length && nodes[i] !== null) {
      const newNode = { id: idCounter++, value: nodes[i], left: null, right: null };
      current.left = newNode;
      queue.push(newNode);
    }
    i++;

    // Process right child
    if (i < nodes.length && nodes[i] !== null) {
      const newNode = { id: idCounter++, value: nodes[i], left: null, right: null };
      current.right = newNode;
      queue.push(newNode);
    }
    i++;
  }
  return root;
};

// Recursive component to render tree nodes with connecting edges
const TreeNode = ({ node, current, traversedEdges }) => {
  if (!node) return null;

  const isCurrent = current === node.id;

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 relative">
      <div className="flex flex-col items-center">
        {/* Top connecting line */}
        <div
          className={`
            h-3 sm:h-4 md:h-5 lg:h-6 w-1 rounded-full transition-colors duration-300 ease-in-out
            ${traversedEdges.some(e => e.to === node.id) ? 'bg-green-500' : 'bg-gray-400'}
          `}
        />
        {/* Node circle */}
        <div
          className={`
            w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white
            text-xs sm:text-sm md:text-base lg:text-lg font-bold relative z-10
            transform transition-transform duration-300 ease-in-out
            ${isCurrent ? 'bg-purple-500 scale-110 shadow-xl' : 'bg-blue-500'}
          `}
        >
          {node.value}
        </div>
        {/* Bottom connecting line */}
        <div
          className={`
            h-3 sm:h-4 md:h-5 lg:h-6 w-1 rounded-full transition-colors duration-300 ease-in-out
            ${(node.left || node.right) && traversedEdges.some(e => e.from === node.id)
              ? 'bg-green-500'
              : 'bg-gray-400'}
          `}
        />
      </div>

      {(node.left || node.right) && (
        <div className="flex gap-2 sm:gap-3 md:gap-6 lg:gap-8 relative">
          {/* Horizontal connecting line across children */}
          <div
            className={`
              absolute top-0 left-0 right-0 h-1 rounded-full transition-colors duration-300 ease-in-out
              ${traversedEdges.some(e => e.from === node.id) ? 'bg-green-500' : 'bg-gray-400'}
            `}
          />
          {/* Left child */}
          <div className="relative">
            {node.left && (
              <div className="absolute top-0 left-1/2 w-2 sm:w-3 md:w-6 lg:w-8 -translate-x-1/2">
                <div
                  className={`
                    w-full h-1 rounded-full transition-colors duration-300 ease-in-out
                    ${
                      traversedEdges.some(e => e.from === node.id && e.to === node.left.id)
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    }
                  `}
                />
              </div>
            )}
            <TreeNode node={node.left} current={current} traversedEdges={traversedEdges} />
          </div>
          {/* Right child */}
          <div className="relative">
            {node.right && (
              <div className="absolute top-0 right-1/2 w-2 sm:w-3 md:w-6 lg:w-8 translate-x-1/2">
                <div
                  className={`
                    w-full h-1 rounded-full transition-colors duration-300 ease-in-out
                    ${
                      traversedEdges.some(e => e.from === node.id && e.to === node.right.id)
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    }
                  `}
                />
              </div>
            )}
            <TreeNode node={node.right} current={current} traversedEdges={traversedEdges} />
          </div>
        </div>
      )}
    </div>
  );
};

const TreeTraversalVisualizer = () => {
  const [inputValue, setInputValue] = useState('1,2,3,2,5,6');
  const [tree, setTree] = useState(null);
  const [current, setCurrent] = useState(null);
  const [isTraversing, setIsTraversing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [resultOrder, setResultOrder] = useState([]);
  const [traversedEdges, setTraversedEdges] = useState([]);
  const [error, setError] = useState('');
  const [traversalType, setTraversalType] = useState('preorder');
  const [zoom, setZoom] = useState(100);

  const isPausedRef = useRef(isPaused);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  const cancelTraversalRef = useRef(false);
  
  // Handle resize observation
  const treeContainerRef = useRef(null);
  
  useEffect(() => {
    if (!tree || !treeContainerRef.current) return;
    
    // Automatic zoom adjustment based on tree size and container
    const adjustZoom = () => {
      const container = treeContainerRef.current;
      if (!container) return;
      
      // Calculate a reasonable zoom based on the depth of the tree
      const getTreeDepth = (node) => {
        if (!node) return 0;
        return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
      };
      
      const treeDepth = getTreeDepth(tree);
      const containerWidth = container.clientWidth;
      
      // Calculate zoom based on tree depth and container width
      // The wider the tree, the lower the zoom percentage
      let newZoom = 100;
      if (treeDepth > 3) {
        // Larger trees need smaller zoom on smaller screens
        if (containerWidth < 640) { // Small screens
          newZoom = Math.max(60, 100 - (treeDepth - 3) * 15);
        } else if (containerWidth < 768) { // Medium screens
          newZoom = Math.max(70, 100 - (treeDepth - 3) * 10);
        } else if (containerWidth < 1024) { // Large screens
          newZoom = Math.max(80, 100 - (treeDepth - 3) * 5);
        }
      }
      
      setZoom(newZoom);
    };
    
    // Create a resize observer
    const resizeObserver = new ResizeObserver(adjustZoom);
    resizeObserver.observe(treeContainerRef.current);
    
    // Initial adjustment
    adjustZoom();
    
    return () => {
      if (treeContainerRef.current) {
        resizeObserver.unobserve(treeContainerRef.current);
      }
    };
  }, [tree]);

  const handleBuildTree = () => {
    try {
      const nodes = inputValue
        .split(',')
        .map(s => s.trim())
        .map(s => {
          if (s.toLowerCase() === 'null') return null;
          const num = parseInt(s, 10);
          if (isNaN(num)) throw new Error(`Invalid node value: ${s}`);
          return num;
        });
      if (nodes[0] === null) throw new Error('Root node cannot be null');
      setTree(buildTree(nodes));
      setCurrent(null);
      setResultOrder([]);
      setTraversedEdges([]);
      setError('');
      cancelTraversalRef.current = false;
    } catch (err) {
      setError(err.message);
    }
  };

  const computePreOrder = (node, order = []) => {
    if (!node) return;
    order.push(node);
    computePreOrder(node.left, order);
    computePreOrder(node.right, order);
    return order;
  };

  const computeInOrder = (node, order = []) => {
    if (!node) return;
    computeInOrder(node.left, order);
    order.push(node);
    computeInOrder(node.right, order);
    return order;
  };

  const computePostOrder = (node, order = []) => {
    if (!node) return;
    computePostOrder(node.left, order);
    computePostOrder(node.right, order);
    order.push(node);
    return order;
  };

  const computeEdges = (node, parent, edges = []) => {
    if (!node) return;
    if (parent) edges.push({ from: parent.id, to: node.id });
    computeEdges(node.left, node, edges);
    computeEdges(node.right, node, edges);
    return edges;
  };

  const startTraversal = useCallback(async () => {
    if (!tree || isTraversing) return;
    setIsTraversing(true);
    setCurrent(null);
    setResultOrder([]);
    setTraversedEdges([]);
    cancelTraversalRef.current = false;

    let traversalOrder = [];
    if (traversalType === 'preorder') {
      traversalOrder = computePreOrder(tree);
    } else if (traversalType === 'inorder') {
      traversalOrder = computeInOrder(tree);
    } else if (traversalType === 'postorder') {
      traversalOrder = computePostOrder(tree);
    }
    const edges = computeEdges(tree, null);
    for (const node of traversalOrder) {
      if (cancelTraversalRef.current) {
        setIsTraversing(false);
        setIsPaused(false);
        return;
      }
      while (isPausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (cancelTraversalRef.current) {
          setIsTraversing(false);
          setIsPaused(false);
          return;
        }
      }
      setCurrent(node.id);
      setResultOrder(prev => [...prev, node.value]);
      setTraversedEdges(prev => [
        ...prev,
        ...edges.filter(
          e => e.to === node.id && !prev.some(pe => pe.from === e.from && pe.to === e.to)
        ),
      ]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrent(null);
    }
    setIsTraversing(false);
    setIsPaused(false);
  }, [tree, isTraversing, traversalType]);

  const handleReset = () => {
    cancelTraversalRef.current = true;
    setTree(null);
    setCurrent(null);
    setResultOrder([]);
    setTraversedEdges([]);
    setIsTraversing(false);
    setIsPaused(false);
    setError('');
    setZoom(100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-200">
      <header className="h-12 sm:h-14 md:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow">
        <h1 className="text-base sm:text-lg md:text-xl font-bold">Tree Traversal Visualizer</h1>
      </header>

      <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
        {/* Left Panel */}
        <div className="w-full lg:w-1/3 p-2 sm:p-3 md:p-4 overflow-auto space-y-3 md:space-y-4">
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter nodes (e.g., 1,2,3,2,5)"
              className="w-full p-2 md:p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3 md:mb-4 text-sm md:text-base"
            />
            <select
              value={traversalType}
              onChange={(e) => setTraversalType(e.target.value)}
              className="w-full p-2 md:p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3 md:mb-4 text-sm md:text-base"
            >
              <option value="preorder">Pre-Order</option>
              <option value="inorder">In-Order</option>
              <option value="postorder">Post-Order</option>
            </select>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                onClick={handleBuildTree}
                disabled={isTraversing}
                className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm md:text-base bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
              >
                Build Tree
              </button>
              <button
                onClick={startTraversal}
                disabled={!tree || isTraversing}
                className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm md:text-base bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50"
              >
                Start
              </button>
              <button
                onClick={() => setIsPaused(true)}
                disabled={!tree || !isTraversing || isPaused}
                className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm md:text-base bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 disabled:opacity-50"
              >
                Pause
              </button>
              <button
                onClick={() => setIsPaused(false)}
                disabled={!tree || !isTraversing || !isPaused}
                className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm md:text-base bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
              >
                Resume
              </button>
              <button
                onClick={handleReset}
                className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm md:text-base bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
              >
                Reset
              </button>
            </div>
            {error && <div className="mt-3 text-center text-red-600 text-xs sm:text-sm md:text-base">{error}</div>}
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 shadow">
            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 md:mb-3">Traversal Result</h3>
            <div className="overflow-x-auto">
              {resultOrder.length > 0 ? (
                <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-800 whitespace-nowrap">
                  {resultOrder.join(' → ')}
                </p>
              ) : (
                <p className="text-gray-500 text-xs sm:text-sm md:text-base">No result yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 shadow">
            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 md:mb-3">Legend</h3>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-purple-500 rounded-full"></div>
                <span className="text-xs sm:text-sm md:text-base text-gray-700">Current Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-blue-500 rounded-full"></div>
                <span className="text-xs sm:text-sm md:text-base text-gray-700">Unvisited Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 sm:w-4 sm:h-1 md:w-5 md:h-1 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm md:text-base text-gray-700">Traversed Path</span>
              </div>
            </div>
          </div>
          
          {/* Zoom controls for tree view */}
          {tree && (
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow">
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 md:mb-3">Tree Zoom</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setZoom(prev => Math.max(40, prev - 10))}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  -
                </button>
                <input
                  type="range"
                  min="40"
                  max="150"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
                <button 
                  onClick={() => setZoom(prev => Math.min(150, prev + 10))}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  +
                </button>
                <span className="text-xs sm:text-sm md:text-base text-gray-700">{zoom}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Responsive Tree Section */}
        <div className="flex-1 p-2 sm:p-3 md:p-4 overflow-auto flex flex-col">
          <div 
            ref={treeContainerRef}
            className="w-full h-full bg-white border border-dashed border-gray-300 rounded-xl p-2 sm:p-3 md:p-4 shadow-lg flex items-center justify-center overflow-auto"
          >
            {tree ? (
              <div className="overflow-auto w-full h-full flex items-center justify-center">
                <div 
                  style={{ transform: `scale(${zoom / 100})` }}
                  className="transition-transform duration-300 origin-center"
                >
                  <TreeNode node={tree} current={current} traversedEdges={traversedEdges} />
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-xs sm:text-sm md:text-base">
                Build a tree to visualize traversal.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeTraversalVisualizer;