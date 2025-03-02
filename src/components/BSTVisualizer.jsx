import React, { useState, useCallback, useRef, useEffect } from 'react';

// Helper functions for BST operations
const getAllNodeIds = (root) => {
  const ids = [];
  const traverse = (node) => {
    if (node) {
      ids.push(node.id);
      traverse(node.left);
      traverse(node.right);
    }
  };
  traverse(root);
  return ids.length ? ids : [0]; // Return [0] if tree is empty to avoid errors
};

const getTreeHeight = (root) => {
  if (!root) return 0;
  return 1 + Math.max(getTreeHeight(root.left), getTreeHeight(root.right));
};

const getTreeWidth = (root) => {
  if (!root) return 0;
  return 1 + getTreeWidth(root.left) + getTreeWidth(root.right);
};

const insertNode = (root, value, id) => {
  if (!root) return { id, value, left: null, right: null };
  if (value < root.value) {
    return { ...root, left: insertNode(root.left, value, id) };
  }
  return { ...root, right: insertNode(root.right, value, id) };
};

const findNode = (root, value) => {
  let current = root;
  while (current) {
    if (value === current.value) return current;
    current = value < current.value ? current.left : current.right;
  }
  return null;
};

const deleteNode = (root, value) => {
  if (!root) return null;
  
  if (value < root.value) {
    return { ...root, left: deleteNode(root.left, value) };
  }
  if (value > root.value) {
    return { ...root, right: deleteNode(root.right, value) };
  }

  if (!root.left) return root.right;
  if (!root.right) return root.left;

  let successor = root.right;
  while (successor.left) successor = successor.left;
  return {
    ...root,
    value: successor.value,
    right: deleteNode(root.right, successor.value)
  };
};

