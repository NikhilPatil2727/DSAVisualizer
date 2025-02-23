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
    <div className="flex flex-col items-center gap-1 md:gap-2 relative">
      <div className="flex flex-col items-center">
        {/* Top connecting line */}
        <div
          className={`
            h-4 md:h-6 w-1 rounded-full transition-colors duration-300 ease-in-out
            ${traversedEdges.some(e => e.to === node.id) ? 'bg-green-500' : 'bg-gray-400'}
          `}
        />
        {/* Node circle */}
        <div
          className={`
            w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white 
            text-sm md:text-base font-bold relative z-10
            transform transition-transform duration-300 ease-in-out
            ${isCurrent ? 'bg-purple-500 scale-110 shadow-xl' : 'bg-blue-500'}
          `}
        >
          {node.value}
        </div>
        {/* Bottom connecting line */}
        <div
          className={`
            h-4 md:h-6 w-1 rounded-full transition-colors duration-300 ease-in-out
            ${
              (node.left || node.right) && traversedEdges.some(e => e.from === node.id)
                ? 'bg-green-500'
                : 'bg-gray-400'
            }
          `}
        />
      </div>

      {(node.left || node.right) && (
        <div className="flex gap-4 md:gap-8 relative">
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
              <div className="absolute top-0 left-1/2 w-4 md:w-8 -translate-x-1/2">
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
              <div className="absolute top-0 right-1/2 w-4 md:w-8 translate-x-1/2">
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

  const isPausedRef = useRef(isPaused);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  const cancelTraversalRef = useRef(false);

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
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-200">
      <header className="h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow">
        <h1 className="text-lg md:text-xl font-bold">Tree Traversal Visualizer</h1>
      </header>

      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
        {/* Left Panel */}
        <div className="w-full md:w-1/3 p-4 overflow-auto space-y-4">
          <div className="bg-white rounded-xl p-4 shadow">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Enter nodes (e.g., 1,2,3,2,5)'
              className="w-full p-2 md:p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
            />
            <select
              value={traversalType}
              onChange={(e) => setTraversalType(e.target.value)}
              className="w-full p-2 md:p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
            >
              <option value="preorder">Pre-Order</option>
              <option value="inorder">In-Order</option>
              <option value="postorder">Post-Order</option>
            </select>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBuildTree}
                disabled={isTraversing}
                className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
              >
                Build Tree
              </button>
              <button
                onClick={startTraversal}
                disabled={!tree || isTraversing}
                className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50"
              >
                Start
              </button>
              <button
                onClick={() => setIsPaused(true)}
                disabled={!tree || !isTraversing || isPaused}
                className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 disabled:opacity-50"
              >
                Pause
              </button>
              <button
                onClick={() => setIsPaused(false)}
                disabled={!tree || !isTraversing || !isPaused}
                className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
              >
                Resume
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
              >
                Reset
              </button>
            </div>
            {error && <div className="mt-3 text-center text-red-600 text-sm md:text-base">{error}</div>}
          </div>

          <div className="bg-white rounded-xl p-4 shadow">
            <h3 className="text-lg md:text-xl font-bold mb-3">Traversal Result</h3>
            {resultOrder.length > 0 ? (
              <p className="text-sm md:text-lg lg:text-xl font-semibold text-gray-800 break-all">
                {resultOrder.join(' → ')}
              </p>
            ) : (
              <p className="text-gray-500 text-sm md:text-base">No result yet.</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 shadow">
            <h3 className="text-lg md:text-xl font-bold mb-3">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-5 md:h-5 bg-purple-500 rounded-full"></div>
                <span className="text-sm md:text-base text-gray-700">Current Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-5 md:h-5 bg-blue-500 rounded-full"></div>
                <span className="text-sm md:text-base text-gray-700">Unvisited Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 md:w-5 md:h-1 bg-green-500 rounded-full"></div>
                <span className="text-sm md:text-base text-gray-700">Traversed Path</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
          <div className="w-full bg-white border border-dashed border-gray-300 rounded-xl p-2 md:p-4 shadow-lg flex items-center justify-center">
            {tree ? (
              <div className="transform scale-75 md:scale-100 transition-transform duration-300">
                <TreeNode node={tree} current={current} traversedEdges={traversedEdges} />
              </div>
            ) : (
              <div className="text-gray-500 text-sm md:text-base">
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