import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
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
  const [swappingPair, setSwappingPair] = useState(null);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const sortingRef = useRef(null);

  useEffect(() => {
    generateArray();
    return () => {
      if (sortingRef.current) {
        clearTimeout(sortingRef.current);
      }
    };
  }, []);

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
    setSwappingPair(null);
    setComparisons(0);
    setSwaps(0);
    if (sortingRef.current) {
      clearTimeout(sortingRef.current);
    }
  };

  const sleep = (ms) => new Promise((resolve) => {
    sortingRef.current = setTimeout(resolve, ms);
  });

  const animateSwap = async (arr, j) => {
    setSwappingPair([j, j + 1]);
    await sleep(speed / 2);
    
    const temp = arr[j];
    arr[j] = arr[j + 1];
    arr[j + 1] = temp;
    
    setArray([...arr]);
    setSwaps(s => s + 1);
    await sleep(speed / 2);
    setSwappingPair(null);
  };

  const insertionSort = async () => {
    if (sorting) return;
    setSorting(true);
    setComparisons(0);
    setSwaps(0);

    const arr = [...array];
    const n = arr.length;

    for (let i = 1; i < n && !paused; i++) {
      setCurrentIndex(i);
      const key = arr[i];
      let j = i - 1;

      while (j >= 0 && !paused) {
        setCompareIndex(j);
        setComparisons(c => c + 1);
        await sleep(speed);

        if (arr[j] > key) {
          await animateSwap(arr, j);
          j--;
        } else {
          break;
        }
      }

      setSortedIndices(prev => [...prev, i]);
    }

    if (!paused) {
      setCurrentIndex(-1);
      setCompareIndex(-1);
      setSorting(false);
      toast.success(`Sorting completed! Comparisons: ${comparisons}, Swaps: ${swaps}`);
    } else {
      toast.info('Sorting paused. Click reset to start over.');
    }
  };

  const handlePause = () => {
    setPaused(true);
    toast.info('Sorting paused. Click reset to start over.');
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <ToastContainer />
      
      <h1 className="text-4xl font-bold text-slate-800 mb-8">Insertion Sort Visualizer</h1>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">How Insertion Sort Works</h2>
          <p className="text-slate-600">
            Insertion Sort is a simple sorting algorithm that builds the final sorted array one item at a time.
            It works by iterating through the array, comparing each element with the previous ones, and inserting it
            into its correct position in the sorted portion of the array. This process continues until the entire array is sorted.
          </p>
        </div>

        <LayoutGroup>
          <div className="flex justify-center items-end gap-2 md:gap-4 h-[400px]">
            <AnimatePresence mode="popLayout">
              {array.map((value, idx) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: swappingPair?.includes(idx) ? 1.1 : 1,
                    x: swappingPair?.includes(idx) 
                      ? (swappingPair[0] === idx ? 40 : -40) 
                      : 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className={`relative ${
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
                  <motion.span 
                    className="absolute -top-6 text-slate-700 font-medium"
                    animate={{ scale: swappingPair?.includes(idx) ? 1.2 : 1 }}
                  >
                    {value}
                  </motion.span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={generateArray}
          disabled={sorting && !paused}
          className="px-6 py-3 bg-emerald-500 text-white rounded-lg disabled:bg-gray-400"
        >
          Generate New Array
        </button>
        <button
          onClick={insertionSort}
          disabled={sorting || paused}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:bg-gray-400"
        >
          Sort
        </button>
        <button
          onClick={handlePause}
          disabled={!sorting || paused}
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg disabled:bg-gray-400"
        >
          Pause
        </button>
        <button
          onClick={resetState}
          disabled={!sorting && !paused}
          className="px-6 py-3 bg-red-500 text-white rounded-lg disabled:bg-gray-400"
        >
          Reset
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="speed">Speed:</label>
          <input
            id="speed"
            type="range"
            min="100"
            max="1000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-blue-800">Comparisons</p>
            <p className="text-2xl font-bold text-blue-600">{comparisons}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-lg font-semibold text-green-800">Swaps</p>
            <p className="text-2xl font-bold text-green-600">{swaps}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsertionSortVisualizer;