import React, { useState, useEffect } from 'react';

const BubbleSortVisualizer = () => {
  const [array, setArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [swapping, setSwapping] = useState([-1, -1]); // Indices of elements being swapped
  const [swapPositions, setSwapPositions] = useState({}); // Positions for swap animation

  const generateArray = () => {
    const newArray = Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 99) + 1
    );
    setArray(newArray);
    setSwapping([-1, -1]);
    setSwapPositions({});
  };

  useEffect(() => {
    generateArray();
  }, []);

  const bubbleSort = async () => {
    setSorting(true);
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setSwapping([j, j + 1]); // Highlight the elements being compared
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (arr[j] > arr[j + 1]) {
          // Animate the swap
          setSwapPositions({
            [j]: { transform: `translateX(${100}%)` },
            [j + 1]: { transform: `translateX(${-100}%)` },
          });
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Swap elements in the array
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;

          // Update the array and reset swap positions
          setArray([...arr]);
          setSwapPositions({});
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    }
    setSwapping([-1, -1]); // Reset swapping indices
    setSorting(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-50 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Bubble Sort Visualizer</h1>

      {/* Information Section */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">About Bubble Sort</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Algorithm Overview</h3>
            <p className="text-slate-600">
              Bubble Sort is a simple sorting algorithm that repeatedly steps through the list,
              compares adjacent elements, and swaps them if they are in the wrong order.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Complexity Analysis</h3>
            <ul className="space-y-2 text-slate-600">
              <li>
                <span className="font-medium">Time Complexity:</span>
                <ul className="ml-4">
                  <li>• Best Case: O(n) - when array is already sorted</li>
                  <li>• Average Case: O(n²)</li>
                  <li>• Worst Case: O(n²)</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">Space Complexity:</span> O(1)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Visualization Section */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-4 md:p-8 mb-8">
        <div className="flex items-end justify-center h-[400px] gap-1 md:gap-2">
          {array.map((value, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center transition-all duration-300 ${
                swapping.includes(idx) ? 'scale-110' : ''
              }`}
              style={{
                transform: swapPositions[idx]?.transform || 'translateX(0)',
                transition: 'transform 0.3s ease-in-out',
              }}
            >
              <div
                className={`w-6 md:w-12 transition-all duration-300 rounded-t-md ${
                  swapping.includes(idx)
                    ? 'bg-gradient-to-b from-red-400 to-red-600'
                    : 'bg-gradient-to-b from-blue-400 to-blue-600'
                }`}
                style={{ height: `${value * 3}px` }}
              />
              <span
                className={`text-xs md:text-sm font-medium mt-2 ${
                  swapping.includes(idx) ? 'text-red-600' : 'text-slate-700'
                }`}
              >
                {value}
              </span>
            </div>
          ))}
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
          onClick={bubbleSort}
          disabled={sorting}
          className="px-6 py-3 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-400 
                     text-white font-medium rounded-lg transition-colors duration-200
                     disabled:cursor-not-allowed"
        >
          Sort Array
        </button>
      </div>

      {/* Additional Information Section */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Performance Characteristics</h3>
        <ul className="list-disc list-inside text-slate-600 space-y-2">
          <li>Stable sorting algorithm - maintains relative order of equal elements</li>
          <li>In-place algorithm - requires only a constant amount of additional memory space</li>
          <li>Adaptive - becomes faster when data is nearly sorted</li>
          <li>Simple implementation but inefficient for large datasets</li>
        </ul>
      </div>
    </div>
  );
};

export default BubbleSortVisualizer;