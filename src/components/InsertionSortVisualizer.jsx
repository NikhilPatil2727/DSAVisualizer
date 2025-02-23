import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InsertionSortVisualizer = () => {
  const [array, setArray] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(null);
  const [compareIndex, setCompareIndex] = useState(null);
  const [sortedBoundary, setSortedBoundary] = useState(0);
  const [speed, setSpeed] = useState(500);
  const [comparisons, setComparisons] = useState(0);
  const [shifts, setShifts] = useState(0);
  const [status, setStatus] = useState("Ready to sort!");
  const cancelRef = useRef(false);
  const resumeStateRef = useRef(null);

  useEffect(() => {
    generateArray();
    return () => {
      cancelRef.current = true;
    };
  }, []);

  // Array generation and reset logic
  const generateArray = () => {
    cancelRef.current = false;
    resumeStateRef.current = null;
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 99) + 1);
    setArray(newArray);
    setIsSorting(false);
    setCurrentKeyIndex(null);
    setCompareIndex(null);
    setSortedBoundary(0);
    setComparisons(0);
    setShifts(0);
    setStatus("New array generated. Ready to sort!");
  };

  const handleResetArray = () => {
    cancelRef.current = true;
    setTimeout(() => {
      generateArray();
      toast.info("Array has been reset.");
    }, 100);
  };

  // Sorting logic
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const insertionSort = async () => {
    if (isSorting) return;
    setIsSorting(true);

    let arr = resumeStateRef.current?.arr ? [...resumeStateRef.current.arr] : [...array];
    let i = resumeStateRef.current?.i !== undefined ? resumeStateRef.current.i : 1;
    const n = arr.length;

    if (resumeStateRef.current?.j !== undefined) {
      let key = resumeStateRef.current.key;
      let j = resumeStateRef.current.j;
      setCurrentKeyIndex(i);
      setStatus(`Resuming inner loop for key ${key}.`);
      await sleep(speed);
      
      while (j >= 0 && arr[j] > key) {
        if (cancelRef.current) {
          resumeStateRef.current = { i, j, key, arr };
          setIsSorting(false);
          toast.info("Sorting stopped.");
          return;
        }
        setCompareIndex(j);
        setStatus(`Comparing ${arr[j]} > ${key}? Shifting ${arr[j]} right.`);
        setComparisons(prev => prev + 1);
        await sleep(speed);
        arr[j + 1] = arr[j];
        setShifts(prev => prev + 1);
        setArray([...arr]);
        await sleep(speed);
        j--;
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setStatus(`Inserted ${key} at position ${j + 1}.`);
      setSortedBoundary(i + 1);
      await sleep(speed);
      resumeStateRef.current = null;
      i++;
    }

    for (; i < n; i++) {
      if (cancelRef.current) {
        resumeStateRef.current = { i, arr };
        setIsSorting(false);
        toast.info("Sorting stopped.");
        return;
      }
      const key = arr[i];
      setCurrentKeyIndex(i);
      setStatus(`Selecting element ${key} as the key.`);
      await sleep(speed);

      let j = i - 1;
      while (j >= 0 && arr[j] > key) {
        if (cancelRef.current) {
          resumeStateRef.current = { i, j, key, arr };
          setIsSorting(false);
          toast.info("Sorting stopped.");
          return;
        }
        setCompareIndex(j);
        setStatus(`Comparing ${arr[j]} > ${key}? Shifting ${arr[j]} right.`);
        setComparisons(prev => prev + 1);
        await sleep(speed);
        arr[j + 1] = arr[j];
        setShifts(prev => prev + 1);
        setArray([...arr]);
        await sleep(speed);
        j--;
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setStatus(`Inserted ${key} at position ${j + 1}.`);
      setSortedBoundary(i + 1);
      await sleep(speed);
    }

    setStatus("Sorting completed!");
    setCurrentKeyIndex(null);
    setCompareIndex(null);
    setIsSorting(false);
    toast.success(`Sorting completed! Comparisons: ${comparisons}, Shifts: ${shifts}`);
  };

  const handleStop = () => {
    if (!isSorting) return;
    cancelRef.current = true;
  };

  const handleResume = () => {
    cancelRef.current = false;
    insertionSort();
  };

  // Animation variants
  const barVariants = {
    default: { scale: 1, rotate: 0, backgroundColor: '#6366f1' },
    key: { 
      scale: 1.3, 
      rotate: 0,
      backgroundColor: '#ef4444',
      transition: { type: 'spring', stiffness: 300 }
    },
    compare: { 
      scale: [1, 1.2, 1],
      backgroundColor: '#eab308',
      transition: { duration: 0.4, repeat: Infinity }
    },
    sorted: {
      backgroundColor: '#10b981',
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          Insertion Sort Visualizer
        </h1>
        <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
          Interactive visualization of the insertion sort algorithm with real-time metrics and controls
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Visualization Section */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-end justify-center gap-1 md:gap-2 h-64 md:h-80">
            <AnimatePresence>
              {array.map((value, idx) => (
                <motion.div
                  key={idx}
                  layout
                  variants={barVariants}
                  animate={
                    idx === currentKeyIndex ? 'key' :
                    idx === compareIndex ? 'compare' :
                    idx < sortedBoundary ? 'sorted' : 'default'
                  }
                  className="relative rounded-t-lg shadow-lg flex items-center justify-center"
                  style={{ 
                    width: `${100 / array.length}%`,
                    height: `${value * 3}px`,
                    maxWidth: '60px'
                  }}
                >
                  <span className="absolute -top-8 text-sm font-medium text-slate-700">
                    {value}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Control Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Algorithm Controls</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleResetArray}
                className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
                disabled={isSorting}
              >
                ↻ GenerateArrayRandomly
              </button>
              {resumeStateRef.current ? (
                <button
                  onClick={handleResume}
                  disabled={isSorting}
                  className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  ▶ Resume
                </button>
              ) : (
                <button
                  onClick={insertionSort}
                  disabled={isSorting}
                  className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  🚀 Start Sort
                </button>
              )}
              <button
                onClick={handleStop}
                disabled={!isSorting}
                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all col-span-2 disabled:opacity-50"
              >
                ⏹ Stop Sorting
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Sorting Metrics</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Comparisons</p>
                <p className="text-2xl font-bold text-blue-700">{comparisons}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Shifts</p>
                <p className="text-2xl font-bold text-green-700">{shifts}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-2">Animation Speed</label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full range range-primary"
                />
                <div className="flex justify-between text-sm text-slate-600 mt-2">
                  <span>Fast</span>
                  <span>{speed}ms</span>
                  <span>Slow</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Current Status</h2>
            <p className="text-slate-600">
              {status}
              <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-slate-600">
        <p className="text-sm">
          Visualizer designed with ❤️ using React & Tailwind CSS | 
          Educational tool for understanding sorting algorithms
        </p>
      </footer>
    </div>
  );
};

export default InsertionSortVisualizer;