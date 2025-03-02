import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Sorting algorithm metadata and functions
const sortingAlgorithms = [
  { 
    name: 'Bubble Sort', 
    func: bubbleSort, 
    best: 'O(n)', 
    worst: 'O(n²)',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'
  },
  { 
    name: 'Selection Sort', 
    func: selectionSort, 
    best: 'O(n²)', 
    worst: 'O(n²)',
    description: 'Finds the minimum element from the unsorted part and puts it at the beginning.'
  },
  { 
    name: 'Insertion Sort', 
    func: insertionSort, 
    best: 'O(n)', 
    worst: 'O(n²)',
    description: 'Builds the sorted array one item at a time by comparing each with the items before it.'
  },
  { 
    name: 'Merge Sort', 
    func: mergeSort, 
    best: 'O(n log n)', 
    worst: 'O(n log n)',
    description: 'Divides input array into two halves, recursively sorts them, and then merges the sorted halves.'
  },
  { 
    name: 'Quick Sort', 
    func: quickSort, 
    best: 'O(n log n)', 
    worst: 'O(n²)',
    description: 'Picks a pivot element and partitions the array around it, recursively sorting the partitions.'
  },
];

const AlgorithmRace = () => {
  const [array, setArray] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [raceStatus, setRaceStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState({});
  const [history, setHistory] = useState([]);
  const [visualizationMode, setVisualizationMode] = useState('race'); // 'race' or 'step-by-step'
  const [currentAlgorithm, setCurrentAlgorithm] = useState(null);
  const [showExplanations, setShowExplanations] = useState(true);
  const [speed, setSpeed] = useState(1); // Animation speed multiplier

  // Initialize progress for each algorithm
  useEffect(() => {
    const initialProgress = sortingAlgorithms.reduce((acc, algo) => {
      acc[algo.name] = { progress: 0, time: 0, currentStep: null };
      return acc;
    }, {});
    setProgress(initialProgress);
  }, []);

  // Helper: Format time nicely (ms or s)
  const formatTime = (time) => {
    return time < 1000 ? `${time.toFixed(2)}ms` : `${(time / 1000).toFixed(2)}s`;
  };

  // Clear all progress and state
  const handleClear = () => {
    setArray([]);
    setCustomInput('');
    setInputError('');
    setProgress({});
    setResults([]);
    setRaceStatus('idle');
  };

  // Parse custom input into an array of numbers with error handling
  const handleCustomInputChange = (e) => {
    const input = e.target.value;
    setCustomInput(input);

    if (input.trim() === '') {
      setArray([]);
      setInputError('');
      return;
    }

    try {
      const parsedArray = input.split(',').map(num => {
        const parsed = parseInt(num.trim(), 10);
        if (isNaN(parsed)) {
          throw new Error();
        }
        return parsed;
      });
      setArray(parsedArray);
      setInputError('');
    } catch {
      setInputError('Invalid input. Please enter a comma-separated list of numbers.');
      setArray([]);
    }
  };

  const startRace = async () => {
    if (array.length === 0) {
      alert("Please provide a valid custom input (comma-separated numbers).");
      return;
    }

    setRaceStatus('running');
    const arr = [...array];
    
    if (visualizationMode === 'race') {
      const raceResults = await Promise.all(
        sortingAlgorithms.map(async (algo) => {
          const startTime = performance.now();
          await algo.func([...arr], (p, currentStep) => {
            setProgress(prev => ({
              ...prev,
              [algo.name]: { 
                progress: p, 
                time: performance.now() - startTime,
                currentStep
              }
            }));
          }, speed);
          const endTime = performance.now();
          return { 
            name: algo.name, 
            time: endTime - startTime,
            best: algo.best,
            worst: algo.worst,
            description: algo.description
          };
        })
      );

      setResults(raceResults.sort((a, b) => a.time - b.time));
      setHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        arraySize: arr.length,
        results: raceResults
      }]);
      setRaceStatus('completed');
    } else if (visualizationMode === 'step-by-step' && currentAlgorithm) {
      const algo = sortingAlgorithms.find(a => a.name === currentAlgorithm);
      const startTime = performance.now();
      
      await algo.func([...arr], (p, currentStep) => {
        setProgress(prev => ({
          ...prev,
          [algo.name]: { 
            progress: p, 
            time: performance.now() - startTime,
            currentStep
          }
        }));
      }, speed);
      
      const endTime = performance.now();
      
      setResults([{ 
        name: algo.name, 
        time: endTime - startTime,
        best: algo.best,
        worst: algo.worst,
        description: algo.description
      }]);
      
      setRaceStatus('completed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl p-6"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Algorithm Race Visualizer</h1>
        
        {/* Configuration Panel */}
        <div className="mb-8 p-6 bg-gray-100 rounded-lg border border-gray-300 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Custom Input (comma-separated)
              </label>
              <input
                type="text"
                value={customInput}
                onChange={handleCustomInputChange}
                placeholder="e.g., 5, 3, 8, 1, 9, 2"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
              {inputError && (
                <p className="mt-1 text-xs text-red-500">{inputError}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Visualization Mode</label>
              <select 
                value={visualizationMode}
                onChange={(e) => setVisualizationMode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                <option value="race">Race All Algorithms</option>
                <option value="step-by-step">Step-by-Step Single Algorithm</option>
              </select>
            </div>
            
            {visualizationMode === 'step-by-step' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Select Algorithm</label>
                <select 
                  value={currentAlgorithm || ''}
                  onChange={(e) => setCurrentAlgorithm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value="">Select an algorithm</option>
                  {sortingAlgorithms.map(algo => (
                    <option key={algo.name} value={algo.name}>{algo.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Animation Speed</label>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Slow</span>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-gray-600">Fast</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={startRace}
              disabled={raceStatus === 'running' || (visualizationMode === 'step-by-step' && !currentAlgorithm)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {raceStatus === 'running' ? 'Sorting in progress...' : 'Start Sorting'}
            </button>
            <button
              onClick={handleClear}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition transform hover:scale-105"
            >
              Clear
            </button>
          </div>
        </div>
        
        {/* Current Array Display */}
        {array.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="mb-8 p-6 bg-gray-100 rounded-lg border border-gray-300 shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Current Array</h2>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-1 min-w-full" style={{ height: '40px' }}>
                {array.slice(0, 100).map((value, index) => (
                  <motion.div 
                    key={index}
                    className="bg-blue-500 rounded"
                    style={{ 
                      height: `${value}%`, 
                      width: `${Math.max(2, 100 / array.length)}px` 
                    }}
                    title={`Value: ${value}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.005 }}
                  ></motion.div>
                ))}
                {array.length > 100 && (
                  <div className="text-gray-500 flex items-end pl-2">
                    ...and {array.length - 100} more items
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {array.length > 20 
                ? `${array.slice(0, 20).join(', ')}... (${array.length} items total)`
                : array.join(', ')}
            </div>
          </motion.div>
        )}
        
        {/* Algorithms Progress */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Algorithms Progress</h2>
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                checked={showExplanations} 
                onChange={() => setShowExplanations(!showExplanations)}
                className="mr-2"
              />
              <span className="text-gray-600 text-sm">Show Explanations</span>
            </label>
          </div>
          
          <div className="grid gap-6">
            {sortingAlgorithms
              .filter(algo => visualizationMode === 'race' || currentAlgorithm === algo.name)
              .map((algo) => (
              <motion.div 
                key={algo.name}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="border p-6 rounded-lg bg-white shadow hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-800">{algo.name}</h3>
                  <span className="text-gray-600 font-mono">
                    {formatTime(progress[algo.name]?.time || 0)}
                  </span>
                </div>
                <div className="h-4 bg-gray-300 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className={`h-full ${(() => {
                      if (!results.length) return 'bg-blue-500';
                      const rank = results.findIndex(r => r.name === algo.name);
                      if (rank === 0) return 'bg-green-500';
                      if (rank === 1) return 'bg-blue-500';
                      if (rank === 2) return 'bg-yellow-500';
                      return 'bg-gray-500';
                    })()} rounded-full`}
                    style={{ width: `${progress[algo.name]?.progress || 0}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                
                {showExplanations && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{algo.description}</p>
                    <div className="mt-1 text-xs flex justify-between text-gray-500">
                      <span>Best: {algo.best}</span>
                      <span>Worst: {algo.worst}</span>
                    </div>
                  </div>
                )}
                
                {progress[algo.name]?.currentStep && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm border border-gray-200">
                    <div className="text-gray-700">Current operation: {progress[algo.name].currentStep}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Leaderboard */}
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="border p-6 rounded-lg bg-white shadow-sm mb-8"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Leaderboard</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-3 px-4 text-left">Rank</th>
                    <th className="py-3 px-4 text-left">Algorithm</th>
                    <th className="py-3 px-4 text-left">Time</th>
                    <th className="py-3 px-4 text-left">Best Case</th>
                    <th className="py-3 px-4 text-left">Worst Case</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr 
                      key={result.name} 
                      className={`border-t ${idx === 0 ? 'bg-green-50' : 'bg-white'}`}
                    >
                      <td className="py-3 px-4">#{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{result.name}</td>
                      <td className="py-3 px-4 font-mono text-gray-700">{formatTime(result.time)}</td>
                      <td className="py-3 px-4">{result.best}</td>
                      <td className="py-3 px-4">{result.worst}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        
        {/* History */}
        {history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="border p-6 rounded-lg bg-white shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 flex items-center">
              History
              <button 
                onClick={() => setHistory([])} 
                className="ml-4 text-sm text-red-600 hover:text-red-700 transition"
              >
                Clear History
              </button>
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-3 px-4 text-left">Time</th>
                    <th className="py-3 px-4 text-left">Array Size</th>
                    <th className="py-3 px-4 text-left">Winner</th>
                    <th className="py-3 px-4 text-left">Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-3 px-4">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">{entry.arraySize}</td>
                      <td className="py-3 px-4 font-medium">{entry.results[0]?.name || 'N/A'}</td>
                      <td className="py-3 px-4 font-mono">
                        {entry.results[0] ? formatTime(entry.results[0].time) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AlgorithmRace;

/* Sorting Algorithm Functions with Enhanced Progress Reporting */

// Bubble Sort
function bubbleSort(arr, onProgress, speedMultiplier = 1) {
  return new Promise(async (resolve) => {
    let n = arr.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          onProgress(
            ((i * n + j) / (n * n)) * 100, 
            `Swapping elements: ${arr[j]} and ${arr[j+1]}`
          );
          await new Promise(resolve => setTimeout(resolve, 5 / speedMultiplier));
        }
      }
      onProgress(
        ((i + 1) / n) * 100, 
        `Completed pass ${i+1}/${n}: Largest ${i+1} elements are now in place`
      );
      await new Promise(resolve => setTimeout(resolve, 10 / speedMultiplier));
    }
    onProgress(100, "Sort completed");
    resolve(arr);
  });
}

// Selection Sort
function selectionSort(arr, onProgress, speedMultiplier = 1) {
  return new Promise(async (resolve) => {
    let n = arr.length;
    for (let i = 0; i < n; i++) {
      let minIndex = i;
      for (let j = i + 1; j < n; j++) {
        if (arr[j] < arr[minIndex]) {
          minIndex = j;
          onProgress(
            ((i * n + j) / (n * n)) * 100, 
            `Found new minimum: ${arr[j]} at index ${j}`
          );
          await new Promise(resolve => setTimeout(resolve, 2 / speedMultiplier));
        }
      }
      if (minIndex !== i) {
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        onProgress(
          ((i + 0.5) / n) * 100, 
          `Swapping: ${arr[i]} and ${arr[minIndex]}`
        );
        await new Promise(resolve => setTimeout(resolve, 10 / speedMultiplier));
      }
      onProgress(
        ((i + 1) / n) * 100, 
        `Element ${arr[i]} placed at position ${i}`
      );
      await new Promise(resolve => setTimeout(resolve, 10 / speedMultiplier));
    }
    onProgress(100, "Sort completed");
    resolve(arr);
  });
}

// Insertion Sort
function insertionSort(arr, onProgress, speedMultiplier = 1) {
  return new Promise(async (resolve) => {
    let n = arr.length;
    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;
      onProgress(
        (i / n) * 90, 
        `Inserting ${key} into sorted portion`
      );
      while (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j];
        j--;
        onProgress(
          (i / n) * 95, 
          `Shifting ${arr[j+1]} right`
        );
        await new Promise(resolve => setTimeout(resolve, 5 / speedMultiplier));
      }
      arr[j + 1] = key;
      onProgress(
        (i / n) * 100, 
        `Placed ${key} at position ${j+1}`
      );
      await new Promise(resolve => setTimeout(resolve, 10 / speedMultiplier));
    }
    onProgress(100, "Sort completed");
    resolve(arr);
  });
}

// Merge Sort
async function mergeSort(arr, onProgress, speedMultiplier = 1) {
  const totalSize = arr.length;
  async function mergeSortRecursive(arr, depth = 0, startIdx = 0) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    onProgress(
      (startIdx / totalSize) * 100, 
      `Dividing array at depth ${depth}`
    );
    await new Promise(resolve => setTimeout(resolve, 5 / speedMultiplier));
    const left = await mergeSortRecursive(arr.slice(0, mid), depth + 1, startIdx);
    const right = await mergeSortRecursive(arr.slice(mid), depth + 1, startIdx + mid);
    onProgress(
      ((startIdx + arr.length) / totalSize) * 80, 
      `Merging at depth ${depth}: arrays of size ${left.length} and ${right.length}`
    );
    const merged = await mergeArrays(left, right, onProgress, speedMultiplier, startIdx, totalSize);
    return merged;
  }
  return await mergeSortRecursive(arr);
}

async function mergeArrays(left, right, onProgress, speedMultiplier, startIdx, totalSize) {
  let result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
    onProgress(
      ((startIdx + i + j) / totalSize) * 90, 
      `Merging: comparing ${left[i-1] || '?'} and ${right[j-1] || '?'}`
    );
    await new Promise(resolve => setTimeout(resolve, 2 / speedMultiplier));
  }
  while (i < left.length) {
    result.push(left[i]);
    i++;
  }
  while (j < right.length) {
    result.push(right[j]);
    j++;
  }
  onProgress(
    ((startIdx + result.length) / totalSize) * 100, 
    `Merged subarray of size ${result.length}`
  );
  return result;
}

// Quick Sort
async function quickSort(arr, onProgress, speedMultiplier = 1) {
  const totalSize = arr.length;
  async function quickSortRecursive(arr, depth = 0, startIdx = 0) {
    if (arr.length <= 1) return arr;
    const pivotIdx = arr.length - 1;
    const pivot = arr[pivotIdx];
    onProgress(
      (startIdx / totalSize) * 100, 
      `Selected pivot: ${pivot} at depth ${depth}`
    );
    await new Promise(resolve => setTimeout(resolve, 5 / speedMultiplier));
    const left = [];
    const right = [];
    for (let i = 0; i < pivotIdx; i++) {
      if (arr[i] < pivot) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
      onProgress(
        ((startIdx + i) / totalSize) * 100, 
        `Partitioning: ${arr[i]} ${arr[i] < pivot ? '< pivot' : '>= pivot'}`
      );
      await new Promise(resolve => setTimeout(resolve, 2 / speedMultiplier));
    }
    onProgress(
      ((startIdx + pivotIdx) / totalSize) * 100, 
      `Partitioned: ${left.length} elements < pivot, ${right.length} elements > pivot`
    );
    const sortedLeft = await quickSortRecursive(left, depth + 1, startIdx);
    const sortedRight = await quickSortRecursive(right, depth + 1, startIdx + left.length + 1);
    const result = [...sortedLeft, pivot, ...sortedRight];
    onProgress(
      ((startIdx + result.length) / totalSize) * 100, 
      `Sorted subarray of size ${result.length} at depth ${depth}`
    );
    return result;
  }
  return await quickSortRecursive(arr);
}
