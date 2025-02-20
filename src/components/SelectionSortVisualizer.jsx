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

const SelectionSortVisualizer = () => {
  const [array, setArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [minIndex, setMinIndex] = useState(-1);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [arraySize, setArraySize] = useState(10);
  const [stats, setStats] = useState({
    comparisons: 0,
    swaps: 0,
    timeElapsed: 0
  });

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
    setMinIndex(-1);
    setCurrentIndex(-1);
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

  const selectionSort = async () => {
    startTimeRef.current = Date.now();
    setSorting(true);
    let comparisons = 0;
    let swaps = 0;
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      if (pausedRef.current) {
        return;
      }

      let minIdx = i;
      setMinIndex(minIdx);
      await sleep(speed);

      for (let j = i + 1; j < n; j++) {
        if (pausedRef.current) {
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

      if (minIdx !== i) {
        swaps++;
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray([...arr]);
        updateStats(comparisons, swaps);
        await sleep(speed);
      }

      setSortedIndices((prev) => [...prev, i]);
    }

    setSortedIndices((prev) => [...prev, n - 1]);
    setMinIndex(-1);
    setCurrentIndex(-1);
    setSorting(false);
    setPaused(false);
    pausedRef.current = false;
  };

  const handleSortingControl = () => {
    if (!sorting) {
      setPaused(false);
      pausedRef.current = false;
      selectionSort();
    } else {
      setPaused(true);
      pausedRef.current = true;
      generateArray(); // Generate new array when paused
      alert("Sorting paused. Click the 'Reset' button to reset the array.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">Selection Sort Visualizer</h1>

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
        <div className="flex justify-center items-end gap-2 h-[300px]">
          {array.map((value, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-end transition-all duration-300
                ${idx === minIndex ? 'bg-red-500' :
                  idx === currentIndex ? 'bg-yellow-500' :
                  sortedIndices.includes(idx) ? 'bg-green-500' :
                  'bg-blue-500'}
                rounded-t-lg shadow-md`}
              style={{ width: '40px', height: `${value * 3}px` }}
            >
              <span className="text-white font-medium text-sm mb-1">{value}</span>
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
          className={`px-6 py-3 ${sorting && !paused ? 'bg-yellow-500 hover:bg-yellow-600' :
                                 paused ? 'bg-green-500 hover:bg-green-600' :
                                 'bg-violet-500 hover:bg-violet-600'}
                   text-white font-medium rounded-lg transition-colors duration-200
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

        {/* Enhanced Speed Control */}
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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-slate-600 justify-center">
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
    </div>
  );
};

export default SelectionSortVisualizer;
