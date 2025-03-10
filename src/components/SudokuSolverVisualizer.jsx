import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useImmer } from 'use-immer';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------- Cell Component --------------------
const Cell = ({ value, row, col, currentCell, conflicts, solving, onChange }) => {
  const isHighlighted = currentCell[0] === row && currentCell[1] === col;
  const isConflict = conflicts[`${row}-${col}`];
  const isFixed = value !== 0 && !isHighlighted && !isConflict;
  
  // Calculate box position for styling
  const isLastInBox = (col + 1) % 3 === 0 && col !== 8;
  const isLastInBoxRow = (row + 1) % 3 === 0 && row !== 8;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        backgroundColor: isHighlighted 
          ? '#FBBF24' // Yellow for highlighted
          : isConflict 
            ? '#F87171' // Red for conflicts
            : isFixed 
              ? '#E5E7EB' // Gray for fixed numbers
              : '#FFFFFF', // White for empty/editable
      }}
      transition={{ duration: 0.2 }}
      className={`
        relative h-10 sm:h-12 md:h-14 aspect-square flex items-center justify-center
        border border-gray-300 transition-colors
        ${isLastInBox ? 'border-r-2 border-r-gray-900' : ''}
        ${isLastInBoxRow ? 'border-b-2 border-b-gray-900' : ''}
        ${row === 0 ? 'border-t-2 border-t-gray-900' : ''}
        ${col === 0 ? 'border-l-2 border-l-gray-900' : ''}
      `}
    >
      <input
        type="number"
        min="1"
        max="9"
        value={value || ''}
        onChange={(e) => onChange(row, col, e.target.value)}
        className={`
          w-full h-full text-center focus:outline-none rounded-sm
          text-lg sm:text-xl md:text-2xl font-semibold
          ${isFixed ? 'text-gray-700' : 'text-blue-600'}
          ${isHighlighted ? 'text-gray-800 font-bold' : ''}
          ${isConflict ? 'text-red-700 font-bold' : ''}
          bg-transparent focus:bg-blue-50 transition-all
        `}
        disabled={solving}
      />
    </motion.div>
  );
};

// -------------------- Board Component --------------------
const Board = ({ grid, currentCell, conflicts, solving, onCellChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-xl p-2 sm:p-3 md:p-4 border-2 border-gray-900"
    >
      <div className="grid grid-cols-9 gap-0">
        {grid.map((row, i) =>
          row.map((cell, j) => (
            <Cell
              key={`${i}-${j}`}
              value={cell}
              row={i}
              col={j}
              currentCell={currentCell}
              conflicts={conflicts}
              solving={solving}
              onChange={onCellChange}
            />
          ))
        )}
      </div>
    </motion.div>
  );
};

