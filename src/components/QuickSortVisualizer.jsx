import React, { useState, useEffect, useRef } from 'react';

const QuickSortVisualizer = () => {
    const [array, setArray] = useState([]);
    const [sorting, setSorting] = useState(false);
    const [paused, setPaused] = useState(false);
    const [currentStep, setCurrentStep] = useState('');
    const [speed, setSpeed] = useState(500);
    const [activeIndices, setActiveIndices] = useState([]);
    const [pivotIndex, setPivotIndex] = useState(-1);
    const sortingRef = useRef(false);
    const pausedRef = useRef(false);

    // Generate random array
    const generateArray = () => {
        const newArray = Array.from({ length: 15 }, () =>
            Math.floor(Math.random() * 80 + 10)
        );
        setArray(newArray);
        setCurrentStep('Array generated');
        setActiveIndices([]);
        setPivotIndex(-1);
    };

    // Reset functionality
    const handleReset = () => {
        sortingRef.current = false;
        setPaused(false);
        pausedRef.current = false;
        generateArray();
    };

    useEffect(() => {
        generateArray();
    }, []);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const quickSort = async (arr, left, right) => {
        if (left < right) {
            const pivotIndex = await partition(arr, left, right);
            setCurrentStep(`Sorting left partition (${left} to ${pivotIndex - 1})`);
            await quickSort(arr, left, pivotIndex - 1);
            setCurrentStep(`Sorting right partition (${pivotIndex + 1} to ${right})`);
            await quickSort(arr, pivotIndex + 1, right);
        }
        return arr;
    };

    const partition = async (arr, left, right) => {
        const pivot = arr[right];
        setPivotIndex(right);
        let i = left - 1;

        setCurrentStep(`Selecting pivot (${pivot}) at index ${right}`);
        await sleep(speed);

        for (let j = left; j < right; j++) {
            if (!sortingRef.current) return;
            while (pausedRef.current) await sleep(100);

            setActiveIndices([j, i]);
            setCurrentStep(`Comparing ${arr[j]} with pivot ${pivot}`);
            await sleep(speed);

            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                setArray([...arr]);
                setCurrentStep(`Swapped ${arr[i]} and ${arr[j]}`);
                await sleep(speed);
            }
        }

        [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
        setArray([...arr]);
        setCurrentStep(`Placed pivot ${pivot} at correct position ${i + 1}`);
        await sleep(speed);
        setPivotIndex(-1);

        return i + 1;
    };

    const startSort = async () => {
        setSorting(true);
        sortingRef.current = true;
        await quickSort([...array], 0, array.length - 1);
        setSorting(false);
        setCurrentStep('Sorting completed!');
        setActiveIndices([]);
    };

    const togglePause = () => {
        setPaused(!paused);
        pausedRef.current = !pausedRef.current;
    };

    const getBarColor = (index) => {
        if (index === pivotIndex) return 'bg-red-500';
        if (activeIndices.includes(index)) return 'bg-yellow-400';
        if (index < pivotIndex) return 'bg-green-500';
        return 'bg-indigo-500';
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-indigo-600">
                    QuickSort Visualizer
                </h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Controls and Information */}
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">Controls & Information</h2>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Animation Speed: {speed}ms
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="1000"
                                value={speed}
                                onChange={(e) => setSpeed(parseInt(e.target.value))}
                                className="w-full"
                                disabled={sorting}
                            />
                        </div>

                        <div className="flex flex-wrap gap-4 mb-6">
                            <button
                                onClick={startSort}
                                disabled={sorting}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                {sorting ? 'Sorting...' : 'Start Sorting'}
                            </button>
                            <button
                                onClick={togglePause}
                                disabled={!sorting}
                                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                            >
                                {paused ? 'Resume' : 'Pause'}
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                                Reset
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Color Legend:</h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-indigo-500 mr-2"></div>
                                    <span>Normal Element</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-red-500 mr-2"></div>
                                    <span>Pivot Element</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-yellow-400 mr-2"></div>
                                    <span>Active Comparison</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-green-500 mr-2"></div>
                                    <span>Sorted Partition</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Current Step:</h3>
                            <p className="text-gray-700">{currentStep}</p>
                        </div>
                    </div>

                    {/* Visualization Section */}
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex flex-col items-center">
                            <div className="w-full h-96 mb-4 flex items-end justify-center space-x-1">
                                {array.map((value, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-8 transition-all duration-300 rounded-t ${getBarColor(idx)}`}
                                        style={{ height: `${value * 3}px` }}
                                    >
                                        <div className="text-center text-xs text-black -rotate-90 -ml-4 -mt-4">
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full flex justify-between px-4 mb-4">
                                {array.map((_, idx) => (
                                    <div key={idx} className="w-8 text-center text-xs text-gray-600">
                                        {idx}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={generateArray}
                                disabled={sorting}
                                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                            >
                                Generate New Array
                            </button>
                        </div>
                    </div>
                </div>

                {/* Algorithm Explanation */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">QuickSort Algorithm Steps</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">1. Choose a Pivot</h3>
                            <p>Typically the last element in the current partition</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">2. Partitioning</h3>
                            <p>Rearrange elements so all smaller than pivot come before, all greater come after</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">3. Recursion</h3>
                            <p>Apply the same process recursively to the left and right partitions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickSortVisualizer;