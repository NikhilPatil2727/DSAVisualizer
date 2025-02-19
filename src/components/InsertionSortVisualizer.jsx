import React, { useState, useEffect } from 'react';

const InsertionSortVisualizer = () => {
  const [array, setArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1); // Current element being inserted
  const [compareIndex, setCompareIndex] = useState(-1); // Element being compared
  const [sortedIndices, setSortedIndices] = useState([]); // Indices of sorted elements
  const [speed, setSpeed] = useState(800); // Animation speed in milliseconds

  // Generate a random array
  const generateArray = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 99) + 1);
    setArray(newArray);
    setCurrentIndex(-1);
    setCompareIndex(-1);
    setSortedIndices([]);
  };

  useEffect(() => {
    generateArray();
  }, []);

  // Insertion Sort Algorithm with step-by-step visualization
  const insertionSort = async () => {
    if (sorting) return;
    setSorting(true);

    const arr = [...array];
    const n = arr.length;

    for (let i = 1; i < n; i++) {
      setCurrentIndex(i); // Highlight the current element being inserted
      let j = i - 1;
      const key = arr[i];

      // Step-by-step comparison and shifting
      while (j >= 0 && arr[j] > key) {
        setCompareIndex(j); // Highlight the element being compared
        await new Promise((resolve) => setTimeout(resolve, speed));

        // Shift elements to the right
        arr[j + 1] = arr[j];
        setArray([...arr]);
        await new Promise((resolve) => setTimeout(resolve, speed));
        j--;
      }

      // Insert the key in its correct position
      arr[j + 1] = key;
      setArray([...arr]);
      setSortedIndices((prev) => [...prev, j + 1]); // Mark this index as sorted
      await new Promise((resolve) => setTimeout(resolve, speed));
    }

    setCurrentIndex(-1);
    setCompareIndex(-1);
    setSorting(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      {/* Title */}
      <h1 className="text-4xl font-bold text-slate-800 mb-8">Insertion Sort Visualizer</h1>

      {/* Information Section */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">How It Works</h2>
        <p className="text-slate-600 mb-4">
          Insertion Sort builds the final sorted array one element at a time. It iterates through the array,
          comparing each element with the previous ones and inserting it into its correct position.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Algorithm Steps</h3>
            <ul className="list-disc list-inside text-slate-600">
              <li>Start with the second element (red box).</li>
              <li>Compare it with the previous elements (yellow boxes).</li>
              <li>Shift larger elements to the right.</li>
              <li>Insert the element in its correct position.</li>
              <li>Repeat until the array is sorted.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Complexity</h3>
            <ul className="text-slate-600">
              <li><span className="font-medium">Time Complexity:</span> O(n²)</li>
              <li><span className="font-medium">Space Complexity:</span> O(1)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Visualization Section */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-center items-end gap-2 md:gap-4 h-[300px]">
          {array.map((value, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-end transition-all duration-300 ${
                idx === currentIndex
                  ? 'bg-red-500'
                  : idx === compareIndex
                  ? 'bg-yellow-500'
                  : sortedIndices.includes(idx)
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              } rounded-t-lg shadow-md`}
              style={{ width: '60px', height: `${value * 3}px` }}
            >
              <span className="text-white font-medium text-sm mb-1">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center text-slate-600">
          <p>
            <span className="font-medium">Current Element:</span>{" "}
            <span className="text-red-500">Red</span>
          </p>
          <p>
            <span className="font-medium">Compared Element:</span>{" "}
            <span className="text-yellow-500">Yellow</span>
          </p>
          <p>
            <span className="font-medium">Sorted Elements:</span>{" "}
            <span className="text-green-500">Green</span>
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={generateArray}
          disabled={sorting}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 
                     text-white font-medium rounded-lg transition-colors duration-200
                     disabled:cursor-not-allowed"
        >
          Generate New Array
        </button>
        <button
          onClick={insertionSort}
          disabled={sorting}
          className="px-6 py-3 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-400 
                     text-white font-medium rounded-lg transition-colors duration-200
                     disabled:cursor-not-allowed"
        >
          Sort Array
        </button>
        <div className="flex items-center gap-2">
          <label htmlFor="speed" className="text-slate-600 font-medium">
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
            className="w-40"
          />
          <span className="text-slate-600">{speed}ms</span>
        </div>
      </div>

      {/* Real-Time Explanation Section */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">What's Happening?</h2>
        <p className="text-slate-600">
          {sorting
            ? `Currently inserting element ${currentIndex + 1} into its correct position.`
            : "Click 'Sort Array' to start the visualization."}
        </p>
      </div>
    </div>
  );
};

export default InsertionSortVisualizer;