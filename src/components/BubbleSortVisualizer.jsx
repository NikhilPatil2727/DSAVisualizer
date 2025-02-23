import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaRandom, FaUndo } from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md';

const SPEED_OPTIONS = {
  1000: 'Very Slow',
  800: 'Slow',
  500: 'Medium',
  300: 'Fast',
  100: 'Very Fast'
};

const BubbleSortVisualizer = () => {
  const [array, setArray] = useState([]);
  const [originalArray, setOriginalArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [swapping, setSwapping] = useState([-1, -1]);
  const [swapPositions, setSwapPositions] = useState({});
  const [speed, setSpeed] = useState(500);
  const [arraySize, setArraySize] = useState(12);
  const [stats, setStats] = useState({
    comparisons: 0,
    swaps: 0,
    timeElapsed: 0
  });
  const [sortedIndices, setSortedIndices] = useState([]);

  const sortingRef = useRef(null);
  const startTimeRef = useRef(null);
  const cancelSortRef = useRef(false);
  // New ref to store current indices for resuming the sort
  const indicesRef = useRef({ i: 0, j: 0 });

  // Generate new array and cancel any ongoing sort
  const newGenerateArray = () => {
    if (sortingRef.current) {
      clearTimeout(sortingRef.current);
    }
    cancelSortRef.current = true;
    // Reset resume indices since it's a new array
    indicesRef.current = { i: 0, j: 0 };
    const newArr = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 99) + 1
    );
    setOriginalArray(newArr);
    setArray(newArr);
    setSorting(false);
    setSwapping([-1, -1]);
    setSwapPositions({});
    setSortedIndices([]);
    setStats({ comparisons: 0, swaps: 0, timeElapsed: 0 });
    startTimeRef.current = null;
  };

  // Reset to original unsorted array
  const newResetArray = () => {
    if (sortingRef.current) {
      clearTimeout(sortingRef.current);
    }
    cancelSortRef.current = true;
    // Reset resume indices when resetting
    indicesRef.current = { i: 0, j: 0 };
    setArray([...originalArray]);
    setSorting(false);
    setSwapping([-1, -1]);
    setSwapPositions({});
    setSortedIndices([]);
    setStats({ comparisons: 0, swaps: 0, timeElapsed: 0 });
    startTimeRef.current = null;
  };

  useEffect(() => {
    newGenerateArray();
    return () => {
      if (sortingRef.current) {
        clearTimeout(sortingRef.current);
      }
    };
  }, [arraySize]);

  const sleep = (ms) =>
    new Promise((resolve) => {
      sortingRef.current = setTimeout(resolve, ms);
    });

  const updateStats = (comparisons, swaps) => {
    const currentTime = Date.now();
    const timeElapsed = startTimeRef.current ? currentTime - startTimeRef.current : 0;
    setStats({ comparisons, swaps, timeElapsed });
  };

  // Bubble sort algorithm with resume functionality
  const bubbleSort = async () => {
    cancelSortRef.current = false;
    // Only set the start time if it's not already running
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    setSorting(true);
    // Continue comparisons and swaps from previous state
    let comparisons = stats.comparisons;
    let swaps = stats.swaps;
    const arr = [...array];
    const n = arr.length;

    // Resume from the stored outer loop index (i)
    for (let i = indicesRef.current.i; i < n - 1; i++) {
      if (cancelSortRef.current) {
        indicesRef.current.i = i;
        return;
      }
      let swapped = false;
      // Resume from stored inner loop index (j) if available
      for (let j = indicesRef.current.j; j < n - i - 1; j++) {
        if (cancelSortRef.current) {
          indicesRef.current.i = i;
          indicesRef.current.j = j;
          return;
        }
        setSwapping([j, j + 1]);
        comparisons++;
        updateStats(comparisons, swaps);
        await sleep(speed);
        if (arr[j] > arr[j + 1]) {
          // Animate swap
          setSwapPositions({
            [j]: { transform: `translateX(100%)` },
            [j + 1]: { transform: `translateX(-100%)` },
          });
          await sleep(speed / 2);

          // Perform swap
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps++;
          swapped = true;

          setArray([...arr]);
          setSwapPositions({});
          updateStats(comparisons, swaps);
          await sleep(speed / 2);
        }
      }
      // After completing the inner loop, reset the inner index for the next iteration
      indicesRef.current.j = 0;
      setSortedIndices((prev) => [...prev, n - 1 - i]);
      if (!swapped) {
        setSortedIndices(Array.from({ length: n }, (_, idx) => idx));
        indicesRef.current = { i: n, j: 0 };
        break;
      }
    }

    setSwapping([-1, -1]);
    setSorting(false);
    // Reset resume indices after sort completion
    indicesRef.current = { i: 0, j: 0 };
  };

  // Toggle sort on/off with resume support
  const newStartStopSorting = async () => {
    if (!sorting) {
      cancelSortRef.current = false;
      bubbleSort();
    } else {
      cancelSortRef.current = true;
      if (sortingRef.current) {
        clearTimeout(sortingRef.current);
      }
      setSorting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-100 to-blue-200">
      {/* Fixed Header */}
      <header className="h-16 bg-indigo-700 flex items-center justify-center text-white shadow flex-shrink-0">
        <h1 className="text-2xl font-bold">Bubble Sort Visualizer</h1>
      </header>

      {/* Main content area */}
      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
        {/* Left Column: Info, Stats, Controls & Legend */}
        <div className="w-full md:w-1/3 p-2 flex flex-col space-y-2 overflow-y-auto">
          {/* Info Panel */}
          <div className="flex-1 bg-white shadow rounded p-3">
            <h2 className="text-lg font-bold text-gray-800 mb-1">About Bubble Sort</h2>
            <p className="text-gray-700 text-xs">
              Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if needed.
            </p>
            <p className="text-gray-700 text-xs mt-1">
              <strong>Time Complexity:</strong> O(n²)
            </p>
            <p className="text-gray-700 text-xs mt-1">
              <strong>Space Complexity:</strong> O(1)
            </p>
          </div>

          {/* Stats Dashboard */}
          <div className="flex-1 bg-white shadow rounded p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center">
                <span className="text-xl">🔄</span>
                <p className="text-xs text-gray-600">Comparisons</p>
                <p className="text-lg font-bold text-gray-800">{stats.comparisons}</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl">⚡</span>
                <p className="text-xs text-gray-600">Swaps</p>
                <p className="text-lg font-bold text-gray-800">{stats.swaps}</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl">⏱️</span>
                <p className="text-xs text-gray-600">Time</p>
                <p className="text-lg font-bold text-gray-800">{Math.floor(stats.timeElapsed / 1000)}s</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl">📊</span>
                <p className="text-xs text-gray-600">Size</p>
                <p className="text-lg font-bold text-gray-800">{arraySize}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 bg-white shadow rounded p-3">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={newGenerateArray}
                disabled={sorting}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white text-xs font-semibold py-2 px-3 rounded transition-colors"
              >
                <FaRandom /> New Array
              </button>
              <button
                onClick={newStartStopSorting}
                className={`flex items-center gap-1 ${
                  sorting ? 'bg-red-500 hover:bg-red-600' : 'bg-violet-500 hover:bg-violet-600'
                } text-white text-xs font-semibold py-2 px-3 rounded transition-colors`}
              >
                {sorting ? <FaPause /> : <FaPlay />}
                {sorting ? 'Stop' : 'Start'}
              </button>
              <button
                onClick={newResetArray}
                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 px-3 rounded transition-colors"
              >
                <FaUndo /> Reset
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <MdSpeed className="text-xl text-gray-600" />
                <span className="text-gray-700 text-xs">
                  Speed: {SPEED_OPTIONS[speed] || 'Custom'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-gray-600 text-xs">{speed}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-700 text-xs">Array Size:</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={arraySize}
                  onChange={(e) => setArraySize(Number(e.target.value))}
                  className="w-16 p-1 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 bg-white shadow rounded p-3 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-700 text-xs">Comparing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700 text-xs">Sorted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-gray-700 text-xs">Unsorted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="w-full md:w-2/3 p-2 overflow-auto">
          <div className="h-full bg-white shadow rounded p-2 flex items-end justify-center">
            <div className="w-full flex items-end justify-center gap-1">
              {array.map((value, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center transition-all duration-300 ${
                    swapping.includes(idx) ? 'scale-110' : ''
                  }`}
                  style={{
                    transform: swapPositions[idx]?.transform || 'translateX(0)',
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <div
                    className={`w-4 md:w-6 rounded-t transition-all duration-300 ${
                      swapping.includes(idx)
                        ? 'bg-gradient-to-b from-yellow-400 to-yellow-600'
                        : sortedIndices.includes(idx)
                        ? 'bg-gradient-to-b from-green-400 to-green-600'
                        : 'bg-gradient-to-b from-blue-400 to-blue-600'
                    }`}
                    style={{ height: `${value * 2}px` }}
                  />
                  <span className="mt-1 text-xs text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BubbleSortVisualizer;
