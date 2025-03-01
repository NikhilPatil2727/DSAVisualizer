import React, { useState, useEffect, useRef } from 'react';

const QuickSortVisualizer = () => {
  const [array, setArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [speed, setSpeed] = useState(500);
  const [activeIndices, setActiveIndices] = useState([]);
  const [pivotIndex, setPivotIndex] = useState(-1);
  const [sortedIndices, setSortedIndices] = useState([]);

  const sortingRef = useRef(false);
  const pausedRef = useRef(false);
  const arrayRef = useRef(array);

  useEffect(() => {
    generateArray();
  }, []);

  useEffect(() => {
    arrayRef.current = array;
  }, [array]);

  const generateArray = () => {
    const newArray = Array.from({ length: 15 }, () =>
      Math.floor(Math.random() * 80 + 10)
    );
    setArray(newArray);
    resetVisualState();
  };

  const resetVisualState = () => {
    // Clear any active indices, pivot and sorted indices.
    setActiveIndices([]);
    setPivotIndex(-1);
    setSortedIndices([]);
    setCurrentStep('Array generated');
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleReset = () => {
    // Cancel any ongoing sorting and reset pause flag.
    sortingRef.current = false;
    pausedRef.current = false;
    setSorting(false);
    setPaused(false);
    generateArray();
  };

  const quickSort = async (arr, left, right) => {
    if (!sortingRef.current || left >= right) return;

    const pivotIdx = await partition(arr, left, right);
    if (!sortingRef.current) return;

    // Mark the pivot as finalized.
    setSortedIndices(prev => [...prev, pivotIdx]);
    
    await Promise.all([
      quickSort([...arr], left, pivotIdx - 1),
      quickSort([...arr], pivotIdx + 1, right)
    ]);
  };

  const partition = async (arr, left, right) => {
    if (!sortingRef.current) return -1; // Early check
    const pivot = arr[right];
    setPivotIndex(right);
    let i = left - 1;

    for (let j = left; j < right; j++) {
      if (!sortingRef.current) return -1;
      while (pausedRef.current) {
        if (!sortingRef.current) return -1;
        await sleep(100);
      }
      if (!sortingRef.current) return -1; // Check before updating state

      // Update active indices only if still sorting
      setActiveIndices([j, i]);
      await sleep(speed);

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        if (!sortingRef.current) return -1;
        setArray([...arr]);
        await sleep(speed);
      }
    }

    if (!sortingRef.current) return -1;
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    setArray([...arr]);
    setPivotIndex(-1);
    return i + 1;
  };

  const startSort = async () => {
    if (sorting) return;
    
    sortingRef.current = true;
    setSorting(true);
    setPaused(false);
    pausedRef.current = false;
    
    try {
      await quickSort([...array], 0, array.length - 1);
      if (sortingRef.current) {
        setCurrentStep('Sorting completed!');
        setSortedIndices(Array.from({ length: array.length }, (_, i) => i));
      }
    } finally {
      setSorting(false);
      sortingRef.current = false;
    }
  };

  const togglePause = () => {
    if (!sorting) return;
    setPaused(prev => !prev);
    pausedRef.current = !pausedRef.current;
    setCurrentStep(paused ? 'Resuming...' : 'Paused');
  };

  const getBarColor = (index) => {
    if (sortedIndices.includes(index)) return 'bg-green-500';
    if (index === pivotIndex) return 'bg-red-500';
    if (activeIndices.includes(index)) return 'bg-yellow-400';
    return 'bg-blue-500';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-600">
          QuickSort Visualizer
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls & Information */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Controls & Information</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation Speed: {speed}ms
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full"
                disabled={sorting}
              />
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={startSort}
                disabled={sorting}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {sorting ? 'Sorting...' : 'Start Sorting'}
              </button>
              <button
                onClick={togglePause}
                disabled={!sorting}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 transition-colors"
              >
                {paused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Color Legend:</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 mr-2"></div>
                  <span>Normal Element</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 mr-2"></div>
                  <span>Pivot Element</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-400 mr-2"></div>
                  <span>Active Comparison</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 mr-2"></div>
                  <span>Finalized Element</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Current Step:</h3>
              <p className="text-gray-700">{currentStep}</p>
            </div>
          </div>

          {/* Visualization Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col items-center">
              <div className="w-full h-96 mb-4 flex items-end justify-center space-x-1">
                {array.map((value, idx) => (
                  <div
                    key={idx}
                    className={`w-8 transition-all duration-300 rounded-t ${getBarColor(idx)}`}
                    style={{ height: `${value * 3}px` }}
                  >
                    <div className="text-center text-xs text-black -rotate-90 -ml-4 -mt-4">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full flex justify-between px-4 mb-4">
                {array.map((_, idx) => (
                  <div key={idx} className="w-8 text-center text-xs text-gray-600">
                    {idx}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={generateArray}
                disabled={sorting}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                Generate New Array
              </button>
            </div>
          </div>
        </div>

        {/* Algorithm Explanation */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">QuickSort Algorithm Steps</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">1. Choose a Pivot</h3>
              <p>Typically the last element in the current partition.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">2. Partitioning</h3>
              <p>Rearrange elements so that those less than the pivot come before it and those greater come after.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">3. Recursion</h3>
              <p>Recursively apply the process to the left and right partitions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSortVisualizer;