// Tree visualization component
const TreeNode = ({ node, current, traversedEdges, scaleFactor }) => {
  if (!node) return null;

  const isCurrent = current === node.id;
  
  // Dynamic sizing based on scaleFactor
  const nodeSize = Math.max(8, Math.min(12, 12 * scaleFactor));
  const edgeLength = Math.max(3, Math.min(6, 6 * scaleFactor));
  const horizontalGap = Math.max(2, Math.min(8, 8 * scaleFactor));

  return (
    <div className="flex flex-col items-center relative">
      <div className="flex flex-col items-center">
        <div className={`h-${edgeLength} w-0.5 rounded-full ${
          traversedEdges.some(e => e.to === node.id) ? 'bg-green-500' : 'bg-gray-300'
        }`} />
        <div className={`w-${nodeSize} h-${nodeSize} rounded-full flex items-center justify-center 
          text-white text-xs sm:text-sm font-bold relative z-10 transition-all duration-300
          ${isCurrent ? 'bg-purple-500 scale-110 shadow-lg' : 'bg-blue-500'}`}
          style={{
            minWidth: `${nodeSize * 0.25}rem`,
            minHeight: `${nodeSize * 0.25}rem`
          }}
        >
          {node.value}
        </div>
        <div className={`h-${edgeLength} w-0.5 rounded-full ${
          (node.left || node.right) && traversedEdges.some(e => e.from === node.id) 
            ? 'bg-green-500' 
            : 'bg-gray-300'
        }`} />
      </div>

      {(node.left || node.right) && (
        <div className={`flex gap-${horizontalGap} relative`}>
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-full bg-gray-300" />
          <div className="relative">
            {node.left && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2">
                <div className={`w-full h-0.5 rounded-full ${
                  traversedEdges.some(e => e.from === node.id && e.to === node.left.id)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`} 
                style={{ width: `${horizontalGap * 0.25}rem` }}
                />
              </div>
            )}
            <TreeNode 
              node={node.left} 
              current={current} 
              traversedEdges={traversedEdges} 
              scaleFactor={scaleFactor} 
            />
          </div>
          <div className="relative">
            {node.right && (
              <div className="absolute top-0 right-1/2 translate-x-1/2">
                <div className={`w-full h-0.5 rounded-full ${
                  traversedEdges.some(e => e.from === node.id && e.to === node.right.id)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`} 
                style={{ width: `${horizontalGap * 0.25}rem` }}
                />
              </div>
            )}
            <TreeNode 
              node={node.right} 
              current={current} 
              traversedEdges={traversedEdges} 
              scaleFactor={scaleFactor} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const TreeVisualization = ({ tree, current, traversedEdges }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!tree) return;
    
    // Calculate appropriate scale based on tree size
    const treeHeight = getTreeHeight(tree);
    const treeWidth = getTreeWidth(tree);
    const maxNodes = Math.pow(2, treeHeight) - 1;
    
    // Adjust scale factor based on tree size
    const newScaleFactor = Math.max(0.5, Math.min(1, 10 / Math.max(treeHeight, treeWidth / 2)));
    setScaleFactor(newScaleFactor);
    
    // Default scale for the container
    setScale(newScaleFactor);
    setZoom(newScaleFactor * 100);
  }, [tree]);

  const handleZoomChange = (e) => {
    const newZoom = parseInt(e.target.value);
    setZoom(newZoom);
    setScale(newZoom / 100);
  };

  if (!tree) {
    return <div className="text-gray-500">Build a tree to start</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-2 justify-between">
        <span className="text-sm text-gray-600">Zoom: {zoom}%</span>
        <input 
          type="range" 
          min="50" 
          max="150" 
          value={zoom} 
          onChange={handleZoomChange}
          className="w-32 md:w-48"
        />
      </div>

      <div className="overflow-auto flex-grow border rounded bg-gray-50 p-2" style={{ maxHeight: '60vh' }}>
        <div ref={containerRef} className="min-w-full min-h-full flex items-center justify-center">
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}>
            <TreeNode 
              node={tree} 
              current={current} 
              traversedEdges={traversedEdges}
              scaleFactor={scaleFactor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const BSTVisualizer = () => {
  const [inputValue, setInputValue] = useState('50,30,70,20,40,60,80');
  const [tree, setTree] = useState(null);
  const [current, setCurrent] = useState(null);
  const [operation, setOperation] = useState(null);
  const [traversedEdges, setTraversedEdges] = useState([]);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState([]);
  const [speed, setSpeed] = useState(1000);

  const isOperating = useRef(false);
  const cancelOperation = useRef(false);

  const buildTree = () => {
    try {
      const values = inputValue.split(',').map(v => {
        const num = parseInt(v.trim(), 10);
        if (isNaN(num)) throw new Error('Invalid number');
        return num;
      });
      
      let root = null;
      let id = 1;
      values.forEach(val => {
        root = insertNode(root, val, id++);
      });
      
      setTree(root);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const visualizeOperation = useCallback(async (op, val) => {
    if (!tree || isOperating.current) return;
    
    isOperating.current = true;
    cancelOperation.current = false;
    setTraversedEdges([]);
    setResult([]);
    setError('');
    setOperation(op);

    try {
      if (isNaN(parseInt(val))) {
        throw new Error('Please enter a valid number');
      }

      let currentNode = tree;
      const path = [];
      const edges = [];
      let found = false;

      // Traverse to find node
      while (currentNode && !cancelOperation.current) {
        path.push(currentNode);
        setCurrent(currentNode.id);
        await new Promise(r => setTimeout(r, speed));

        if (currentNode.value === val) {
          found = true;
          break;
        }

        const nextNode = val < currentNode.value ? currentNode.left : currentNode.right;
        if (nextNode) {
          edges.push({ from: currentNode.id, to: nextNode.id });
          setTraversedEdges(prev => [...prev, { from: currentNode.id, to: nextNode.id }]);
        }
        currentNode = nextNode;
      }

      if (op === 'search') {
        setCurrent(null);
        setResult(found ? ['Found!'] : ['Not found']);
        await new Promise(r => setTimeout(r, speed));
      } 
      else if (op === 'insert' && !found) {
        const newId = Math.max(...getAllNodeIds(tree)) + 1;
        setTree(prev => insertNode(prev, val, newId));
        setCurrent(newId);
        setResult(['Inserted!']);
        await new Promise(r => setTimeout(r, speed));
      }
      else if (op === 'insert' && found) {
        setResult(['Node already exists!']);
        await new Promise(r => setTimeout(r, speed));
      }
      else if (op === 'delete' && found) {
        setTree(prev => deleteNode(prev, val));
        setCurrent(null);
        setResult(['Deleted!']);
        await new Promise(r => setTimeout(r, speed));
      }
      else if (op === 'delete' && !found) {
        setResult(['Node not found!']);
        await new Promise(r => setTimeout(r, speed));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCurrent(null);
      setOperation(null);
      isOperating.current = false;
    }
  }, [tree, speed]);

  const cancelCurrentOperation = () => {
    if (isOperating.current) {
      cancelOperation.current = true;
      setCurrent(null);
      setTraversedEdges([]);
      setResult(['Operation cancelled']);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-xl font-bold">BST Operations Visualizer</h1>
      </header>

      <div className="p-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tree Nodes (comma separated)</label>
                <div className="flex">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-grow p-2 border rounded-l focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter comma-separated values"
                  />
                  <button
                    onClick={buildTree}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r font-medium transition"
                  >
                    Build Tree
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Operation Settings</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Value</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter a value"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Animation Speed</label>
                    <div className="flex items-center">
                      <span className="text-xs mr-2">Fast</span>
                      <input 
                        type="range" 
                        min="200" 
                        max="2000" 
                        step="100"
                        value={speed} 
                        onChange={(e) => setSpeed(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-xs ml-2">Slow</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <button
                    onClick={() => visualizeOperation('insert', parseInt(value))}
                    disabled={isOperating.current}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded font-medium flex items-center justify-center gap-1 disabled:opacity-50 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Insert
                  </button>
                  <button
                    onClick={() => visualizeOperation('search', parseInt(value))}
                    disabled={isOperating.current}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded font-medium flex items-center justify-center gap-1 disabled:opacity-50 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </button>
                  <button
                    onClick={() => visualizeOperation('delete', parseInt(value))}
                    disabled={isOperating.current}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded font-medium flex items-center justify-center gap-1 disabled:opacity-50 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Delete
                  </button>
                </div>

                {isOperating.current && (
                  <button
                    onClick={cancelCurrentOperation}
                    className="mt-2 w-full bg-gray-600 hover:bg-gray-700 text-white p-2 rounded font-medium transition"
                  >
                    Cancel Operation
                  </button>
                )}
              </div>

              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              {result.length > 0 && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 rounded">
                  <p className="text-sm font-medium">{result.join(' ')}</p>
                </div>
              )}

              {operation && (
                <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-3 rounded">
                  <p className="text-sm font-medium">
                    {operation === 'search' ? 'Searching...' : 
                     operation === 'insert' ? 'Inserting...' : 
                     'Deleting...'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tree Visualization */}
          <div className="bg-white p-6 rounded-lg shadow flex flex-col justify-start">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Binary Search Tree Visualization</h2>
            <div className="flex-grow">
              <TreeVisualization 
                tree={tree} 
                current={current} 
                traversedEdges={traversedEdges} 
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h3 className="text-md font-medium text-gray-800 mb-2">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm">Regular Node</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
              <span className="text-sm">Current Node</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 mr-2"></div>
              <span className="text-sm">Untraveled Path</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 mr-2"></div>
              <span className="text-sm">Traversed Path</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BSTVisualizer;