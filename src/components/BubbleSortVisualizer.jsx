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
  const [sorting, setSorting] = useState(false);
  const [paused, setPaused] = useState(false);
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
  const pausedRef = useRef(false);
  const startTimeRef = useRef(null);

  const generateArray = () => {
    const newArray = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 99) + 1
    );
    resetState(newArray);
  };

  const resetState = (newArray = array) => {
    setArray(newArray);
    setSorting(false);
    setPaused(false);
    pausedRef.current = false;
    setSwapping([-1, -1]);
    setSwapPositions({});
    setSortedIndices([]);
    setStats({ comparisons: 0, swaps: 0, timeElapsed: 0 });
    startTimeRef.current = null;
    if (sortingRef.current) {
      clearTimeout(sortingRef.current);
    }
  };

  useEffect(() => {
    generateArray();
    return () => {
      if (sortingRef.current) {
        clearTimeout(sortingRef.current);
      }
    };
  }, [arraySize]);

  const sleep = (ms) => new Promise((resolve) => {
    sortingRef.current = setTimeout(resolve, ms);
  });

  const updateStats = (comparisons, swaps) => {
    const currentTime = Date.now();
    const timeElapsed = startTimeRef.current ? currentTime - startTimeRef.current : 0;
    setStats({ comparisons, swaps, timeElapsed });
  };

  const bubbleSort = async () => {
    startTimeRef.current = Date.now();
    setSorting(true);
    let comparisons = 0;
    let swaps = 0;
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;

      for (let j = 0; j < n - i - 1; j++) {
        if (pausedRef.current) return;

        setSwapping([j, j + 1]);
        comparisons++;
        updateStats(comparisons, swaps);
        await sleep(speed);

        if (arr[j] > arr[j + 1]) {
          // Animate swap
          setSwapPositions({
            [j]: { transform: `translateX(${100}%)` },
            [j + 1]: { transform: `translateX(${-100}%)` },
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

      setSortedIndices(prev => [...prev, n - 1 - i]);

      if (!swapped) {
        // Array is sorted
        setSortedIndices(Array.from({ length: n }, (_, i) => i));
        break;
      }
    }

    setSwapping([-1, -1]);
    setSorting(false);
    setPaused(false);
    pausedRef.current = false;
  };

  const handleSortingControl = () => {
    if (!sorting) {
      setPaused(false);
      pausedRef.current = false;
      bubbleSort();
    } else {
      setPaused(true);
      pausedRef.current = true;
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">Bubble Sort Visualizer</h1>

      {/* Info Panel */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">About Bubble Sort</h2>
        <p className="text-slate-700 mb-2">
          Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.
        </p>
        <p className="text-slate-700 mb-2">
          <strong>Time Complexity:</strong> O(n²) in the worst and average case, where n is the number of items being sorted.
        </p>
        <p className="text-slate-700 mb-2">
          <strong>Space Complexity:</strong> O(1), as it requires only a constant amount of additional memory space.
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              <div>
                <h3 className="text-sm text-slate-600">Comparisons</h3>
                <p className="text-xl font-bold text-slate-800">{stats.comparisons}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-sm text-slate-600">Swaps</h3>
                <p className="text-xl font-bold text-slate-800">{stats.swaps}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <div>
                <h3 className="text-sm text-slate-600">Time Elapsed</h3>
                <p className="text-xl font-bold text-slate-800">
                  {Math.floor(stats.timeElapsed / 1000)}s
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="text-sm text-slate-600">Array Size</h3>
                <p className="text-xl font-bold text-slate-800">{arraySize}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-end justify-center h-[400px] gap-2">
          {array.map((value, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center transition-all duration-300
                ${swapping.includes(idx) ? 'scale-110' : ''}`}
              style={{
                transform: swapPositions[idx]?.transform || 'translateX(0)',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <div
                className={`w-8 md:w-12 transition-all duration-300 rounded-t-md
                  ${swapping.includes(idx)
                    ? 'bg-gradient-to-b from-yellow-400 to-yellow-600'
                    : sortedIndices.includes(idx)
                    ? 'bg-gradient-to-b from-green-400 to-green-600'
                    : 'bg-gradient-to-b from-blue-400 to-blue-600'
                  }`}
                style={{ height: `${value * 3}px` }}
              />
              <span
                className={`text-xs md:text-sm font-medium mt-2
                  ${swapping.includes(idx)
                    ? 'text-yellow-600'
                    : sortedIndices.includes(idx)
                    ? 'text-green-600'
                    : 'text-slate-700'
                  }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-4xl flex flex-wrap gap-4 justify-center mb-8">
        <button
          onClick={generateArray}
          disabled={sorting}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400
                   text-white font-medium rounded-lg transition-colors duration-200
                   disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FaRandom />
          Generate New Array
        </button>
        <button
          onClick={handleSortingControl}
          className={`px-6 py-3 ${
            sorting && !paused
              ? 'bg-yellow-500 hover:bg-yellow-600'
              : paused
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-violet-500 hover:bg-violet-600'
          } text-white font-medium rounded-lg transition-colors duration-200
             flex items-center gap-2`}
        >
          {sorting && !paused ? <FaPause /> : <FaPlay />}
          {sorting && !paused ? "Pause Sorting" : paused ? "Resume Sorting" : "Start Sorting"}
        </button>
        <button
          onClick={() => resetState()}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600
                   text-white font-medium rounded-lg transition-colors duration-200
                   flex items-center gap-2"
        >
          <FaUndo />
          Reset Array
        </button>

        {/* Speed Control */}
        <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <MdSpeed className="text-slate-600 text-xl" />
            <span className="text-slate-700 font-medium">
              Speed: {SPEED_OPTIONS[speed] || 'Custom'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Fast</span>
            <input
              type="range"
              min="100"
              max="1000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-slate-500">Slow</span>
          </div>
          <span className="text-xs text-slate-400">
            {speed}ms delay
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-600">Array Size:</span>
          <input
            type="number"
            min="5"
            max="50"
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            className="w-20 p-2 border rounded"
          />
        </div>
      </div>

      {/* Pause Message */}
      {paused && (
        <div className="w-full max-w-4xl bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg mb-8">
          <p className="text-center font-medium">
            Sorting is paused. You can reset the sorting process.
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-slate-600 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Comparing Elements</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Sorted Elements</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Unsorted Elements</span>
        </div>
      </div>
    </div>
  );
};

export default BubbleSortVisualizer;
