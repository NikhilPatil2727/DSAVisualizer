import React, { useState, useEffect } from 'react';

const MergeSortVisualizer = () => {
  const [array, setArray] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [currentStep, setCurrentStep] = useState(null);
  const [explanation, setExplanation] = useState('');

  const COLORS = {
    DEFAULT: '#6366F1',    // Indigo
    COMPARING: '#EF4444',  // Red
    SORTED: '#10B981',     // Green
    ACTIVE: '#F59E0B'      // Amber
  };

  const STEPS = {
    SPLIT: 'SPLIT',
    COMPARE: 'COMPARE',
    MERGE_LEFT: 'MERGE_LEFT',
    MERGE_RIGHT: 'MERGE_RIGHT',
    MERGE_COMPLETE: 'MERGE_COMPLETE'
  };

  const generateArray = () => {
    const newArray = Array.from({ length: 12 }, () => Math.floor(Math.random() * 50) + 10);
    setArray(newArray);
    setCurrentStep(null);
    setExplanation('Generate a new array to start sorting.');
  };

  useEffect(() => {
    generateArray();
  }, []);

  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const mergeSort = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const animations = [];
    const auxArray = array.slice();
    await mergeSortHelper(array.slice(), 0, array.length - 1, auxArray, animations);

    for (const animation of animations) {
      const [type, indices, values] = animation;
      const bars = document.getElementsByClassName('array-bar');

      if (type === 'compare') {
        setCurrentStep(STEPS.COMPARE);
        setExplanation(`Comparing elements at indices ${indices[0]} and ${indices[1]}.`);
        bars[indices[0]].style.backgroundColor = COLORS.COMPARING;
        bars[indices[1]].style.backgroundColor = COLORS.COMPARING;
        await sleep(speed);
        bars[indices[0]].style.backgroundColor = COLORS.DEFAULT;
        bars[indices[1]].style.backgroundColor = COLORS.DEFAULT;
      } else if (type === 'merge') {
        setCurrentStep(values[1] <= indices[0] ? STEPS.MERGE_LEFT : STEPS.MERGE_RIGHT);
        setExplanation(`Merging element ${values[0]} into position ${indices[0]}.`);
        bars[indices[0]].style.height = `${values[0] * 3}px`;
        bars[indices[0]].style.backgroundColor = COLORS.SORTED;
        array[indices[0]] = values[0];
        setArray([...array]);
        await sleep(speed);
      }
    }

    setCurrentStep(STEPS.MERGE_COMPLETE);
    setExplanation('Merge sort complete! The array is now sorted.');
    setIsAnimating(false);
  };

  const mergeSortHelper = async (mainArray, start, end, auxArray, animations) => {
    if (start === end) return;

    const middle = Math.floor((start + end) / 2);
    setCurrentStep(STEPS.SPLIT);
    setExplanation(`Splitting array from index ${start} to ${end}.`);
    await mergeSortHelper(auxArray, start, middle, mainArray, animations);
    await mergeSortHelper(auxArray, middle + 1, end, mainArray, animations);
    await merge(mainArray, start, middle, end, auxArray, animations);
  };

  const merge = async (mainArray, start, middle, end, auxArray, animations) => {
    let k = start;
    let i = start;
    let j = middle + 1;

    while (i <= middle && j <= end) {
      animations.push(['compare', [i, j], []]);
      if (auxArray[i] <= auxArray[j]) {
        animations.push(['merge', [k], [auxArray[i], i]]);
        mainArray[k++] = auxArray[i++];
      } else {
        animations.push(['merge', [k], [auxArray[j], j]]);
        mainArray[k++] = auxArray[j++];
      }
    }

    while (i <= middle) {
      animations.push(['merge', [k], [auxArray[i], i]]);
      mainArray[k++] = auxArray[i++];
    }

    while (j <= end) {
      animations.push(['merge', [k], [auxArray[j], j]]);
      mainArray[k++] = auxArray[j++];
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-900 text-white p-4">
      <div className="lg:w-1/2 p-4">
        <div className="mb-4 space-x-4">
          <button
            onClick={generateArray}
            disabled={isAnimating}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
          >
            Generate New Array
          </button>
          <button
            onClick={mergeSort}
            disabled={isAnimating}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
          >
            Start Sorting
          </button>
        </div>

        <div className="flex items-center mb-4">
          <label className="mr-2">Animation Speed:</label>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="slider"
          />
          <span className="ml-2">{speed} ms</span>
        </div>

        <div className="flex items-end justify-center h-96 bg-gray-800 rounded-lg p-4">
          {array.map((value, idx) => (
            <div
              key={idx}
              className="array-bar w-8 mx-1 rounded-t-md transition-all duration-200 flex flex-col items-center justify-end"
              style={{
                height: `${value * 3}px`,
                backgroundColor: COLORS.DEFAULT
              }}
            >
              <span className="text-xs mb-1">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current Step:</h2>
          <p className="text-sm">{explanation}</p>
        </div>
      </div>

      <div className="lg:w-1/2 p-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto">
            <code className="text-green-400 block whitespace-pre">
              {`// Merge Sort Implementation

function mergeSort(arr) {
  ${currentStep === STEPS.SPLIT ? '→' : ' '} if (arr.length <= 1) return arr;
  ${currentStep === STEPS.SPLIT ? '→' : ' '} const mid = Math.floor(arr.length / 2);
  ${currentStep === STEPS.SPLIT ? '→' : ' '} const left = mergeSort(arr.slice(0, mid));
  ${currentStep === STEPS.SPLIT ? '→' : ' '} const right = mergeSort(arr.slice(mid));

  // Merge process
  let result = [];
  let i = 0, j = 0;

  ${currentStep === STEPS.COMPARE ? '→' : ' '} while (i < left.length && j < right.length) {
    ${currentStep === STEPS.COMPARE ? '→' : ' '}   if (left[i] <= right[j]) {
    ${currentStep === STEPS.MERGE_LEFT ? '→' : ' '}     result.push(left[i++]);
    ${currentStep === STEPS.MERGE_RIGHT ? '→' : ' '}   } else {
    ${currentStep === STEPS.MERGE_RIGHT ? '→' : ' '}     result.push(right[j++]);
    }
  }

  ${currentStep === STEPS.MERGE_COMPLETE ? '→' : ' '} return result
    .concat(left.slice(i))
    .concat(right.slice(j));
}`}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default MergeSortVisualizer;