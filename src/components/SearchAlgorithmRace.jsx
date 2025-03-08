import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Trophy, List, Shuffle } from 'lucide-react';

const SearchAlgorithmRace = () => {
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState(null);
  const [arraySize, setArraySize] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [message, setMessage] = useState('Welcome to Algorithm Race: Linear Search vs Binary Search');
  const [customTarget, setCustomTarget] = useState('');
  const [customArray, setCustomArray] = useState('');
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  
  // Race state for the two algorithms
  const [algorithms, setAlgorithms] = useState([
    { 
      id: 'linear', 
      name: 'Linear Search', 
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500',
      progress: 0, 
      steps: 0,
      currentIndex: -1,
      found: false,
      foundAt: -1,
      completed: false,
      elapsedTime: 0,
      bestCase: 'O(1)',
      worstCase: 'O(n)',
      averageCase: 'O(n/2)',
      description: 'Sequentially checks each element until a match is found'
    },
    { 
      id: 'binary', 
      name: 'Binary Search', 
      color: 'bg-green-500',
      textColor: 'text-green-500',
      borderColor: 'border-green-500',
      progress: 0, 
      steps: 0,
      low: 0,
      high: 0,
      mid: -1,
      found: false,
      foundAt: -1,
      completed: false,
      elapsedTime: 0,
      bestCase: 'O(1)',
      worstCase: 'O(log n)',
      averageCase: 'O(log n)',
      description: 'Divides the search interval in half with each step (requires sorted array)'
    }
  ]);
  
  // Timer and start time references
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Initialize array when component mounts or arraySize changes
  useEffect(() => {
    generateRandomArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arraySize]);
  
  // Animation effect – run algorithm steps at the selected speed
  useEffect(() => {
    if (isPlaying && !isComplete) {
      timerRef.current = setInterval(() => {
        runAlgorithmStep();
      }, speed);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isPlaying, isComplete, array, target, speed]);
  
  // When all algorithms are completed, check for a winner
  useEffect(() => {
    if (algorithms.every(algo => algo.completed)) {
      setIsComplete(true);
      setIsPlaying(false);
      
      const completed = algorithms.filter(algo => algo.found);
      if (completed.length > 0) {
        const winner = completed.reduce((fastest, current) => 
          fastest.steps < current.steps ? fastest : current
        );
        setMessage(`Race complete! ${winner.name} wins with ${winner.steps} steps and ${winner.elapsedTime.toFixed(2)}ms!`);
      } else {
        setMessage(`Race complete! Target ${target} not found by any algorithm.`);
      }
    }
  }, [algorithms, target]);
  
  // Generate a random sorted array and target value
  const generateRandomArray = () => {
    const newArray = Array.from({ length: arraySize }, () => 
      Math.floor(Math.random() * 100) + 1
    ).sort((a, b) => a - b);
    
    setArray(newArray);
    
    // 70% chance target is in the array
    const includeTarget = Math.random() > 0.3;
    let newTarget;
    if (includeTarget) {
      const randomIndex = Math.floor(Math.random() * newArray.length);
      newTarget = newArray[randomIndex];
    } else {
      do {
        newTarget = Math.floor(Math.random() * 100) + 1;
      } while (newArray.includes(newTarget));
    }
    setTarget(newTarget);
    
    // Reset algorithms with the new array and target
    resetAlgorithms(newArray, newTarget);
  };
  
  // Reset the algorithms’ state using the provided array and target
  const resetAlgorithms = (newArray = array, newTarget = target) => {
    setAlgorithms(prevAlgorithms => 
      prevAlgorithms.map(algo => {
        if (algo.id === 'linear') {
          return {
            ...algo,
            progress: 0,
            steps: 0,
            currentIndex: -1,
            found: false,
            foundAt: -1,
            completed: false,
            elapsedTime: 0
          };
        } else if (algo.id === 'binary') {
          return {
            ...algo,
            progress: 0,
            steps: 0,
            low: 0,
            high: newArray.length - 1,
            mid: -1,
            found: false,
            foundAt: -1,
            completed: false,
            elapsedTime: 0
          };
        }
        return algo;
      })
    );
    
    setIsComplete(false);
    setMessage(`Searching for target: ${newTarget}`);
  };
  
  // Run a single step for both linear and binary search
  const runAlgorithmStep = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
    }
    
    setAlgorithms(prevAlgorithms => {
      return prevAlgorithms.map(algo => {
        if (algo.completed) return algo;
        
        const now = performance.now();
        const elapsed = now - startTimeRef.current;
        
        if (algo.id === 'linear') {
          const newIndex = algo.currentIndex + 1;
          const newProgress = (newIndex / array.length) * 100;
          const newSteps = algo.steps + 1;
          
          let newFound = algo.found;
          let newFoundAt = algo.foundAt;
          let isCompleted = false;
          
          if (newIndex < array.length) {
            if (array[newIndex] === target) {
              newFound = true;
              newFoundAt = newIndex;
              isCompleted = true;
            }
          } else {
            isCompleted = true;
          }
          
          return {
            ...algo,
            currentIndex: newIndex,
            progress: newProgress,
            steps: newSteps,
            found: newFound,
            foundAt: newFoundAt,
            completed: isCompleted,
            elapsedTime: elapsed
          };
        } else if (algo.id === 'binary') {
          let newLow = algo.low;
          let newHigh = algo.high;
          if (newLow <= newHigh) {
            const newMid = Math.floor((newLow + newHigh) / 2);
            const newProgress = ((algo.steps + 1) / Math.log2(array.length + 1)) * 100;
            const newSteps = algo.steps + 1;
            
            let newFound = algo.found;
            let newFoundAt = algo.foundAt;
            let isCompleted = false;
            
            if (array[newMid] === target) {
              newFound = true;
              newFoundAt = newMid;
              isCompleted = true;
            } else if (array[newMid] < target) {
              newLow = newMid + 1;
            } else {
              newHigh = newMid - 1;
            }
            
            return {
              ...algo,
              low: newLow,
              high: newHigh,
              mid: newMid,
              progress: Math.min(newProgress, 100),
              steps: newSteps,
              found: newFound,
              foundAt: newFoundAt,
              completed: isCompleted,
              elapsedTime: elapsed
            };
          } else {
            return { ...algo, completed: true, elapsedTime: elapsed };
          }
        }
        return algo;
      });
    });
  };
  
  // Start the race visualization
  const startRace = () => {
    resetAlgorithms(array, target);
    startTimeRef.current = null;
    setIsPlaying(true);
    setIsComplete(false);
  };
  
  // Pause the visualization
  const pauseRace = () => {
    setIsPlaying(false);
  };
  
  // Reset the visualization
  const resetRace = () => {
    setIsPlaying(false);
    resetAlgorithms(array, target);
    startTimeRef.current = null;
  };
  
  // Apply custom inputs for array and target values
  const applyCustomInputs = () => {
    try {
      const parsedArray = customArray.split(',')
        .map(item => parseInt(item.trim()))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b);
      
      if (parsedArray.length === 0) {
        setMessage('Please enter a valid array with at least one number');
        return;
      }
      
      const parsedTarget = parseInt(customTarget.trim());
      if (isNaN(parsedTarget)) {
        setMessage('Please enter a valid target number');
        return;
      }
      
      setArray(parsedArray);
      setTarget(parsedTarget);
      setArraySize(parsedArray.length);
      resetAlgorithms(parsedArray, parsedTarget);
      setShowCustomInputs(false);
      setMessage(`Custom challenge set: searching for ${parsedTarget} in an array of ${parsedArray.length} elements`);
    } catch (error) {
      setMessage('Error parsing input. Please check your format and try again.');
    }
  };
  
  // Calculate the position for the algorithm pointers in the visualization
  const getIndexIndicatorPosition = (algo) => {
    const cellWidth = 100 / array.length;
    let position = 0;
    
    if (algo.id === 'linear') {
      position = algo.currentIndex * cellWidth;
    } else if (algo.id === 'binary') {
      position = algo.mid * cellWidth;
    }
    
    return position;
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-purple-700 mb-4 text-center">Search Algorithm Race</h1>
      
      {/* Controls Panel */}
      <div className="w-full flex flex-wrap justify-center gap-4 mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-2">
          <button 
            onClick={startRace} 
            disabled={isPlaying}
            className={`flex items-center gap-1 px-4 py-2 rounded ${isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          >
            <Play size={16} /> Start Race
          </button>
          <button 
            onClick={pauseRace} 
            disabled={!isPlaying}
            className={`flex items-center gap-1 px-4 py-2 rounded ${!isPlaying ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
          >
            <Pause size={16} /> Pause
          </button>
          <button 
            onClick={resetRace}
            className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={generateRandomArray}
            className="flex items-center gap-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
          >
            <Shuffle size={16} /> Random Array
          </button>
          <button 
            onClick={() => setShowCustomInputs(!showCustomInputs)}
            className={`flex items-center gap-1 px-4 py-2 rounded ${showCustomInputs ? 'bg-purple-600 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
          >
            <List size={16} /> {showCustomInputs ? 'Hide Custom Input' : 'Custom Challenge'}
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <span>Speed:</span>
            <input 
              type="range" 
              min={100} 
              max={1000} 
              step={50} 
              value={speed} 
              onChange={e => setSpeed(Number(e.target.value))} 
              className="w-32"
            />
            <span>{(1000/speed).toFixed(1)}x</span>
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <span>Array Size:</span>
            <input 
              type="range" 
              min={5} 
              max={30} 
              value={arraySize} 
              onChange={e => setArraySize(Number(e.target.value))} 
              disabled={isPlaying}
              className="w-32"
            />
            <span>{arraySize}</span>
          </label>
        </div>
      </div>
      
      {/* Custom Input Panel */}
      {showCustomInputs && (
        <div className="w-full bg-white p-4 mb-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Custom Challenge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Array (comma-separated, will be sorted):</label>
              <input 
                type="text" 
                value={customArray} 
                onChange={e => setCustomArray(e.target.value)} 
                placeholder="e.g. 10, 25, 3, 16, 8" 
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Target Value:</label>
              <input 
                type="number" 
                value={customTarget} 
                onChange={e => setCustomTarget(e.target.value)} 
                placeholder="e.g. 16" 
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <button 
            onClick={applyCustomInputs}
            className="mt-3 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
          >
            Apply Custom Challenge
          </button>
        </div>
      )}
      
      {/* Race Status */}
      <div className="w-full bg-white p-4 mb-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-semibold">Target:</span> {target}
          </div>
          <div>
            <span className="font-semibold">Array Size:</span> {array.length}
          </div>
        </div>
        <div className="p-3 bg-gray-100 rounded-lg min-h-12 mt-2">
          <p className="text-gray-800">{message}</p>
        </div>
      </div>
      
      {/* Leaderboard */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {algorithms.map((algo) => (
          <div key={algo.id} className={`bg-white p-4 rounded-lg shadow border-l-4 ${algo.borderColor}`}>
            <h2 className={`text-xl font-bold ${algo.textColor} flex items-center gap-2`}>
              {algo.completed && algo.found && <Trophy size={18} />}
              {algo.name}
            </h2>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <div className="text-gray-600 text-sm">Steps:</div>
                <div className="font-bold text-lg">{algo.steps}</div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Time:</div>
                <div className="font-bold text-lg">{algo.elapsedTime.toFixed(2)}ms</div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Status:</div>
                <div className="font-semibold">
                  {algo.completed 
                    ? (algo.found ? `Found at index ${algo.foundAt}` : 'Not found') 
                    : 'Running...'}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Complexity:</div>
                <div className="font-semibold">{algo.worstCase}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${algo.color} transition-all duration-300`} 
                  style={{ width: `${algo.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Visualization */}
      <div className="w-full bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative mb-12">
          <div className="flex border-b border-gray-300">
            {array.map((value, index) => (
              <div 
                key={index} 
                className={`flex-1 p-2 text-center border-r border-gray-300 relative ${
                  algorithms.some(algo => 
                    (algo.id === 'linear' && algo.currentIndex === index) || 
                    (algo.id === 'binary' && algo.mid === index)
                  ) ? 'bg-yellow-100' : ''
                } ${
                  algorithms.some(algo => algo.foundAt === index) ? 'bg-green-100' : ''
                }`}
              >
                {value}
                <div className="text-xs text-gray-500 absolute bottom-0 left-0 right-0 -mb-5">
                  {index}
                </div>
              </div>
            ))}
          </div>
          
          {/* Algorithm pointers */}
          {algorithms.map(algo => {
            if (algo.id === 'linear' && algo.currentIndex >= 0 && algo.currentIndex < array.length) {
              return (
                <div 
                  key={`${algo.id}-pointer`}
                  className="absolute top-full mt-6"
                  style={{ 
                    left: `${getIndexIndicatorPosition(algo)}%`, 
                    transform: 'translateX(-50%)',
                    transition: 'left 300ms ease-in-out'
                  }}
                >
                  <div className={`w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent ${algo.borderColor.replace('border-', 'border-b-')} mx-auto`}></div>
                  <div className={`${algo.color} text-white px-2 py-1 rounded text-xs text-center whitespace-nowrap`}>
                    Linear: Step {algo.steps}
                  </div>
                </div>
              );
            }
            return null;
          })}
          
          {algorithms.map(algo => {
            if (algo.id === 'binary' && algo.mid >= 0 && algo.mid < array.length) {
              return (
                <div 
                  key={`${algo.id}-pointer`}
                  className="absolute top-full mt-14"
                  style={{ 
                    left: `${getIndexIndicatorPosition(algo)}%`, 
                    transform: 'translateX(-50%)',
                    transition: 'left 300ms ease-in-out'
                  }}
                >
                  <div className={`w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent ${algo.borderColor.replace('border-', 'border-b-')} mx-auto`}></div>
                  <div className={`${algo.color} text-white px-2 py-1 rounded text-xs text-center whitespace-nowrap`}>
                    Binary: Step {algo.steps}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
      
      {/* Algorithm Details */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {algorithms.map(algo => (
          <div key={`${algo.id}-details`} className="bg-white p-4 rounded-lg shadow">
            <h2 className={`text-xl font-bold ${algo.textColor} mb-2`}>{algo.name}</h2>
            <p className="text-gray-700 mb-3">{algo.description}</p>
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 bg-gray-100 rounded">
                <div className="font-semibold">Best Case</div>
                <div>{algo.bestCase}</div>
              </div>
              <div className="p-2 bg-gray-100 rounded">
                <div className="font-semibold">Average Case</div>
                <div>{algo.averageCase}</div>
              </div>
              <div className="p-2 bg-gray-100 rounded">
                <div className="font-semibold">Worst Case</div>
                <div>{algo.worstCase}</div>
              </div>
            </div>
            
            {algo.id === 'binary' && (
              <div className="mt-3 p-3 bg-yellow-100 rounded text-sm">
                <span className="font-semibold">Note:</span> Binary search requires a sorted array to work correctly.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchAlgorithmRace;
