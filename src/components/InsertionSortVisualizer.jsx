import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InsertionSortVisualizer = () => {
  const [array, setArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [compareIndex, setCompareIndex] = useState(-1);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [speed, setSpeed] = useState(800);
  const [swapping, setSwapping] = useState(false);
  
  const sortingRef = useRef(null);

  // Generate a random array
  const generateArray = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 99) + 1);
    setArray(newArray);
    resetState();
  };

  const resetState = () => {
    setCurrentIndex(-1);
    setCompareIndex(-1);
    setSortedIndices([]);
    setSorting(false);
    setPaused(false);
    setSwapping(false);
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
  }, []);

  const sleep = (ms) => new Promise((resolve) => {
    sortingRef.current = setTimeout(resolve, ms);
  });

  const pauseSort = () => {
    setPaused(true);
    toast.info("Sorting paused! Click 'Reset' to start over.", {
      position: "top-center",
      autoClose: 3000,
    });
  };

  // Enhanced Insertion Sort with smooth animations
  const insertionSort = async () => {
    if (sorting) return;
    setSorting(true);

    const arr = [...array];
    const n = arr.length;

    for (let i = 1; i < n && !paused; i++) {
      setCurrentIndex(i);
      let j = i - 1;
      const key = arr[i];

      while (j >= 0 && arr[j] > key && !paused) {
        setCompareIndex(j);
        await sleep(speed);

        // Animate swap
        setSwapping(true);
        arr[j + 1] = arr[j];
        setArray([...arr]);
        await sleep(speed / 2);
        setSwapping(false);

        j--;
      }

      arr[j + 1] = key;
      setArray([...arr]);
      setSortedIndices((prev) => [...prev, j + 1]);
      await sleep(speed);
    }

    if (!paused) {
      setCurrentIndex(-1);
      setCompareIndex(-1);
      setSorting(false);
      toast.success("Sorting completed!", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <ToastContainer />
      
      {/* Enhanced Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Insertion Sort Visualizer
        </h1>
        <p className="text-slate-600 text-lg">
          Watch how insertion sort organizes data, one element at a time
        </p>
      </div>

      {/* Visualization Section */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex justify-center items-end gap-2 md:gap-4 h-[400px]">
          <AnimatePresence>
            {array.map((value, idx) => (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: swapping && (idx === currentIndex || idx === compareIndex) ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`flex flex-col items-center justify-end relative ${
                  idx === currentIndex
                    ? 'bg-gradient-to-t from-red-500 to-red-400'
                    : idx === compareIndex
                    ? 'bg-gradient-to-t from-yellow-500 to-yellow-400'
                    : sortedIndices.includes(idx)
                    ? 'bg-gradient-to-t from-green-500 to-green-400'
                    : 'bg-gradient-to-t from-blue-500 to-blue-400'
                } rounded-xl shadow-lg`}
                style={{ width: '60px', height: `${value * 3}px` }}
              >
                <span className="absolute -top-6 text-slate-700 font-medium">{value}</span>
                <div className="h-2 w-full bg-white/20 rounded-t-xl" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Controls Section */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={generateArray}
          disabled={sorting && !paused}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 
                   hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium 
                   rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100
                   disabled:cursor-not-allowed shadow-md"
        >
          Generate New Array
        </button>
        <button
          onClick={insertionSort}
          disabled={sorting || paused}
          className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 
                   hover:to-purple-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium 
                   rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100
                   disabled:cursor-not-allowed shadow-md"
        >
          Sort Array
        </button>
        <button
          onClick={pauseSort}
          disabled={!sorting || paused}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 
                   hover:to-orange-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium 
                   rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100
                   disabled:cursor-not-allowed shadow-md"
        >
          Pause
        </button>
        <button
          onClick={resetState}
          disabled={!sorting && !paused}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 
                   hover:to-pink-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium 
                   rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100
                   disabled:cursor-not-allowed shadow-md"
        >
          Reset
        </button>
        
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
          <label htmlFor="speed" className="text-slate-700 font-medium">
            Speed:
          </label>
          <input
            id="speed"
            type="range"
            min="200"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-40 accent-purple-500"
          />
          <span className="text-slate-700 min-w-[70px]">{speed}ms</span>
        </div>
      </div>

      {/* Status Section */}
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Current Status</h2>
        <p className="text-lg text-slate-600">
          {paused 
            ? "Sorting paused. Click 'Reset' to start over."
            : sorting
            ? `Inserting element ${array[currentIndex]} into its correct position...`
            : "Ready to sort! Click 'Sort Array' to begin."}
        </p>
      </div>
    </div>
  );
};

export default InsertionSortVisualizer;
