import React, { useState, useEffect, useRef } from 'react';

const BinarySearchVisualizer = () => {
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState('');
  const [left, setLeft] = useState(-1);
  const [right, setRight] = useState(-1);
  const [mid, setMid] = useState(-1);
  const [isFound, setIsFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [searchHistory, setSearchHistory] = useState([]);
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState([]);
  const [theme, setTheme] = useState('violet'); // Options: violet, indigo, purple

  // Refs to hold current search range and pause flag
  const leftRef = useRef(-1);
  const rightRef = useRef(-1);
  const pausedRef = useRef(false);

  // Ref for the steps container to auto-scroll
  const stepsContainerRef = useRef(null);

  // Theme colors for different aspects of the UI
  const themeColors = {
    violet: {
      primary: 'from-violet-600 to-fuchsia-600',
      secondary: 'bg-violet-600 hover:bg-violet-700',
      accent: 'bg-fuchsia-600 hover:bg-fuchsia-700',
      highlight: 'bg-violet-500',
      range: 'bg-violet-100 border-violet-300',
      gradient: 'from-violet-50 to-fuchsia-50',
      text: 'text-violet-800',
      border: 'border-violet-200',
      pulse: 'rgba(139, 92, 246, 0.7)'
    },
    indigo: {
      primary: 'from-indigo-600 to-blue-600',
      secondary: 'bg-indigo-600 hover:bg-indigo-700',
      accent: 'bg-blue-600 hover:bg-blue-700',
      highlight: 'bg-indigo-500',
      range: 'bg-indigo-100 border-indigo-300',
      gradient: 'from-indigo-50 to-blue-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      pulse: 'rgba(99, 102, 241, 0.7)'
    },
    purple: {
      primary: 'from-purple-600 to-pink-600',
      secondary: 'bg-purple-600 hover:bg-purple-700',
      accent: 'bg-pink-600 hover:bg-pink-700',
      highlight: 'bg-purple-500',
      range: 'bg-purple-100 border-purple-300',
      gradient: 'from-purple-50 to-pink-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      pulse: 'rgba(168, 85, 247, 0.7)'
    }
  };

  // Generate a new sorted random array and reset search state
  const generateNewArray = () => {
    const newArray = Array.from({ length: 15 }, () =>
      Math.floor(Math.random() * 90 + 10)
    ).sort((a, b) => a - b);
    setArray(newArray);
    resetSearch();
  };

  // Reset search progress without changing the array
  const resetSearch = () => {
    pausedRef.current = false;
    setIsPaused(false);
    setIsSearching(false);
    setIsFound(false);
    setResult('');
    setSteps([]);
    setSearchHistory([]);
    setLeft(-1);
    setRight(-1);
    setMid(-1);
    leftRef.current = -1;
    rightRef.current = -1;
  };

  // Auto-scroll steps container when new steps are added
  useEffect(() => {
    if (stepsContainerRef.current && steps.length > 0) {
      stepsContainerRef.current.scrollTop = stepsContainerRef.current.scrollHeight;
    }
  }, [steps]);

  // The step-by-step binary search function (recursive)
  const stepSearch = () => {
    const currentLeft = leftRef.current;
    const currentRight = rightRef.current;

    // If the range is invalid, target is not found
    if (currentLeft > currentRight) {
      setResult('Element not found');
      setIsSearching(false);
      return;
    }

    // Calculate mid index
    const currentMid = Math.floor((currentLeft + currentRight) / 2);
    setMid(currentMid);

    // Record the current step
    const stepInfo = {
      left: currentLeft,
      right: currentRight,
      mid: currentMid,
      value: array[currentMid],
      comparison:
        array[currentMid] === parseInt(target)
          ? 'equal'
          : array[currentMid] < parseInt(target)
          ? 'less'
          : 'greater'
    };
    setSteps(prev => [...prev, stepInfo]);
    setSearchHistory(prev => [...prev, { left: currentLeft, right: currentRight, mid: currentMid }]);

    // Check if target is found
    if (array[currentMid] === parseInt(target)) {
      setIsFound(true);
      setResult(`Element found at position ${currentMid + 1}`);
      setIsSearching(false);
      return;
    }

    // Update search range based on comparison
    if (array[currentMid] < parseInt(target)) {
      leftRef.current = currentMid + 1;
      setLeft(currentMid + 1);
    } else {
      rightRef.current = currentMid - 1;
      setRight(currentMid - 1);
    }

    // Schedule next step if not paused
    setTimeout(() => {
      if (!pausedRef.current) {
        stepSearch();
      }
    }, speed);
  };

  // Start search from the beginning
  const startSearch = () => {
    if (!target || target < 10 || target > 99) {
      setResult('Please enter a valid target between 10 and 99.');
      return;
    }
    // Reset previous search progress
    setSteps([]);
    setSearchHistory([]);
    setIsFound(false);
    setResult('');
    // Initialize search range
    leftRef.current = 0;
    rightRef.current = array.length - 1;
    setLeft(0);
    setRight(array.length - 1);
    setIsSearching(true);
    pausedRef.current = false;
    setIsPaused(false);
    // Begin the step-by-step search
    stepSearch();
  };

  // Pause the ongoing search
  const pauseSearch = () => {
    if (isSearching) {
      pausedRef.current = true;
      setIsPaused(true);
      setIsSearching(false);
      setResult('Search paused.');
    }
  };

  // Resume search from where it was paused
  const resumeSearch = () => {
    if (isPaused) {
      pausedRef.current = false;
      setIsPaused(false);
      setIsSearching(true);
      setResult('');
      stepSearch();
    }
  };

  // Get the style for each array element based on its search state
  const getBoxStyle = (index) => {
    if (isFound && index === mid)
      return `${themeColors[theme].highlight} text-white found-animation scale-110`;
    if (index === mid)
      return `${themeColors[theme].highlight} text-white scale-110`;
    if (index >= left && index <= right)
      return `${themeColors[theme].range} border-2`;
    // Check if the element was part of a previous range
    const wasInPreviousRange = searchHistory.some(
      range => index >= range.left && index <= range.right
    );
    if (wasInPreviousRange) return 'bg-gray-200';
    return 'bg-white hover:bg-gray-50';
  };

  useEffect(() => {
    generateNewArray();
  }, []);

  return (
    <>
      {/* Inline custom CSS for animations and custom scrollbar */}
      <style>{`
        @keyframes foundAnimation {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          50% { transform: scale(1.2); box-shadow: 0 0 20px 10px rgba(255, 255, 255, 0.5); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        .found-animation {
          animation: foundAnimation 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 ${themeColors[theme].pulse}; }
          70% { box-shadow: 0 0 0 15px rgba(124, 58, 237, 0); }
          100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
        }
        .pulse-animation {
          animation: pulse 1.5s infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa;
        }
      `}</style>

      <div className={`h-screen w-full bg-gradient-to-br ${themeColors[theme].gradient} flex flex-col overflow-auto`}>
        <div className="container mx-auto px-4 py-4 flex-grow overflow-auto">
          {/* Header - Made more compact */}
          <header className="text-center mb-4 fade-in">
            <h1 className="text-3xl font-extrabold text-gray-800">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${themeColors[theme].primary}`}>
                Binary Search Visualizer
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-600 max-w-2xl mx-auto">
              Visualize how binary search efficiently finds elements in a sorted array
            </p>
          </header>

          {/* Theme Selector - Compact */}
          <div className="flex justify-center mb-3 fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex space-x-1">
              <button 
                onClick={() => setTheme('violet')} 
                className={`px-2 py-1 rounded-md transition text-sm ${theme === 'violet' ? 'bg-violet-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Violet
              </button>
              <button 
                onClick={() => setTheme('indigo')} 
                className={`px-2 py-1 rounded-md transition text-sm ${theme === 'indigo' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Indigo
              </button>
              <button 
                onClick={() => setTheme('purple')} 
                className={`px-2 py-1 rounded-md transition text-sm ${theme === 'purple' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Purple
              </button>
            </div>
          </div>

          {/* Main Content - Flex layout for vertical compression */}
          <div className="flex flex-col md:flex-row gap-3 h-5/6">
            <div className="w-full md:w-7/12 flex flex-col gap-3">
              {/* Controls - More compact */}
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="grid gap-3 md:grid-cols-2">
                  {/* Target Element Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Target Element
                    </label>
                    <input
                      type="number"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 text-sm shadow-sm transition-all"
                      disabled={isSearching}
                      min="10"
                      max="99"
                      placeholder="Enter a number (10-99)"
                    />
                  </div>

                  {/* Speed Slider */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Animation Speed
                    </label>
                    <div className="flex items-center">
                      <span className="mr-1 text-xs text-gray-500">Fast</span>
                      <input
                        type="range"
                        min="200"
                        max="2000"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="flex-grow h-1 bg-gray-200 rounded-md appearance-none cursor-pointer"
                      />
                      <span className="ml-1 text-xs text-gray-500">Slow</span>
                    </div>
                    <div className="text-center text-xs text-gray-500">{speed}ms</div>
                  </div>
                </div>

                {/* Action Buttons - Smaller and horizontally arranged */}
                <div className="grid grid-cols-5 gap-2 mt-3">
                  <button
                    onClick={startSearch}
                    disabled={isSearching || isPaused || target === ''}
                    className={`px-2 py-1 text-sm ${themeColors[theme].secondary} text-white font-medium rounded-md disabled:opacity-50 transition-all shadow-sm flex items-center justify-center`}
                  >
                    Start
                  </button>
                  <button
                    onClick={pauseSearch}
                    disabled={!isSearching}
                    className={`px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white font-medium rounded-md disabled:opacity-50 transition-all shadow-sm flex items-center justify-center`}
                  >
                    Pause
                  </button>
                  <button
                    onClick={resumeSearch}
                    disabled={!isPaused}
                    className={`px-2 py-1 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-md disabled:opacity-50 transition-all shadow-sm flex items-center justify-center`}
                  >
                    Resume
                  </button>
                  <button
                    onClick={resetSearch}
                    disabled={isSearching}
                    className={`px-2 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md disabled:opacity-50 transition-all shadow-sm flex items-center justify-center`}
                  >
                    Reset
                  </button>
                  <button
                    onClick={generateNewArray}
                    disabled={isSearching}
                    className={`px-2 py-1 text-sm ${themeColors[theme].accent} text-white font-medium rounded-md disabled:opacity-50 transition-all shadow-sm flex items-center justify-center`}
                  >
                    New Array
                  </button>
                </div>
              </section>

              {/* Visualization */}
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-0 fade-in flex-grow" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                  Sorted Array Visualization
                </h2>
                <div className="flex flex-wrap gap-2 justify-center">
                  {array.map((num, index) => (
                    <div
                      key={index}
                      className={`${getBoxStyle(index)} transition-all duration-300 
                        w-10 h-10 rounded-md flex items-center justify-center 
                        shadow-sm border border-gray-300 text-base font-semibold ${index === mid ? 'pulse-animation' : ''}`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
                {result && (
                  <div className={`mt-3 p-2 rounded-md bg-${theme}-50 ${themeColors[theme].border} border slide-in`}>
                    <p className={`${themeColors[theme].text} font-medium text-center text-sm flex items-center justify-center gap-1`}>
                      {isFound ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : result.includes('paused') ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      {result}
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Right column with steps and info */}
            <div className="w-full md:w-5/12 flex flex-col gap-3">
              {/* Search Steps */}
              {steps.length > 0 ? (
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 fade-in flex-grow" style={{ animationDelay: '0.4s' }}>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                    Search Steps
                  </h2>
                  <div ref={stepsContainerRef} className="max-h-40 overflow-y-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Step</th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Range</th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mid</th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decision</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {steps.map((step, index) => (
                          <tr key={index} className={`${index === steps.length - 1 ? `bg-${theme}-50` : ''} slide-in`} style={{ animationDelay: `${index * 0.05}s` }}>
                            <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900">{index + 1}</td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">[{step.left}...{step.right}]</td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                              {step.mid} <span className="text-gray-400">({step.value})</span>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs">
                              {step.comparison === 'equal' ? (
                                <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded-full text-xs font-medium">Found!</span>
                              ) : step.comparison === 'less' ? (
                                <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded-full text-xs font-medium">Go right →</span>
                              ) : (
                                <span className={`bg-${theme}-100 ${themeColors[theme].text} px-1 py-0.5 rounded-full text-xs font-medium`}>← Go left</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : (
                <div className="hidden md:block"></div>
              )}

              {/* Algorithm Information - More concise for better fit */}
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 fade-in flex-grow" style={{ animationDelay: '0.5s' }}>
                <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                  Binary Search Explained
                </h2>
                <div className="space-y-2 text-sm">
                  <div className={`p-2 rounded-md bg-${theme}-50 border border-${theme}-100`}>
                    <h3 className="font-medium text-gray-800 mb-1 flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      How It Works
                    </h3>
                    <p className="text-gray-600 text-xs">
                      Binary search divides the search space in half with each step to efficiently locate the target element.
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-1 flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Time Complexity
                    </h3>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="bg-white p-1 rounded border border-gray-200">
                        <span className="font-medium text-xs">Best: O(1)</span>
                      </div>
                      <div className="bg-white p-1 rounded border border-gray-200">
                        <span className="font-medium text-xs">Avg: O(log n)</span>
                      </div>
                      <div className="bg-white p-1 rounded border border-gray-200">
                        <span className="font-medium text-xs">Worst: O(log n)</span>
                      </div>
                      <div className="bg-white p-1 rounded border border-gray-200">
                        <span className="font-medium text-xs">Space: O(1)</span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-2 bg-${theme}-50 rounded-md border border-${theme}-100`}>
                    <h3 className={`font-medium ${themeColors[theme].text} mb-1 text-sm`}>Why Binary Search is Fast</h3>
                    <p className="text-gray-600 text-xs">
                      Every step eliminates half the remaining elements. This makes binary search significantly faster than linear search for large datasets.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        
        {/* Footer - Smaller */}
        <footer className="text-center py-2 text-gray-600 text-sm fade-in" style={{ animationDelay: '0.6s' }}>
          <p className="text-xs">Binary Search Visualizer</p>
        </footer>
      </div>
    </>
  );
};

export default BinarySearchVisualizer;