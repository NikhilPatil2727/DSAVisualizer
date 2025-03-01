import React, { useState, useEffect, useRef } from 'react';

const LinearSearchVisualizer = () => {
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isFound, setIsFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [searchHistory, setSearchHistory] = useState([]);
  const [result, setResult] = useState('');

  // useRef to handle cancellation of the search
  const cancelFlag = useRef(false);

  // Generate a new random array and reset search state
  const generateNewArray = () => {
    const newArray = Array.from({ length: 15 }, () =>
      Math.floor(Math.random() * 90 + 10)
    );
    setArray(newArray);
    resetSearch();
  };

  // Reset the search progress without changing the array
  const resetSearch = () => {
    cancelFlag.current = false;
    setCurrentIndex(-1);
    setIsFound(false);
    setIsSearching(false);
    setResult('');
    setSearchHistory([]);
  };

  // Helper function to run the search starting from a given index
  const searchFromIndex = async (startIndex) => {
    setIsSearching(true);
    cancelFlag.current = false;
    let found = false;
    let i;
    for (i = startIndex; i < array.length; i++) {
      if (cancelFlag.current) {
        setResult('Search stopped.');
        break;
      }
      setCurrentIndex(i);
      // Append the current index to search history
      setSearchHistory((prev) => [...prev, i]);

      // Delay for visualization based on speed setting
      await new Promise((resolve) => setTimeout(resolve, speed));

      if (array[i].toString() === target.toString()) {
        setIsFound(true);
        setResult(`Element found at position ${i + 1}`);
        found = true;
        break;
      }
    }
    if (!found && !cancelFlag.current && i === array.length) {
      setResult('Element not found');
    }
    setIsSearching(false);
  };

  // Start search from the beginning (only if not already started)
  const startSearch = async () => {
    if (!target || target < 10 || target > 99) {
      setResult('Please enter a valid target between 10 and 99.');
      return;
    }
    // Reset previous search progress
    setSearchHistory([]);
    setCurrentIndex(-1);
    setIsFound(false);
    setResult('');
    await searchFromIndex(0);
  };

  // Resume search from the next index after the last processed one
  const resumeSearch = async () => {
    if (isSearching || isFound) return;
    if (currentIndex < 0 || currentIndex >= array.length - 1) {
      setResult('Element not found');
      return;
    }
    await searchFromIndex(currentIndex + 1);
  };

  // Stop an ongoing search by setting the cancel flag
  const stopSearch = () => {
    if (isSearching) {
      cancelFlag.current = true;
    }
  };

  // Get the style for each array element based on its search state
  const getBoxStyle = (index) => {
    // Add a custom animation to the found element
    if (isFound && index === currentIndex) return 'bg-green-500 found-animation scale-110';
    if (index === currentIndex) return 'bg-blue-500 scale-110';
    if (searchHistory.includes(index)) return 'bg-gray-300';
    return 'bg-white hover:bg-gray-100';
  };

  useEffect(() => {
    generateNewArray();
  }, []);

  return (
    <>
      {/* Inline custom CSS for professional animations */}
      <style>{`
        @keyframes foundAnimation {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .found-animation {
          animation: foundAnimation 1s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-grow">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-800">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                Linear Search Visualizer
              </span>
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Visualize the linear search algorithm step-by-step
            </p>
          </header>

          {/* Controls */}
          <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Target Element Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Element
                </label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  disabled={isSearching}
                  min="10"
                  max="99"
                  placeholder="Enter a number (10-99)"
                />
              </div>

              {/* Speed Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speed ({speed}ms)
                </label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={startSearch}
                disabled={isSearching || target === '' || currentIndex !== -1}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                Start Search
              </button>
              <button
                onClick={resumeSearch}
                disabled={
                  isSearching ||
                  currentIndex === -1 ||
                  isFound ||
                  currentIndex >= array.length - 1
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
              >
                Resume Search
              </button>
              <button
                onClick={stopSearch}
                disabled={!isSearching}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition"
              >
                Stop Search
              </button>
              <button
                onClick={resetSearch}
                disabled={isSearching}
                className="flex-1 px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 transition"
              >
                Reset Search
              </button>
              <button
                onClick={generateNewArray}
                disabled={isSearching}
                className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 transition"
              >
                New Array
              </button>
            </div>
          </section>

          {/* Visualization */}
          <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Number Array Visualization
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {array.map((num, index) => (
                <div
                  key={index}
                  className={`${getBoxStyle(index)} transition-all duration-300 
                    w-16 h-16 rounded-lg flex items-center justify-center 
                    shadow border border-gray-300 text-lg font-semibold`}
                >
                  {num}
                </div>
              ))}
            </div>
            {result && (
              <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200">
                <p className="text-blue-800 font-medium text-center">{result}</p>
              </div>
            )}
          </section>

          {/* Algorithm Information */}
          <section className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Linear Search Complexity
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Time Complexity</h3>
                  <p>
                    <span className="font-medium">Best Case:</span> O(1) - Found at first position
                  </p>
                  <p>
                    <span className="font-medium">Average Case:</span> O(n) - Found in middle
                  </p>
                  <p>
                    <span className="font-medium">Worst Case:</span> O(n) - Not found
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Space Complexity</h3>
                  <p>O(1) - Constant space for pointers</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Algorithm Steps
              </h2>
              <ol className="list-decimal list-inside space-y-3">
                <li className="p-3 bg-gray-50 rounded-lg">Start from the leftmost element</li>
                <li className="p-3 bg-gray-50 rounded-lg">Compare the current element with the target</li>
                <li className="p-3 bg-gray-50 rounded-lg">If they match, return the index position</li>
                <li className="p-3 bg-gray-50 rounded-lg">If not, move to the next element</li>
                <li className="p-3 bg-gray-50 rounded-lg">Repeat until found or the end is reached</li>
              </ol>
            </div>
          </section>
        </div>
        
        {/* Footer */}
        <footer className="text-center py-4 text-gray-600">
          © {new Date().getFullYear()} Linear Search Visualizer. All rights reserved.
        </footer>
      </div>
    </>
  );
};

export default LinearSearchVisualizer;
