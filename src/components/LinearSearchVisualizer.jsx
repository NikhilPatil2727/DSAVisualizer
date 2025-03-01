import React, { useState, useEffect, useRef } from 'react';

const LinearSearchVisualizer = () => {
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isFound, setIsFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [searchHistory, setSearchHistory] = useState([]);
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState([]);
  const [theme, setTheme] = useState('violet');
  const cancelFlag = useRef(false);
  const stepsContainerRef = useRef(null);

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

  const generateNewArray = () => {
    const newArray = Array.from({ length: 15 }, () =>
      Math.floor(Math.random() * 90 + 10)
    );
    setArray(newArray);
    resetSearch();
  };

  const resetSearch = () => {
    cancelFlag.current = false;
    setCurrentIndex(-1);
    setIsFound(false);
    setIsSearching(false);
    setIsPaused(false);
    setResult('');
    setSteps([]);
    setSearchHistory([]);
  };

  useEffect(() => {
    if (stepsContainerRef.current && steps.length > 0) {
      stepsContainerRef.current.scrollTop = stepsContainerRef.current.scrollHeight;
    }
  }, [steps]);

  const startSearch = async () => {
    if (!target || target < 10 || target > 99) {
      setResult('Please enter a valid target between 10 and 99.');
      return;
    }
    
    resetSearch();
    setIsSearching(true);
    cancelFlag.current = false;
    let found = false;
    
    for (let i = 0; i < array.length; i++) {
      if (cancelFlag.current) break;
      
      setCurrentIndex(i);
      setSearchHistory(prev => [...prev, i]);
      const stepInfo = {
        index: i,
        value: array[i],
        status: array[i] === parseInt(target) ? 'found' : 'checked'
      };
      setSteps(prev => [...prev, stepInfo]);

      await new Promise(resolve => setTimeout(resolve, speed));

      if (array[i] === parseInt(target)) {
        setIsFound(true);
        setResult(`Element found at position ${i + 1}`);
        found = true;
        break;
      }
    }

    if (!found && !cancelFlag.current) {
      setResult('Element not found');
    }
    setIsSearching(false);
    cancelFlag.current = false;
  };

  const stopSearch = () => {
    if (isSearching) {
      cancelFlag.current = true;
      setIsSearching(false);
      setIsPaused(true);
      setResult('Search paused');
    }
  };

  return (
    <>
      <style>{`
        @keyframes foundAnimation {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          50% { transform: scale(1.2); box-shadow: 0 0 20px 10px rgba(255, 255, 255, 0.5); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        .found-animation {
          animation: foundAnimation 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className={`h-screen w-full bg-gradient-to-br ${themeColors[theme].gradient} flex flex-col overflow-auto`}>
        <div className="container mx-auto px-4 py-4 flex-grow overflow-auto">
          <header className="text-center mb-4 fade-in">
            <h1 className="text-3xl font-extrabold text-gray-800">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${themeColors[theme].primary}`}>
                Linear Search Visualizer
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-600 max-w-2xl mx-auto">
              Visualize how linear search sequentially checks each element in an array
            </p>
          </header>

          <div className="flex justify-center mb-3 fade-in">
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

          <div className="flex flex-col md:flex-row gap-3 h-5/6">
            <div className="w-full md:w-7/12 flex flex-col gap-3">
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 fade-in">
                <div className="grid gap-3 md:grid-cols-2">
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

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Animation Speed
                    </label>
                    <div className="flex items-center">
                      <span className="mr-1 text-xs text-gray-500">Fast</span>
                      <input
                        type="range"
                        min="100"
                        max="1000"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="flex-grow h-1 bg-gray-200 rounded-md appearance-none cursor-pointer"
                      />
                      <span className="ml-1 text-xs text-gray-500">Slow</span>
                    </div>
                    <div className="text-center text-xs text-gray-500">{speed}ms</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-3">
                  <button
                    onClick={startSearch}
                    disabled={isSearching || target === ''}
                    className={`px-2 py-1 text-sm ${themeColors[theme].secondary} text-white font-medium rounded-md disabled:opacity-50 transition-all shadow-sm`}
                  >
                    Start
                  </button>
                  <button
                    onClick={stopSearch}
                    disabled={!isSearching}
                    className="px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white font-medium rounded-md disabled:opacity-50 transition-all shadow-sm"
                  >
                    Stop
                  </button>
                  <button
                    onClick={resetSearch}
                    disabled={isSearching}
                    className="px-2 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md disabled:opacity-50 transition-all shadow-sm"
                  >
                    Reset
                  </button>
                  <button
                    onClick={generateNewArray}
                    disabled={isSearching}
                    className={`px-2 py-1 text-sm ${themeColors[theme].accent} text-white font-medium rounded-md disabled:opacity-50 transition-all shadow-sm`}
                  >
                    New Array
                  </button>
                </div>
              </section>

              <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-0 fade-in flex-grow">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                  Array Visualization
                </h2>
                <div className="flex flex-wrap gap-2 justify-center">
                  {array.map((num, index) => (
                    <div
                      key={index}
                      className={`transition-all duration-300 w-10 h-10 rounded-md flex items-center justify-center shadow-sm border border-gray-300 text-base font-semibold ${
                        isFound && index === currentIndex 
                          ? 'bg-green-500 text-white found-animation scale-110'
                          : index === currentIndex
                          ? `${themeColors[theme].highlight} text-white scale-110`
                          : searchHistory.includes(index)
                          ? 'bg-gray-200'
                          : 'bg-white hover:bg-gray-50'
                      }`}
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

            <div className="w-full md:w-5/12 flex flex-col gap-3">
              {steps.length > 0 && (
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 fade-in flex-grow">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                    Search Steps
                  </h2>
                  <div ref={stepsContainerRef} className="max-h-40 overflow-y-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Step</th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Index</th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {steps.map((step, index) => (
                          <tr key={index} className={step.status === 'found' ? `bg-${theme}-50` : ''}>
                            <td className="px-2 py-1 text-xs font-medium text-gray-900">{index + 1}</td>
                            <td className="px-2 py-1 text-xs text-gray-500">{step.index + 1}</td>
                            <td className="px-2 py-1 text-xs text-gray-500">{step.value}</td>
                            <td className="px-2 py-1 text-xs">
                              {step.status === 'found' ? (
                                <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded-full">Found</span>
                              ) : (
                                <span className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded-full">Checked</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 fade-in flex-grow">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                  Linear Search Explained
                </h2>
                <div className="space-y-2 text-sm">
                  <div className={`p-2 rounded-md bg-${theme}-50 border border-${theme}-100`}>
                    <h3 className="font-medium text-gray-800 mb-1 text-sm">How It Works</h3>
                    <p className="text-gray-600 text-xs">
                      Sequentially checks each element of the array until a match is found or all elements are checked.
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-1 text-sm">Time Complexity</h3>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="bg-white p-1 rounded border border-gray-200">
                        <span className="font-medium text-xs">Best: O(1)</span>
                      </div>
                      <div className="bg-white p-1 rounded border border-gray-200">
                        <span className="font-medium text-xs">Worst: O(n)</span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-2 bg-${theme}-50 rounded-md border border-${theme}-100`}>
                    <h3 className={`font-medium ${themeColors[theme].text} mb-1 text-sm`}>When to Use</h3>
                    <p className="text-gray-600 text-xs">
                      Suitable for small or unsorted datasets. Simple implementation but inefficient for large datasets.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <footer className="text-center py-2 text-gray-600 text-sm fade-in">
          <p className="text-xs">Linear Search Visualizer</p>
        </footer>
      </div>
    </>
  );
};

export default LinearSearchVisualizer;