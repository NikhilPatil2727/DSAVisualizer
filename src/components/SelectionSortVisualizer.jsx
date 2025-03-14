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

const DEFAULT_ARRAY_SIZE = 10;

const SelectionSortVisualizer = () => {
  const [array, setArray] = useState([]);
  // Save the generated unsorted order for resetting.
  const originalArrayRef = useRef([]);

  const [sorting, setSorting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [minIndex, setMinIndex] = useState(-1);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [stats, setStats] = useState({
    comparisons: 0,
    swaps: 0,
    timeElapsed: 0
  });
  const [animationStates, setAnimationStates] = useState({});

  // For resuming sorting without losing stats.
  const [currentOuterIndex, setCurrentOuterIndex] = useState(0);
  const [currentInnerIndex, setCurrentInnerIndex] = useState(null);

  const sortingRef = useRef(null);
  const pausedRef = useRef(false);
  const startTimeRef = useRef(null);

  // Generates a new array and resets all stats.
  const generateArray = () => {
    if (sortingRef.current) clearTimeout(sortingRef.current);
    const newArray = Array.from({ length: DEFAULT_ARRAY_SIZE }, () =>
      Math.floor(Math.random() * 99) + 1
    );
    // Save the generated unsorted order for resetting.
    originalArrayRef.current = [...newArray];
    setArray(newArray);
    setSorting(false);
    setPaused(false);
    pausedRef.current = false;
    setMinIndex(-1);
    setCurrentIndex(-1);
    setSortedIndices([]);
    // Reset stats.
    setStats({ comparisons: 0, swaps: 0, timeElapsed: 0 });
    startTimeRef.current = null;
    setAnimationStates({});
    setCurrentOuterIndex(0);
    setCurrentInnerIndex(null);
  };

  // Reset: cancel any running sort and revert the array and stats.
  const resetState = () => {
    if (sortingRef.current) clearTimeout(sortingRef.current);
    // Revert array to its initial unsorted order.
    setArray([...originalArrayRef.current]);
    setSorting(false);
    setPaused(false);
    pausedRef.current = false;
    setMinIndex(-1);
    setCurrentIndex(-1);
    setSortedIndices([]);
    // Reset stats and start time.
    setStats({ comparisons: 0, swaps: 0, timeElapsed: 0 });
    startTimeRef.current = null;
    setAnimationStates({});
    setCurrentOuterIndex(0);
    setCurrentInnerIndex(null);
  };

  useEffect(() => {
    generateArray();
    return () => {
      if (sortingRef.current) clearTimeout(sortingRef.current);
    };
  }, []);

  const sleep = (ms) =>
    new Promise((resolve) => {
      sortingRef.current = setTimeout(resolve, ms);
    });

  const updateStats = (comparisons, swaps) => {
    const currentTime = Date.now();
    const timeElapsed = startTimeRef.current ? currentTime - startTimeRef.current : 0;
    setStats({ comparisons, swaps, timeElapsed });
  };

  const selectionSort = async () => {
    if (!startTimeRef.current) startTimeRef.current = Date.now();
    setSorting(true);
    let comparisons = stats.comparisons;
    let swaps = stats.swaps;
    const arr = [...array];
    const n = arr.length;
    let i = currentOuterIndex;
    for (; i < n - 1; i++) {
      // Reset minIdx to the current index unless we're resuming a paused iteration.
      let minIdx =
        i === currentOuterIndex && currentInnerIndex !== null && minIndex !== -1
          ? minIndex
          : i;
      setMinIndex(minIdx);
      let j =
        i === currentOuterIndex && currentInnerIndex !== null
          ? currentInnerIndex
          : i + 1;
      for (; j < n; j++) {
        if (pausedRef.current) {
          setCurrentOuterIndex(i);
          setCurrentInnerIndex(j);
          return;
        }
        setCurrentIndex(j);
        comparisons++;
        updateStats(comparisons, swaps);
        await sleep(speed / 2);
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          setMinIndex(minIdx);
          await sleep(speed / 2);
        }
      }
      setCurrentInnerIndex(null);
      if (minIdx !== i) {
        // Show swap animation.
        setAnimationStates({
          [i]: { swapping: true, swapTranslate: (minIdx - i) * 50 },
          [minIdx]: { swapping: true, swapTranslate: (i - minIdx) * 50 }
        });
        await sleep(speed);
        swaps++;
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray([...arr]);
        updateStats(comparisons, swaps);
        await sleep(speed / 2);
        setAnimationStates({});
      }
      // Mark the element at index i as sorted and clear active markers.
      setSortedIndices((prev) => [...prev, i]);
      setMinIndex(-1);
      setCurrentIndex(-1);
      setCurrentOuterIndex(i + 1);
    }
    // Mark the last element as sorted.
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
    setMinIndex(-1);
    setCurrentIndex(-1);
    setSorting(false);
    setPaused(false);
    pausedRef.current = false;
    setCurrentOuterIndex(0);
    setCurrentInnerIndex(null);
  };

  const handleSortingControl = () => {
    if (!sorting) {
      setPaused(false);
      pausedRef.current = false;
      selectionSort();
    } else {
      if (!paused) {
        setPaused(true);
        pausedRef.current = true;
      } else {
        setPaused(false);
        pausedRef.current = false;
        selectionSort();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-auto bg-gradient-to-br from-purple-100 to-blue-200 p-4 md:p-8">
      {/* CSS Keyframes for swap animation */}
      <style>{`
        @keyframes swapMove {
          0% { transform: translate(0, 0); }
          30% { transform: translate(0, -20px); }
          70% { transform: translate(var(--swap-translate), -20px); }
          100% { transform: translate(var(--swap-translate), 0); }
        }
      `}</style>

      <header className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Selection Sort Visualizer
        </h1>
        <p className="mt-2 text-lg text-slate-700">
          Watch the sorting process come to life!
        </p>
      </header>

      {/* Stats Dashboard */}
      <section className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center">
            <span className="text-2xl">🔄</span>
            <h3 className="text-sm text-slate-600 mt-1">Comparisons</h3>
            <p className="text-xl font-bold text-slate-800">{stats.comparisons}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center">
            <span className="text-2xl">⚡</span>
            <h3 className="text-sm text-slate-600 mt-1">Swaps</h3>
            <p className="text-xl font-bold text-slate-800">{stats.swaps}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center">
            <span className="text-2xl">⏱️</span>
            <h3 className="text-sm text-slate-600 mt-1">Time Elapsed</h3>
            <p className="text-xl font-bold text-slate-800">
              {Math.floor(stats.timeElapsed / 1000)}s
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center">
            <span className="text-2xl">📊</span>
            <h3 className="text-sm text-slate-600 mt-1">Array Size</h3>
            <p className="text-xl font-bold text-slate-800">{DEFAULT_ARRAY_SIZE}</p>
          </div>
        </div>
      </section>

      {/* Array Visualization */}
      <section className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-center items-end gap-2 h-64 md:h-80 overflow-x-auto">
          {array.map((value, idx) => {
            // Reorder conditions so sorted elements have highest priority.
            let bgColor = 'bg-blue-500';
            if (sortedIndices.includes(idx)) bgColor = 'bg-green-500';
            else if (idx === minIndex) bgColor = 'bg-red-500';
            else if (idx === currentIndex) bgColor = 'bg-yellow-500';

            const swappingState = animationStates[idx];
            const barStyle = swappingState && swappingState.swapping
              ? {
                  width: '40px',
                  height: `${value * 3}px`,
                  animation: `swapMove ${speed / 1000}s ease-in-out forwards`,
                  "--swap-translate": `${swappingState.swapTranslate}px`
                }
              : {
                  width: '40px',
                  height: `${value * 3}px`,
                  transform: 'translateX(0px)',
                  transition: 'transform 0.3s ease-in-out'
                };

            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-end ${bgColor} rounded-t-lg shadow-md`}
                style={barStyle}
              >
                <span className="text-white font-medium text-sm mb-1">{value}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Controls */}
      <section className="w-full max-w-5xl mx-auto flex flex-wrap gap-4 justify-center mb-8">
        <button
          onClick={generateArray}
          disabled={sorting && !paused}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
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
          } text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-300`}
        >
          {sorting && !paused ? <FaPause /> : <FaPlay />}
          {sorting && !paused ? 'Pause Sorting' : paused ? 'Resume Sorting' : 'Start Sorting'}
        </button>
        <button
          onClick={resetState}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <FaUndo />
          Reset Array
        </button>
        {/* Speed Control */}
        <div className="flex flex-col items-center gap-2 bg-gray-100 p-4 rounded-lg shadow-sm w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <MdSpeed className="text-slate-600 text-xl" />
            <span className="text-slate-700 font-medium">
              Speed: {SPEED_OPTIONS[speed] || 'Custom'}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-sm text-slate-500">Fast</span>
            <input
              type="range"
              min="100"
              max="1000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-slate-500">Slow</span>
          </div>
          <span className="text-xs text-slate-400">{speed}ms delay</span>
        </div>
      </section>

      {/* Legend & Footer */}
      <footer className="text-center text-slate-600 text-sm">
        <div className="flex flex-wrap gap-4 justify-center mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Minimum Element</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Current Element</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Sorted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Unsorted</span>
          </div>
        </div>
        <p> SelectionSort Visualizer</p>
      </footer>
    </div>
  );
};

export default SelectionSortVisualizer;
