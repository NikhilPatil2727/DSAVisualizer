import { useState, useEffect, useRef } from 'react';

const MergeSortVisualizer = () => {
  const [array, setArray] = useState([]);
  const [sortedRanges, setSortedRanges] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [highlightedLine, setHighlightedLine] = useState(-1);
  const [stepLog, setStepLog] = useState([]);
  const [arraySize, setArraySize] = useState(10);
  const [animationState, setAnimationState] = useState({
    left: [],
    right: [],
    comparing: [],
    merged: [],
    currentMerge: null,
    splitStack: []
  });

  // This flag is used to cancel the ongoing sort.
  const shouldStop = useRef(false);
  const pauseControl = useRef({ isPaused: false, resolve: null });
  const arrayRef = useRef(array);

  const borderColors = ['#facc15', '#4ade80', '#60a5fa', '#c084fc', '#f472b6'];
  const codeLines = [
    "function mergeSort(arr, left, right) {",
    "  if (left >= right) return;",
    "  const mid = Math.floor((left + right) / 2);",
    "  mergeSort(arr, left, mid);",
    "  mergeSort(arr, mid + 1, right);",
    "  merge(arr, left, mid, right);",
    "}",
    "",
    "function merge(arr, left, mid, right) {",
    "  let i = left, j = mid + 1;",
    "  const temp = [];",
    "  while (i <= mid && j <= right) {",
    "    if (arr[i] <= arr[j]) temp.push(arr[i++]);",
    "    else temp.push(arr[j++]);",
    "  }",
    "  while (i <= mid) temp.push(arr[i++]);",
    "  while (j <= right) temp.push(arr[j++]);",
    "  for (let k = 0; k < temp.length; k++) {",
    "    arr[left + k] = temp[k];",
    "  }",
    "}"
  ];

  // On mount, initialize the visualizer. Clean up by canceling any ongoing sort.
  useEffect(() => {
    resetVisualizer();
    return () => { 
      shouldStop.current = true; 
    };
  }, []);

  // Keep the array reference updated.
  useEffect(() => {
    arrayRef.current = array;
  }, [array]);

  // Generate a new array with the specified size.
  const generateArray = (size) => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 50) + 10);
  };

  // Reset the visualizer with a new array.
  // Note: We do NOT reset the cancellation flag here so that a reset
  // cancels the ongoing sort.
  const resetVisualizer = () => {
    const newArr = generateArray(arraySize);
    setArray(newArr);
    setSortedRanges([]);
    setStepLog([]);
    setAnimationState({
      left: [],
      right: [],
      comparing: [],
      merged: [],
      currentMerge: null,
      splitStack: []
    });
    // Do not reset shouldStop.current here.
    setIsPaused(false);
    pauseControl.current = { isPaused: false, resolve: null };
    setHighlightedLine(-1);
  };

  // Handle array size change.
  const handleSizeChange = (size) => {
    setArraySize(size);
    const newArr = generateArray(size);
    setArray(newArr);
    setSortedRanges([]);
  };

  // Wait function with pause support.
  const wait = async (ms) => {
    let elapsed = 0;
    const interval = 50;
    while (elapsed < ms && !shouldStop.current) {
      if (pauseControl.current.isPaused) {
        await new Promise(resolve => { pauseControl.current.resolve = resolve; });
      }
      await new Promise(res => setTimeout(res, interval));
      elapsed += interval;
    }
  };

  // Merge function with visualization.
  const merge = async (arr, left, mid, right) => {
    if (shouldStop.current) return;
    
    setStepLog(prev => [...prev, `Merging subarrays [${left}-${mid}] and [${mid + 1}-${right}]`]);
    setHighlightedLine(8);
    setAnimationState(prev => ({
      ...prev,
      currentMerge: { left, mid, right },
      left: arr.slice(left, mid + 1),
      right: arr.slice(mid + 1, right + 1)
    }));
    
    await wait(speed);

    let i = 0, j = 0;
    const temp = [];
    // Loop through both subarrays until one is exhausted.
    while (i < (mid - left + 1) && j < (right - mid)) {
      const leftVal = arr[left + i];
      const rightVal = arr[mid + 1 + j];
      
      setStepLog(prev => [...prev, `Comparing ${leftVal} (index ${left + i}) and ${rightVal} (index ${mid + 1 + j})`]);
      setHighlightedLine(12);
      setAnimationState(prev => ({
        ...prev,
        comparing: [left + i, mid + 1 + j]
      }));
      await wait(speed);

      if (leftVal <= rightVal) {
        setHighlightedLine(13);
        temp.push(leftVal);
        i++;
      } else {
        setHighlightedLine(14);
        temp.push(rightVal);
        j++;
      }

      setAnimationState(prev => ({
        ...prev,
        merged: [...temp],
        comparing: []
      }));
      await wait(speed / 2);
    }

    setHighlightedLine(16);
    while (i < (mid - left + 1)) {
      temp.push(arr[left + i]);
      i++;
      setAnimationState(prev => ({ ...prev, merged: [...temp] }));
      await wait(speed / 4);
    }

    setHighlightedLine(17);
    while (j < (right - mid)) {
      temp.push(arr[mid + 1 + j]);
      j++;
      setAnimationState(prev => ({ ...prev, merged: [...temp] }));
      await wait(speed / 4);
    }

    setHighlightedLine(18);
    // **Update the original array in place**
    for (let k = 0; k < temp.length; k++) {
      arr[left + k] = temp[k];
      setArray([...arr]); // Update the state for visualization
      await wait(speed / 4);
    }

    setSortedRanges(prev => [...prev, [left, right]]);
    setAnimationState(prev => ({
      ...prev,
      currentMerge: null,
      merged: [],
      splitStack: prev.splitStack.slice(0, -1)
    }));
  };

  // Recursive mergeSort function with visualization.
  const mergeSort = async (arr, left = 0, right = arr.length - 1) => {
    if (left >= right || shouldStop.current) return;
    
    setStepLog(prev => [...prev, `Splitting array [${left}-${right}]`]);
    setHighlightedLine(0);
    await wait(speed / 4);
    
    setHighlightedLine(1);
    await wait(speed / 4);
    
    setAnimationState(prev => ({
      ...prev,
      splitStack: [...prev.splitStack, { left, right }]
    }));

    const mid = Math.floor((left + right) / 2);
    setHighlightedLine(2);
    await wait(speed / 4);
    
    setHighlightedLine(3);
    await mergeSort(arr, left, mid);
    
    setHighlightedLine(4);
    await mergeSort(arr, mid + 1, right);
    
    setHighlightedLine(5);
    await merge(arr, left, mid, right);
  };

  // Start the sorting animation.
  const startSorting = async () => {
    if (isSorting) return;
    // Clear the cancellation flag when starting.
    shouldStop.current = false;
    setIsSorting(true);
    setStepLog([]);
    // **Pass the state array directly so that changes are made in place**
    await mergeSort(array);
    if (!shouldStop.current) {
      setStepLog(prev => [...prev, 'Merge Sort complete!']);
    }
    setIsSorting(false);
    setHighlightedLine(-1);
  };

  // Reset button handler.
  // Now, clicking Reset cancels the ongoing sort without automatically restarting it.
  const handleReset = () => {
    shouldStop.current = true;
    setIsSorting(false);
    resetVisualizer();
  };

  // Toggle pause/resume.
  const togglePause = () => {
    if (!isSorting) return;
    if (!isPaused) {
      setIsPaused(true);
      pauseControl.current.isPaused = true;
    } else {
      setIsPaused(false);
      pauseControl.current.isPaused = false;
      if (pauseControl.current.resolve) {
        pauseControl.current.resolve();
        pauseControl.current.resolve = null;
      }
    }
  };

  // Options for speed and array size buttons.
  const speedOptions = [
    { label: 'Slow', value: 2000 },
    { label: 'Medium', value: 1000 },
    { label: 'Fast', value: 500 },
    { label: 'Very Fast', value: 250 }
  ];

  const arraySizes = [5, 10, 15, 20];

  return (
    <div className="bg-gray-900 text-white p-4 flex flex-col w-full min-h-screen overflow-hidden">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Merge Sort Visualizer
        </h1>
        <p className="text-gray-300">Visualize the merge sort algorithm step-by-step</p>
      </header>

      {/* Main Control Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={startSorting}
          disabled={isSorting}
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isSorting ? 'Sorting...' : 'Start Sorting'}
        </button>
        <button
          onClick={togglePause}
          disabled={!isSorting}
          className="px-6 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Speed Control Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2 bg-gray-800 px-4 py-3 rounded-lg mb-6">
        <label className="text-sm font-medium">Speed:</label>
        <div className="flex gap-2">
          {speedOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSpeed(option.value)}
              className={`px-3 py-1 rounded text-sm ${speed === option.value ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Array Size Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2 bg-gray-800 px-4 py-3 rounded-lg mb-6">
        <label className="text-sm font-medium">Array Size:</label>
        <div className="flex gap-2">
          {arraySizes.map(size => (
            <button
              key={size}
              onClick={() => !isSorting && handleSizeChange(size)}
              disabled={isSorting}
              className={`px-3 py-1 rounded text-sm ${arraySize === size ? 'bg-blue-600' : 'bg-gray-700'} ${isSorting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Visualization Area */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl shadow-xl">
          <div className="mb-2 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Visualization</h3>
            <div className="text-sm bg-gray-700 px-3 py-1 rounded-lg">
              {isPaused ? 'Paused' : isSorting ? 'Sorting...' : 'Ready'}
            </div>
          </div>
          
          <div className="flex items-end justify-center h-64 md:h-80 lg:h-96 gap-1.5 mb-6 border-b border-gray-700 pb-10 relative">
            {array.map((value, index) => {
              const isSorted = sortedRanges.some(([s, e]) => index >= s && index <= e);
              const isComparing = animationState.comparing.includes(index);
              const isLeft = animationState.currentMerge &&
                index >= animationState.currentMerge.left &&
                index <= animationState.currentMerge.mid;
              const isRight = animationState.currentMerge &&
                index > animationState.currentMerge.mid &&
                index <= animationState.currentMerge.right;

              return (
                <div
                  key={index}
                  className="relative flex-1 min-w-[2%] transition-all duration-300"
                  style={{ height: `${value * 3}px` }}
                >
                  <div 
                    className={`absolute inset-0 rounded-t-lg transition-colors ${
                      isComparing ? 'bg-red-500 animate-pulse' : 
                      isSorted ? 'bg-green-500' : 
                      isLeft ? 'bg-purple-500' :
                      isRight ? 'bg-indigo-500' :
                      'bg-blue-500'
                    }`}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">
                      {value}
                    </span>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                      {index}
                    </span>
                  </div>
                  {animationState.splitStack.map(({ left, right }, depth) => (
                    index >= left && index <= right && (
                      <div
                        key={`split-${depth}-${left}-${right}`}
                        className="absolute inset-0 border-2 rounded-t-lg"
                        style={{ 
                          borderColor: borderColors[depth % borderColors.length],
                          transform: `scale(${1 - depth * 0.03})`,
                          zIndex: -depth
                        }}
                      />
                    )
                  ))}
                </div>
              );
            })}
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Algorithm Steps</h3>
              <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                {stepLog.length} steps
              </span>
            </div>
            <div className="h-48 overflow-y-auto space-y-2 text-sm scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
              {stepLog.length > 0 ? (
                stepLog.map((log, idx) => (
                  <div key={idx} className="p-2 bg-gray-600 rounded even:bg-gray-700 transition-all">
                    {log}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">
                  Click "Start Sorting" to begin visualization
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code & Legend */}
        <div className="lg:w-1/3 bg-gray-800 p-6 rounded-xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Algorithm Code</h2>
            <div className="text-xs bg-blue-900/30 px-2 py-1 rounded text-blue-300">
              {highlightedLine >= 0 ? `Line ${highlightedLine + 1}` : 'Code'}
            </div>
          </div>
          <pre className="font-mono text-sm bg-gray-900 p-4 rounded-lg overflow-auto h-96">
            {codeLines.map((line, idx) => (
              <div
                key={idx}
                className={`flex items-center ${highlightedLine === idx ? 'bg-blue-900/40 text-blue-400' : ''}`}
              >
                <span className="text-gray-500 w-8 pr-2 select-none text-right">{idx + 1}</span>
                <code className={`pl-2 ${highlightedLine === idx ? 'text-blue-300 font-medium' : 'text-gray-300'}`}>
                  {line}
                </code>
              </div>
            ))}
          </pre>
          
          <div className="mt-4 p-3 bg-gray-700 rounded-lg text-sm">
            <h3 className="font-medium mb-2">Legend:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
                <span>Unsorted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-green-500"></div>
                <span>Sorted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-purple-500"></div>
                <span>Left subarray</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-indigo-500"></div>
                <span>Right subarray</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-red-500"></div>
                <span>Comparing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm border-2 border-yellow-400 bg-transparent"></div>
                <span>Recursive call</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-6 text-center text-gray-400 text-sm">
        <p>Merge Sort Time Complexity: O(n log n) | Space Complexity: O(n)</p>
      </footer>
    </div>
  );
};

export default MergeSortVisualizer;
