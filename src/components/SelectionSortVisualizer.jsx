import React, { useState, useEffect } from 'react';

const SelectionSortVisualizer = () => {
  const [array, setArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [minIndex, setMinIndex] = useState(-1); // Index of the minimum element
  const [currentIndex, setCurrentIndex] = useState(-1); // Current element being compared
  const [sortedIndices, setSortedIndices] = useState([]); // Indices of sorted elements
  const [swapping, setSwapping] = useState(false); // State to trigger swap animation

  // Generate a random array
  const generateArray = () => {
    const newArray = Array.from({ length: 10 }, () =>
      Math.floor(Math.random() * 99) + 1
    );
    setArray(newArray);
    setMinIndex(-1);
    setCurrentIndex(-1);
    setSortedIndices([]);
    setSwapping(false);
  };

  useEffect(() => {
    generateArray();
  }, []);

  // Selection Sort Algorithm
  const selectionSort = async () => {
    setSorting(true);
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      setMinIndex(minIdx); // Highlight the current minimum element
      await new Promise((resolve) => setTimeout(resolve, 800));

      for (let j = i + 1; j < n; j++) {
        setCurrentIndex(j); // Highlight the element being compared
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          setMinIndex(minIdx); // Update the minimum element
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Swap the minimum element with the first unsorted element
      if (minIdx !== i) {
        setSwapping(true); // Trigger swap animation
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Swap elements
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        setArray([...arr]);

        await new Promise((resolve) => setTimeout(resolve, 800));
        setSwapping(false); // Reset swap animation
      }

      setSortedIndices((prev) => [...prev, i]); // Mark this index as sorted
    }

    setSortedIndices((prev) => [...prev, n - 1]); // Mark the last element as sorted
    setMinIndex(-1);
    setCurrentIndex(-1);
    setSorting(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">Selection Sort Visualizer</h1>

      {/* Information Section */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">How It Works</h2>
        <p className="text-slate-600 mb-4">
          Selection Sort works by repeatedly finding the minimum element from the unsorted portion of the array and swapping it with the first unsorted element.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Algorithm Steps</h3>
            <ul className="list-disc list-inside text-slate-600">
              <li>Find the minimum element in the unsorted portion (red box).</li>
              <li>Compare it with other elements (yellow boxes).</li>
              <li>Swap it with the first unsorted element.</li>
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
                idx === minIndex
                  ? 'bg-red-500'
                  : idx === currentIndex
                  ? 'bg-yellow-500'
                  : sortedIndices.includes(idx)
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              } rounded-t-lg shadow-md`}
              style={{
                width: '60px',
                height: `${value * 3}px`,
                transform: swapping && (idx === minIndex || idx === currentIndex) ? 'translateY(-20px)' : 'translateY(0)',
                transition: 'transform 0.5s ease-in-out',
              }}
            >
              <span className="text-white font-medium text-sm mb-1">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center text-slate-600">
          <p>
            <span className="font-medium">Minimum Element:</span>{" "}
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
          onClick={selectionSort}
          disabled={sorting}
          className="px-6 py-3 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-400 
                     text-white font-medium rounded-lg transition-colors duration-200
                     disabled:cursor-not-allowed"
        >
          Sort Array
        </button>
      </div>
    </div>
  );
};

export default SelectionSortVisualizer;