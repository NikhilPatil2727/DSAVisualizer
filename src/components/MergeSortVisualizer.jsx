import { useState, useEffect, useRef } from 'react';

const MergeSortVisualizer = () => {
  // State Management
  const [array, setArray] = useState([]);
  const [sortedRanges, setSortedRanges] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [highlightedLine, setHighlightedLine] = useState(-1);
  const [explanation, setExplanation] = useState('Click "Start Sorting" to begin');
  
  // Animation State
  const [animationState, setAnimationState] = useState({
    left: [],
    right: [],
    comparing: [],
    merged: [],
    currentMerge: null,
    splitStack: []
  });

  // Refs for pause/resume control
  const shouldStop = useRef(false);
  const pauseResume = useRef({ isPaused: false, resolve: null });

  // Algorithm Code Display
  const [codeLines] = useState([
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
  ]);

  // Initialize array on component mount
  useEffect(() => initializeArray(), []);

  // Helper Functions
  const initializeArray = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 50) + 10);
    setArray(newArray);
    setSortedRanges([]);
    setAnimationState({
      left: [],
      right: [],
      comparing: [],
      merged: [],
      currentMerge: null,
      splitStack: []
    });
    setExplanation('New array generated. Ready to sort!');
    shouldStop.current = false;
    setIsPaused(false);
  };

  const wait = async (ms) => {
    let elapsed = 0;
    const step = 50;
    while (elapsed < ms && !shouldStop.current) {
      if (pauseResume.current.isPaused) {
        await new Promise(resolve => {
          pauseResume.current.resolve = resolve;
        });
      }
      await new Promise(r => setTimeout(r, step));
      elapsed += step;
      if (shouldStop.current) break;
    }
  };

  // Sorting Algorithm Implementation
  const merge = async (arr, left, mid, right) => {
    if (shouldStop.current) return;
    
    setHighlightedLine(8);
    setAnimationState(prev => ({
      ...prev,
      currentMerge: { left, mid, right },
      left: arr.slice(left, mid + 1),
      right: arr.slice(mid + 1, right + 1)
    }));
    setExplanation(`Merging elements from ${left} to ${right}`);
    await wait(speed);

    let i = 0, j = 0;
    const temp = [];
    
    while (i <= mid - left && j <= right - mid - 1 && !shouldStop.current) {
      setHighlightedLine(10);
      const leftVal = arr[left + i];
      const rightVal = arr[mid + 1 + j];
      setExplanation(`Comparing ${leftVal} and ${rightVal}`);
      
      setAnimationState(prev => ({
        ...prev,
        comparing: [left + i, mid + 1 + j]
      }));
      await wait(speed);

      if (leftVal <= rightVal) {
        temp.push(leftVal);
        i++;
      } else {
        temp.push(rightVal);
        j++;
      }

      setAnimationState(prev => ({
        ...prev,
        merged: [...temp],
        comparing: []
      }));
      await wait(speed);
    }

    while (i <= mid - left && !shouldStop.current) {
      temp.push(arr[left + i]);
      i++;
      setAnimationState(prev => ({ ...prev, merged: [...temp] }));
      await wait(speed/2);
    }

    while (j <= right - mid - 1 && !shouldStop.current) {
      temp.push(arr[mid + 1 + j]);
      j++;
      setAnimationState(prev => ({ ...prev, merged: [...temp] }));
      await wait(speed/2);
    }

    if (!shouldStop.current) {
      const newArray = [...arr];
      for (let k = 0; k < temp.length; k++) {
        newArray[left + k] = temp[k];
      }
      setArray(newArray);
      setSortedRanges(prev => [...prev, [left, right]]);
    }

    setAnimationState(prev => ({
      ...prev,
      currentMerge: null,
      merged: [],
      splitStack: prev.splitStack.slice(0, -1)
    }));
  };

  const mergeSort = async (arr, left = 0, right = arr.length - 1) => {
    if (left >= right || shouldStop.current) return;
    
    try {
      setHighlightedLine(1);
      setAnimationState(prev => ({
        ...prev,
        splitStack: [...prev.splitStack, { left, right }]
      }));
      setExplanation(`Splitting array from index ${left} to ${right}`);
      await wait(speed/2);
      
      const mid = Math.floor((left + right) / 2);
      
      setHighlightedLine(3);
      await mergeSort(arr, left, mid);
      
      setHighlightedLine(4);
      await mergeSort(arr, mid + 1, right);
      
      setHighlightedLine(5);
      await merge(arr, left, mid, right);
    } catch (e) {
      if (shouldStop.current) return;
    }
  };

  // Event Handlers
  const startSorting = async () => {
    setIsSorting(true);
    setExplanation('Starting merge sort...');
    shouldStop.current = false;
    await mergeSort([...array]);
    setExplanation(shouldStop.current ? 'Sorting stopped' : 'Sorting complete!');
    setIsSorting(false);
    setHighlightedLine(-1);
  };

  const handleReset = () => {
    shouldStop.current = true;
    setIsSorting(false);
    initializeArray();
  };

  const togglePause = () => {
    if (!isPaused) {
      setIsPaused(true);
      pauseResume.current.isPaused = true;
    } else {
      setIsPaused(false);
      pauseResume.current.isPaused = false;
      if (pauseResume.current.resolve) {
        pauseResume.current.resolve();
        pauseResume.current.resolve = null;
      }
    }
  };

  // UI Rendering
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex flex-col">
      {/* Control Panel */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 flex-wrap items-center">
        <div className="flex flex-wrap gap-4 justify-center w-full md:w-auto">
          <button
            onClick={startSorting}
            disabled={isSorting}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 transition-colors text-sm md:text-base"
          >
            {isSorting ? 'Sorting...' : 'Start Sorting'}
          </button>
          <button
            onClick={togglePause}
            disabled={!isSorting}
            className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 transition-colors text-sm md:text-base"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors text-sm md:text-base"
          >
            Reset Array
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded w-full md:w-auto">
          <span className="text-sm md:text-base">Speed:</span>
          <input
            type="range"
            min="100"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24 md:w-32 accent-blue-500"
          />
        </div>
        
        {isPaused && (
          <div className="px-3 py-1 bg-yellow-600 rounded-full text-sm animate-pulse">
            Paused
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Visualization Panel */}
        <div className="flex-1 bg-gray-800 p-4 md:p-6 rounded-lg">
          <div className="mb-4 h-12 flex items-center justify-center text-sm md:text-lg font-semibold whitespace-normal text-center">
            {explanation}
          </div>
          
          <div className="relative flex items-end gap-1 md:gap-2 h-48 md:h-64 mb-8 overflow-x-auto">
            {array.map((value, index) => {
              const isSorted = sortedRanges.some(([start, end]) => index >= start && index <= end);
              const isComparing = animationState.comparing.includes(index);
              const inMergeRange = animationState.currentMerge?.left <= index && 
                                  index <= animationState.currentMerge?.right;
              const isLeftArray = animationState.currentMerge && 
                                index <= animationState.currentMerge.mid;
              const isRightArray = animationState.currentMerge && 
                                 index > animationState.currentMerge.mid;

              return (
                <div
                  key={index}
                  className={`flex-grow min-w-[28px] md:min-w-[35px] text-center py-2 rounded-t transition-all relative
                    ${isSorted ? 'bg-green-500' : ''}
                    ${isComparing ? 'bg-red-500 animate-pulse' : ''}
                    ${inMergeRange ? (isLeftArray ? 'bg-orange-300' : 'bg-pink-300') : ''}
                    ${!isSorted && !inMergeRange ? 'bg-blue-500' : ''}
                  `}
                  style={{ height: `${value}%` }}
                >
                  <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs">
                    {value}
                  </span>
                  {animationState.splitStack.map(({ left, right }, i) => (
                    index >= left && index <= right && (
                      <div
                        key={i}
                        className="absolute top-0 left-0 right-0 border-2 border-yellow-400"
                        style={{ height: `${100 + i * 10}%` }}
                      />
                    )
                  ))}
                </div>
              );
            })}
          </div>

          {animationState.currentMerge && (
            <div className="mt-4 md:mt-8 p-3 md:p-4 bg-gray-700 rounded-lg">
              <h3 className="text-base md:text-lg mb-2">Current Merge</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h4 className="text-orange-300 mb-2">Left Array</h4>
                  <div className="flex gap-2">
                    {animationState.left.map((num, i) => (
                      <div key={i} className="bg-orange-300 p-2 rounded">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-pink-300 mb-2">Right Array</h4>
                  <div className="flex gap-2">
                    {animationState.right.map((num, i) => (
                      <div key={i} className="bg-pink-300 p-2 rounded">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-green-300 mb-2">Merged Result</h4>
                  <div className="flex gap-2">
                    {animationState.merged.map((num, i) => (
                      <div key={i} className="bg-green-300 p-2 rounded">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Code Panel */}
        <div className="w-full md:w-1/3 bg-gray-800 p-4 md:p-6 rounded-lg overflow-auto">
          <pre className="font-mono text-xs md:text-sm">
            {codeLines.map((line, index) => (
              <div
                key={index}
                className={`p-1 rounded ${highlightedLine === index ? 'bg-gray-600' : ''}`}
              >
                {line}
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default MergeSortVisualizer;