import React, { useState, useEffect, useRef } from 'react';

const QuickSortVisualizer = () => {
    const [array, setArray] = useState([]);
    const [sorting, setSorting] = useState(false);
    const [paused, setPaused] = useState(false);
    const [currentLine, setCurrentLine] = useState(null);
    const sortingRef = useRef(false);
    const pausedRef = useRef(false);

    // Generate random array
    const generateArray = () => {
        const newArray = Array.from({ length: 15 }, () =>
            Math.floor(Math.random() * 80 + 10)
        );
        setArray(newArray);
        setCurrentLine(null);
    };

    // Reset functionality
    const handleReset = () => {
        sortingRef.current = false;
        setPaused(false);
        pausedRef.current = false;
        generateArray();
    };

    // Initialize array on component mount
    useEffect(() => {
        generateArray();
    }, []);

    // Sleep function for animation delay
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // QuickSort implementation with visualization
    const quickSort = async (arr, left, right) => {
        if (left < right) {
            const pivotIndex = await partition(arr, left, right);
            setCurrentLine('Recursively sort left partition');
            await quickSort(arr, left, pivotIndex - 1);
            setCurrentLine('Recursively sort right partition');
            await quickSort(arr, pivotIndex + 1, right);
        }
        return arr;
    };

    const partition = async (arr, left, right) => {
        const pivot = arr[right];
        let i = left - 1;

        setCurrentLine('Partitioning array');
        for (let j = left; j < right; j++) {
            if (!sortingRef.current) return;
            while (pausedRef.current) {
                await sleep(100);
            }

            setCurrentLine('Compare elements with pivot');
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                setArray([...arr]);
                await sleep(500);
            }
        }

        [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
        setArray([...arr]);
        await sleep(500);

        return i + 1;
    };

    // Start sorting
    const startSort = async () => {
        setSorting(true);
        sortingRef.current = true;
        await quickSort([...array], 0, array.length - 1);
        setSorting(false);
        setCurrentLine('Sorting completed!');
    };

    // Toggle pause
    const togglePause = () => {
        setPaused(!paused);
        pausedRef.current = !pausedRef.current;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-indigo-600">
                    QuickSort Visualizer
                </h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Code Section */}
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">Algorithm Steps</h2>
                        <div className="font-mono text-sm bg-gray-50 p-4 rounded">
                            <pre className={currentLine === 'Partitioning array' ? 'bg-yellow-100' : ''}>
                                partition(arr, left, right) {'\n'}
                                pivot = arr[right]
                            </pre>
              // Update this section in the code
                            <pre className={currentLine === 'Compare elements with pivot' ? 'bg-yellow-100' : ''}>
                                {'for each element in range(left, right): \n'}
                                {'  if element < pivot: \n'}
                                {'    swap elements'}
                            </pre>

                            <pre className={currentLine?.includes('Recursively sort') ? 'bg-yellow-100' : ''}>
                                quickSort(arr, left, pivotIndex - 1) {'\n'}
                                quickSort(arr, pivotIndex + 1, right)
                            </pre>
                        </div>
                    </div>

                    {/* Visualization Section */}
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex justify-center items-end h-64 mb-8">
                            {array.map((value, idx) => (
                                <div
                                    key={idx}
                                    className="w-8 mx-1 bg-indigo-500 rounded-t-lg transition-all duration-300"
                                    style={{ height: `${value * 3}px` }}
                                ></div>
                            ))}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={startSort}
                                disabled={sorting}
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Sort
                            </button>
                            <button
                                onClick={togglePause}
                                disabled={!sorting}
                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
                            >
                                {paused ? 'Resume' : 'Pause'}
                            </button>
                            <button
                                onClick={handleReset}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Reset
                            </button>
                            <button
                                onClick={generateArray}
                                disabled={sorting}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                            >
                                New Array
                            </button>
                        </div>

                        <div className="mt-4 text-center text-gray-600">
                            {currentLine && <p>Current Step: {currentLine}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickSortVisualizer;
