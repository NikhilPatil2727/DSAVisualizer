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
  const [arraySize, setArraySize] = useState(15);

  const sortingRef = useRef(false);
  const pausedRef = useRef(false);
  const arrayRef = useRef(array);

  useEffect(() => {
    generateArray();
  }, [arraySize]);

  useEffect(() => {
    arrayRef.current = array;
  }, [array]);

  const generateArray = () => {
    const newArray = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 80 + 10)
    );
    setArray(newArray);
    resetVisualState();
  };

  const resetVisualState = () => {
    setActiveIndices([]);
    setPivotIndex(-1);
    setSortedIndices([]);
    setCurrentStep('Array generated. Press "Start Sorting" to visualize QuickSort algorithm.');
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleReset = () => {
    sortingRef.current = false;
    pausedRef.current = false;
    setSorting(false);
    setPaused(false);
    generateArray();
  };

  // Modified quickSort: It now uses the same array reference (no spread operator)
  const quickSort = async (arr, left, right) => {
    if (!sortingRef.current || left >= right) return;

    const pivotIdx = await partition(arr, left, right);
    if (!sortingRef.current) return;

    setSortedIndices(prev => [...prev, pivotIdx]);
    setCurrentStep(`Pivot ${arr[pivotIdx]} is now in its correct position at index ${pivotIdx}`);
    await sleep(speed);

    // Recursively sort the left and right subarrays sequentially
    await quickSort(arr, left, pivotIdx - 1);
    await quickSort(arr, pivotIdx + 1, right);
  };

  const partition = async (arr, left, right) => {
    if (!sortingRef.current) return -1;
    
    const pivot = arr[right];
    setPivotIndex(right);
    setCurrentStep(`Partitioning array with pivot ${pivot} (index: ${right})`);
    await sleep(speed);
    
    let i = left - 1;

    for (let j = left; j < right; j++) {
      if (!sortingRef.current) return -1;
      
      while (pausedRef.current) {
        if (!sortingRef.current) return -1;
        await sleep(100);
      }
      
      if (!sortingRef.current) return -1;

      setActiveIndices([j, i]);
      setCurrentStep(`Comparing element ${arr[j]} with pivot ${pivot}`);
      await sleep(speed);

      if (arr[j] < pivot) {
        i++;
        setCurrentStep(`${arr[j]} is less than pivot ${pivot}. Swapping elements at index ${i} and ${j}`);
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray([...arr]);
        await sleep(speed);
      }
    }

    setCurrentStep(`Placing pivot ${pivot} at its correct position`);
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    setArray([...arr]);
    setPivotIndex(-1);
    await sleep(speed);
    
    return i + 1;
  };

  const startSort = async () => {
    if (sorting) return;
    
    sortingRef.current = true;
    setSorting(true);
    setPaused(false);
    pausedRef.current = false;
    
    try {
      setCurrentStep('Starting QuickSort algorithm...');
      // Use the current array (in state) for in-place sorting.
      await quickSort(array, 0, array.length - 1);
      
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
    if (sortedIndices.includes(index)) return 'bg-emerald-500';
    if (index === pivotIndex) return 'bg-purple-600';
    if (activeIndices.includes(index)) return 'bg-amber-400';
    return 'bg-sky-500';
  };

  const getBarWidth = () => {
    if (window.innerWidth < 640) {
      if (arraySize <= 15) return 'w-4';
      if (arraySize <= 20) return 'w-3';
      if (arraySize <= 25) return 'w-2';
      return 'w-1.5';
    }
    if (arraySize <= 15) return 'w-8';
    if (arraySize <= 20) return 'w-6';
    if (arraySize <= 25) return 'w-5';
    return 'w-4';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            <span className="text-teal-600">Quick</span>Sort Visualizer
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
            Watch how the QuickSort algorithm organizes data in real-time with an interactive visualization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-white p-3 sm:p-5 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Configuration</h2>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Array Size: {arraySize} elements
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={arraySize}
                    onChange={(e) => setArraySize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    disabled={sorting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Animation Speed: {speed}ms
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    disabled={sorting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={startSort}
                  disabled={sorting}
                  className="px-2 sm:px-4 py-2 bg-teal-600 text-white text-sm sm:text-base rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  {sorting ? 'Sorting...' : 'Start Sorting'}
                </button>
                <button
                  onClick={togglePause}
                  disabled={!sorting}
                  className="px-2 sm:px-4 py-2 bg-amber-500 text-white text-sm sm:text-base rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  {paused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-2 sm:px-4 py-2 bg-red-500 text-white text-sm sm:text-base rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={generateArray}
                  disabled={sorting}
                  className="px-2 sm:px-4 py-2 bg-sky-500 text-white text-sm sm:text-base rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors"
                >
                  New Array
                </button>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="text-sm sm:text-md font-semibold mb-2 text-gray-700">Color Key:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-sky-500 rounded mr-2"></div>
                    <span className="text-sm">Unsorted</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-600 rounded mr-2"></div>
                    <span className="text-sm">Pivot</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-amber-400 rounded mr-2"></div>
                    <span className="text-sm">Comparing</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-emerald-500 rounded mr-2"></div>
                    <span className="text-sm">Sorted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white p-3 sm:p-5 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800 border-b pb-2">Visualization</h2>
            
            <div className="mb-3 p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm border border-gray-100">
              <strong>Current Step:</strong> {currentStep || 'Ready to start'}
            </div>
            
            <div className="h-48 sm:h-64 md:h-80 flex items-end justify-center space-x-0.5 sm:space-x-1 mt-4 mb-6">
              {array.map((value, idx) => (
                <div
                  key={idx}
                  className={`${getBarWidth()} transition-all duration-300 rounded-t-sm ${getBarColor(idx)} relative group`}
                  style={{ height: `${(value / Math.max(...array)) * 90}%` }}
                >
                  <div className="absolute w-full text-center -bottom-6 text-[10px] sm:text-xs text-gray-600">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 bg-white p-3 sm:p-5 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800 border-b pb-2">QuickSort Algorithm Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
              <h3 className="font-semibold text-teal-800 mb-2">1. Choose a Pivot</h3>
              <p className="text-sm text-gray-700">The algorithm selects a pivot element from the array (in this implementation, the last element of the current partition).</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="font-semibold text-purple-800 mb-2">2. Partitioning</h3>
              <p className="text-sm text-gray-700">The array is rearranged so elements smaller than the pivot come before it, and elements greater come after.</p>
            </div>
            <div className="p-4 bg-sky-50 rounded-lg border border-sky-100">
              <h3 className="font-semibold text-sky-800 mb-2">3. Recursion</h3>
              <p className="text-sm text-gray-700">The algorithm recursively applies these steps to the left and right sub-arrays until the entire array is sorted.</p>
            </div>
          </div>
          <div className="mt-3 text-xs sm:text-sm text-gray-600 italic">
            <p>Time Complexity: O(n log n) on average, O(n²) in worst case</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSortVisualizer;