// -------------------- Button Component --------------------
const Button = ({ onClick, disabled, className, children }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg font-medium shadow-md
        transition-all disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

// -------------------- Controls Component --------------------
const Controls = ({
  solving,
  paused,
  onPauseToggle,
  onRandomPuzzle,
  onClear,
  onSolve,
  speed,
  setSpeed,
  status,
}) => {
  return (
    <div className="w-full max-w-3xl mb-6 flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={onRandomPuzzle}
          disabled={solving && !paused}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Random Puzzle
        </Button>
        
        <Button
          onClick={onClear}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Clear
        </Button>
        
        {!solving && (
          <Button
            onClick={onSolve}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Solve
          </Button>
        )}
        
        {solving && (
          <Button
            onClick={onPauseToggle}
            className={`${paused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
          >
            {paused ? 'Resume' : 'Stop'}
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-lg shadow">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-gray-700 font-medium whitespace-nowrap">Speed:</span>
          <input
            type="range"
            min="10"
            max="200"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full sm:w-32 accent-blue-600"
          />
          <span className="text-sm text-gray-500">{speed}ms</span>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md">
          <div className={`h-3 w-3 rounded-full ${
            status === "Idle" ? "bg-gray-500" :
            status === "Paused" ? "bg-yellow-500" : "bg-green-500 animate-pulse"
          }`}></div>
          <span className="text-gray-800 font-medium">{status}</span>
        </div>
      </div>
    </div>
  );
};

// -------------------- History Component --------------------
const HistorySteps = ({ history }) => {
  const historyRef = useRef(null);
  
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-3xl mt-6"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800">Solution Steps</h2>
        <span className="text-sm text-gray-500 font-medium">{history.length} steps</span>
      </div>
      
      <div 
        ref={historyRef}
        className="h-48 overflow-y-auto bg-white rounded-lg shadow-md border border-gray-200 p-4"
      >
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No steps recorded yet. Click "Solve" to see the solution process.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {history.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-50 rounded p-2 text-sm border-l-4 border-blue-500"
              >
                <div className="font-semibold text-gray-700">Step {index + 1}</div>
                <div>
                  Placed <span className="text-blue-600 font-bold">{step.num}</span> at position (<span className="text-gray-800">{step.row + 1}</span>, <span className="text-gray-800">{step.col + 1}</span>)
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// -------------------- Instructions Component --------------------
const Instructions = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="w-full max-w-3xl mt-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-white p-3 rounded-lg shadow text-left font-medium text-gray-700 hover:bg-gray-50"
      >
        <span>How to use the Sudoku Solver</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white mt-2 p-4 rounded-lg shadow overflow-hidden"
          >
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Click "Random Puzzle" to generate a new, solvable puzzle.</li>
              <li>Numbers that conflict with Sudoku rules will be highlighted in red.</li>
              <li>Click "Solve" to watch the backtracking algorithm solve the puzzle step by step.</li>
              <li>Use the speed slider to control how fast the algorithm runs.</li>
              <li>Use the "Stop" button to pause the solving process.</li>
              <li>The "Solution Steps" section shows each step the algorithm takes.</li>
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// -------------------- Main SudokuSolver Component --------------------
const SudokuSolverVisualizer = () => {
  // State Initialization using Immer for grid updates.
  const [grid, setGrid] = useImmer(Array(9).fill().map(() => Array(9).fill(0)));
  const [solving, setSolving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentCell, setCurrentCell] = useState([-1, -1]);
  const [speed, setSpeed] = useState(50);
  const [conflicts, setConflicts] = useState({});
  const [history, setHistory] = useState([]);
  const [solveStep, setSolveStep] = useState(0);

  // Refs for pause and cancel control in async loops
  const pausedRef = useRef(paused);
  const cancelSolvingRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // -------------------- Validation Helpers --------------------
  const isValid = (board, row, col, num) => {
    for (let i = 0; i < 9; i++) {
      if (i !== col && board[row][i] === num) return false;
      if (i !== row && board[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const r = startRow + i;
        const c = startCol + j;
        if ((r !== row || c !== col) && board[r][c] === num) return false;
      }
    }
    return true;
  };

  const findEmpty = (board) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) return [i, j];
      }
    }
    return null;
  };

  const validateEntireGrid = (board) => {
    const newConflicts = {};
    let hasConflicts = false;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== 0) {
          const currentValue = board[i][j];
          board[i][j] = 0;
          const valid = isValid(board, i, j, currentValue);
          board[i][j] = currentValue;
          if (!valid) {
            newConflicts[`${i}-${j}`] = true;
            hasConflicts = true;
          }
        }
      }
    }
    setConflicts(newConflicts);
    return !hasConflicts;
  };

  // -------------------- Shuffle Helper --------------------
  const shuffleArray = (arr) => {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // -------------------- Puzzle Generation Helpers --------------------
  // Generates a complete (solved) sudoku board using backtracking.
  const generateCompleteSudoku = () => {
    let board = Array(9).fill().map(() => Array(9).fill(0));
    const fillBoard = () => {
      const empty = findEmpty(board);
      if (!empty) return true;
      const [row, col] = empty;
      const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (let num of numbers) {
        if (isValid(board, row, col, num)) {
          board[row][col] = num;
          if (fillBoard()) return true;
          board[row][col] = 0;
        }
      }
      return false;
    };
    fillBoard();
    return board;
  };

  // Removes a given number of cells (set to 0) from a complete board.
  const removeCells = (board, count) => {
    let newBoard = board.map(row => row.slice());
    while (count > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (newBoard[row][col] !== 0) {
        newBoard[row][col] = 0;
        count--;
      }
    }
    return newBoard;
  };

  // -------------------- Solve Function (with Pause/Resume & Cancel) --------------------
  const solve = useCallback(async () => {
    const boardCopy = grid.map(row => [...row]);
    if (!validateEntireGrid(boardCopy)) {
      alert("The current puzzle has conflicts. Please fix them before solving.");
      return false;
    }
    setSolving(true);
    setPaused(false);
    cancelSolvingRef.current = false;
    setHistory([]);
    setSolveStep(0);
    const solveInternal = async (board, step = 0) => {
      if (cancelSolvingRef.current) return false;
      while (pausedRef.current) {
        if (cancelSolvingRef.current) return false;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const empty = findEmpty(board);
      if (!empty) {
        setGrid(board.map(row => [...row]));
        return true;
      }
      const [row, col] = empty;
      setSolveStep(step);
      const candidates = shuffleArray([1,2,3,4,5,6,7,8,9]);
      for (const num of candidates) {
        if (cancelSolvingRef.current) return false;
        while (pausedRef.current) {
          if (cancelSolvingRef.current) return false;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (isValid(board, row, col, num)) {
          board[row][col] = num;
          setCurrentCell([row, col]);
          const newHistoryItem = { row, col, num, step: step + 1 };
          setHistory(prev => [...prev, newHistoryItem]);
          setGrid(board.map(r => [...r]));
          await new Promise(resolve => setTimeout(resolve, speed));
          if (await solveInternal(board, step + 1)) return true;
          board[row][col] = 0;
          setCurrentCell([row, col]);
          setGrid(board.map(r => [...r]));
          await new Promise(resolve => setTimeout(resolve, speed));
        }
      }
      return false;
    };
    const solved = await solveInternal(boardCopy);
    setSolving(false);
    setPaused(false);
    setCurrentCell([-1, -1]);
    if (!solved && !cancelSolvingRef.current) {
      alert("No solution exists for the given puzzle.");
    }
    return solved;
  }, [grid, setGrid, speed]);

  // -------------------- Event Handlers --------------------
  // Updated Random Puzzle: generate a complete sudoku and remove cells to create a solvable puzzle.
  const handleRandomPuzzle = () => {
    const complete = generateCompleteSudoku();
    // Remove 40 cells for a moderate difficulty puzzle (adjust count as desired)
    const puzzle = removeCells(complete, 40);
    setGrid(puzzle.map(row => [...row]));
    setHistory([]);
    setConflicts({});
    setCurrentCell([-1, -1]);
  };

  const handleClear = () => {
    cancelSolvingRef.current = true;
    setSolving(false);
    setPaused(false);
    const clearedGrid = Array(9).fill().map(() => Array(9).fill(0));
    setGrid(clearedGrid);
    setHistory([]);
    setConflicts({});
    setCurrentCell([-1, -1]);
  };

  const handleCellChange = (row, col, value) => {
    let num = parseInt(value);
    if (isNaN(num)) num = 0;
    if (num < 0 || num > 9) return;
    setGrid(draft => {
      draft[row][col] = num;
    });
    setTimeout(() => {
      const updatedGrid = grid.map(r => [...r]);
      validateEntireGrid(updatedGrid);
    }, 0);
  };

  const handlePauseToggle = () => {
    setPaused(prev => !prev);
  };

  const status = !solving ? "Idle" : (paused ? "Paused" : "Solving...");

  // -------------------- Render --------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-start">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl text-center mb-6"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-2">
          Sudoku Solver
        </h1>
        <p className="text-gray-600">
          Enter a puzzle or load a sample to watch the backtracking algorithm solve it step by step.
        </p>
      </motion.div>
      
      <Controls
        solving={solving}
        paused={paused}
        onPauseToggle={handlePauseToggle}
        onRandomPuzzle={handleRandomPuzzle}
        onClear={handleClear}
        onSolve={solve}
        speed={speed}
        setSpeed={setSpeed}
        status={status}
      />
      
      <Board
        grid={grid}
        currentCell={currentCell}
        conflicts={conflicts}
        solving={solving}
        onCellChange={handleCellChange}
      />
      
      <HistorySteps history={history} />
      
      <Instructions />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6 text-center text-gray-500 text-sm"
      >
        Note: This solver uses a backtracking algorithm with visualization.
      </motion.div>
    </div>
  );
};

export default SudokuSolverVisualizer;
