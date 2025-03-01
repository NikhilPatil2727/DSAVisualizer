import React, { useState, useEffect, useCallback } from 'react';
import { 
  Crown, ChevronLeft, ChevronRight, Play, Pause, SkipForward, 
  RotateCcw, Info, BookOpen, Code, Settings 
} from 'lucide-react';

const NQueensVisualizer = () => {
  const [boardSize, setBoardSize] = useState(4);
  const [queens, setQueens] = useState([]);
  const [isSolving, setIsSolving] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showDryRun, setShowDryRun] = useState(false);
  const [solutions, setAllSolutions] = useState([]);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
  const [dryRunType, setDryRunType] = useState('step-by-step'); // Only step-by-step and animated modes
  const [dryRunStep, setDryRunStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [boardTheme, setBoardTheme] = useState('classic');
  const [showSettings, setShowSettings] = useState(false);
  const [attackedCells, setAttackedCells] = useState([]);
  const [currentRow, setCurrentRow] = useState(null);
  const [dryRunSteps, setDryRunSteps] = useState([]);
  const [showSolutionsList, setShowSolutionsList] = useState(false);

  // Reset board state when boardSize changes
  useEffect(() => {
    setQueens([]);
    setAllSolutions([]);
    setCurrentSolutionIndex(0);
    setAttackedCells([]);
    setCurrentRow(null);
  }, [boardSize]);

  // Calculate attacked cells based on queen positions
  useEffect(() => {
    if (queens.length === 0) {
      setAttackedCells([]);
      return;
    }
    const attacked = [];
    queens.forEach(([queenRow, queenCol]) => {
      // same row & column
      for (let col = 0; col < boardSize; col++) {
        if (col !== queenCol) attacked.push([queenRow, col]);
      }
      for (let row = 0; row < boardSize; row++) {
        if (row !== queenRow) attacked.push([row, queenCol]);
      }
      // diagonals
      for (let i = 1; i < boardSize; i++) {
        if (queenRow - i >= 0 && queenCol - i >= 0)
          attacked.push([queenRow - i, queenCol - i]);
        if (queenRow - i >= 0 && queenCol + i < boardSize)
          attacked.push([queenRow - i, queenCol + i]);
        if (queenRow + i < boardSize && queenCol - i >= 0)
          attacked.push([queenRow + i, queenCol - i]);
        if (queenRow + i < boardSize && queenCol + i < boardSize)
          attacked.push([queenRow + i, queenCol + i]);
      }
    });
    const uniqueAttacked = attacked.filter(
      (cell, index, self) =>
        index === self.findIndex(t => t[0] === cell[0] && t[1] === cell[1])
    );
    setAttackedCells(uniqueAttacked);
  }, [queens, boardSize]);

  // Check if position is valid for placing a queen
  const isValidPosition = useCallback((row, col, currentQueens) => {
    for (const [queenRow, queenCol] of currentQueens) {
      if (queenRow === row || queenCol === col) return false;
      if (Math.abs(queenRow - row) === Math.abs(queenCol - col)) return false;
    }
    return true;
  }, []);

  // Solve N-Queens using backtracking
  const solveNQueens = useCallback(() => {
    setIsSolving(true);
    setQueens([]);
    setAllSolutions([]);
    setCurrentSolutionIndex(0);
    setAttackedCells([]);
    setCurrentRow(null);

    const solutions = [];
    const backtrack = (row, currentQueens = []) => {
      if (row === boardSize) {
        solutions.push([...currentQueens]);
        return;
      }
      for (let col = 0; col < boardSize; col++) {
        if (isValidPosition(row, col, currentQueens)) {
          currentQueens.push([row, col]);
          backtrack(row + 1, currentQueens);
          currentQueens.pop();
        }
      }
    };

    backtrack(0);
    setAllSolutions(solutions);
    if (solutions.length > 0) {
      setQueens(solutions[0]);
    }
    setIsSolving(false);
  }, [boardSize, isValidPosition]);

  const showNextSolution = useCallback(() => {
    if (solutions.length === 0) return;
    const nextIndex = (currentSolutionIndex + 1) % solutions.length;
    setCurrentSolutionIndex(nextIndex);
    setQueens(solutions[nextIndex]);
  }, [solutions, currentSolutionIndex]);

  const showPrevSolution = useCallback(() => {
    if (solutions.length === 0) return;
    const prevIndex = (currentSolutionIndex - 1 + solutions.length) % solutions.length;
    setCurrentSolutionIndex(prevIndex);
    setQueens(solutions[prevIndex]);
  }, [solutions, currentSolutionIndex]);

  // Generate dry run steps for visualization
  const generateDryRunSteps = useCallback(() => {
    const steps = [{ queens: [], description: 'Start with an empty board', currentRow: 0 }];
    const backtrackWithSteps = (row, currentQueens = [], depth = 0) => {
      if (depth > 50) return false; // limit depth
      if (row === boardSize) {
        steps.push({
          queens: [...currentQueens],
          description: `Solution found with ${currentQueens.length} queens!`,
          currentRow: null
        });
        return true;
      }
      steps.push({
        queens: [...currentQueens],
        description: `Looking for valid position in row ${row}`,
        currentRow: row
      });
      for (let col = 0; col < boardSize; col++) {
        if (isValidPosition(row, col, currentQueens)) {
          steps.push({
            queens: [...currentQueens],
            description: `Testing position (${row}, ${col})`,
            currentRow: row
          });
          currentQueens.push([row, col]);
          steps.push({
            queens: [...currentQueens],
            description: `Place queen at (${row}, ${col})`,
            currentRow: row + 1
          });
          if (backtrackWithSteps(row + 1, currentQueens, depth + 1)) {
            return true;
          }
          currentQueens.pop();
          steps.push({
            queens: [...currentQueens],
            description: `Backtrack: Remove queen from (${row}, ${col})`,
            currentRow: row
          });
        } else {
          steps.push({
            queens: [...currentQueens],
            description: `Position (${row}, ${col}) is invalid`,
            currentRow: row
          });
        }
      }
      steps.push({
        queens: [...currentQueens],
        description: `No valid positions in row ${row}, backtracking...`,
        currentRow: row - 1
      });
      return false;
    };
    backtrackWithSteps(0);
    return steps;
  }, [boardSize, isValidPosition]);

  useEffect(() => {
    if (showDryRun) {
      const steps = generateDryRunSteps();
      setDryRunSteps(steps);
      setDryRunStep(0);
      if (steps.length > 0) {
        setQueens(steps[0].queens);
        setCurrentRow(steps[0].currentRow ?? null);
      }
    }
  }, [showDryRun, generateDryRunSteps]);

  // Handle animated dry run steps
  useEffect(() => {
    let animationTimer;
    if (isAnimating && dryRunType === 'animated' && dryRunStep < dryRunSteps.length - 1) {
      animationTimer = setTimeout(() => {
        const nextStep = dryRunStep + 1;
        setDryRunStep(nextStep);
        setQueens(dryRunSteps[nextStep].queens);
        setCurrentRow(dryRunSteps[nextStep].currentRow ?? null);
        if (nextStep === dryRunSteps.length - 1) setIsAnimating(false);
      }, animationSpeed);
    }
    return () => {
      if (animationTimer) clearTimeout(animationTimer);
    };
  }, [isAnimating, dryRunStep, dryRunSteps, dryRunType, animationSpeed]);

  const goToNextDryRunStep = useCallback(() => {
    if (dryRunStep < dryRunSteps.length - 1) {
      const nextStep = dryRunStep + 1;
      setDryRunStep(nextStep);
      setQueens(dryRunSteps[nextStep].queens);
      setCurrentRow(dryRunSteps[nextStep].currentRow ?? null);
    }
  }, [dryRunStep, dryRunSteps]);

  const goToPrevDryRunStep = useCallback(() => {
    if (dryRunStep > 0) {
      const prevStep = dryRunStep - 1;
      setDryRunStep(prevStep);
      setQueens(dryRunSteps[prevStep].queens);
      setCurrentRow(dryRunSteps[prevStep].currentRow ?? null);
    }
  }, [dryRunStep, dryRunSteps]);

  const toggleAnimation = useCallback(() => {
    setIsAnimating(prev => !prev);
  }, []);

  const resetDryRun = useCallback(() => {
    setDryRunStep(0);
    if (dryRunSteps.length > 0) {
      setQueens(dryRunSteps[0].queens);
      setCurrentRow(dryRunSteps[0].currentRow ?? null);
    }
    setIsAnimating(false);
  }, [dryRunSteps]);

  const skipToEnd = useCallback(() => {
    if (dryRunSteps.length > 0) {
      const lastStep = dryRunSteps.length - 1;
      setDryRunStep(lastStep);
      setQueens(dryRunSteps[lastStep].queens);
      setCurrentRow(dryRunSteps[lastStep].currentRow ?? null);
      setIsAnimating(false);
    }
  }, [dryRunSteps]);

  // Styling functions for board cells and queen icon
  const getCellStyles = useCallback((isBlack) => {
    switch (boardTheme) {
      case 'classic':
        return isBlack ? 'bg-gray-700' : 'bg-gray-200';
      case 'modern':
        return isBlack ? 'bg-indigo-700' : 'bg-indigo-100';
      case 'wooden':
        // Dark wood theme: darker wood tones for a moody look
        return isBlack ? 'bg-amber-900' : 'bg-amber-700';
      default:
        return isBlack ? 'bg-gray-700' : 'bg-gray-200';
    }
  }, [boardTheme]);

  const getQueenStyles = useCallback(() => {
    switch (boardTheme) {
      case 'classic':
        return 'text-yellow-500';
      case 'modern':
        return 'text-purple-600';
      case 'wooden':
        // Use white for contrast on dark wood
        return 'text-white';
      default:
        return 'text-yellow-500';
    }
  }, [boardTheme]);

  return (
    <div className="max-w-7xl w-full mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
        <h1 className="text-3xl font-bold text-center">N-Queens Backtracking Visualizer</h1>
        <p className="text-center opacity-90 mt-1">
          Visualize how the backtracking algorithm solves the N-Queens problem
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Left Column - Controls */}
        <div className="bg-gray-50 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Click on Setting for Customization</h2>
            <button 
              onClick={() => setShowSettings(prev => !prev)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>

          {showSettings && (
            <div className="mb-6 p-4 bg-white rounded-lg shadow-inner">
              <h3 className="text-lg font-medium mb-1 text-gray-700">Settings</h3>
              {/* Additional customization text */}
              <p className="text-xs text-gray-500 mb-2">
                Customization Panel: Adjust your board theme, animation speed, and more to personalize your experience.
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Customize your chessboard appearance and animation settings below.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Board Theme:</label>
                  <select
                    value={boardTheme}
                    onChange={e => setBoardTheme(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="classic">Classic</option>
                    <option value="modern">Modern</option>
                    <option value="wooden">Dark Wooden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Animation Speed:</label>
                  <div className="flex items-center">
                    <span className="text-xs mr-2">Slow</span>
                    <input
                      type="range"
                      min="200"
                      max="2000"
                      step="100"
                      value={animationSpeed}
                      onChange={e => setAnimationSpeed(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-xs ml-2">Fast</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Board Size Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">Board Size (N):</label>
            <div className="flex items-center">
              <input
                type="range"
                min="4"
                max="12"
                value={boardSize}
                onChange={e => setBoardSize(parseInt(e.target.value))}
                className="w-full mr-3"
              />
              <span className="text-lg font-semibold w-8 text-center text-indigo-700">{boardSize}</span>
            </div>
          </div>

          {/* Main Control Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={solveNQueens}
              disabled={isSolving}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-md flex items-center justify-center"
            >
              {isSolving ? 'Solving...' : 'Solve N-Queens'}
            </button>
            {solutions.length > 0 && !showDryRun && (
              <div className="flex space-x-2">
                <button
                  onClick={showPrevSolution}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition shadow-sm flex items-center justify-center"
                >
                  <ChevronLeft size={18} className="mr-1" /> Previous
                </button>
                <button
                  onClick={showNextSolution}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition shadow-sm flex items-center justify-center"
                >
                  Next <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            )}
          </div>

          {solutions.length > 0 && !showDryRun && (
            <div className="mt-4 text-center">
              <p className="text-indigo-700 font-medium">
                Solution {currentSolutionIndex + 1} of {solutions.length}
              </p>
            </div>
          )}

          {/* Toggle Explanation, Dry Run, and Solutions Panel */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                setShowExplanation(prev => !prev);
                if (showDryRun && !showExplanation) setShowDryRun(false);
              }}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition shadow-sm flex items-center justify-center"
            >
              <Info size={18} className="mr-2" />
              {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
            </button>
            <button
              onClick={() => {
                setShowDryRun(prev => !prev);
                if (showExplanation && !showDryRun) setShowExplanation(false);
                if (!showDryRun) setIsAnimating(false);
              }}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition shadow-sm flex items-center justify-center"
            >
              <BookOpen size={18} className="mr-2" />
              {showDryRun ? 'Hide Dry Run' : 'Show Dry Run'}
            </button>
            <button
              onClick={() => setShowSolutionsList(prev => !prev)}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition shadow-sm flex items-center justify-center"
            >
              Solutions
            </button>
          </div>

          {/* Solutions List Panel */}
          {showSolutionsList && solutions.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-inner max-h-60 overflow-y-auto">
              <h3 className="text-lg font-medium mb-3 text-gray-700">All Solutions</h3>
              {solutions.map((sol, i) => (
                <div 
                  key={i}
                  onClick={() => {
                    setCurrentSolutionIndex(i);
                    setQueens(solutions[i]);
                    setShowSolutionsList(false);
                  }}
                  className={`p-2 mb-2 border rounded cursor-pointer hover:bg-gray-100 ${i === currentSolutionIndex ? 'bg-indigo-100' : 'bg-white'}`}
                >
                  <p className="text-sm font-medium text-gray-800">Solution {i + 1}:</p>
                  <p className="text-xs text-gray-600">
                    {sol.map(([r, c]) => `(${r},${c})`).join(' - ')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Dry Run Options */}
          {showDryRun && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-inner">
              <h3 className="text-lg font-medium mb-3 text-gray-700">Dry Run Options</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">Visualization Type:</label>
                <select
                  value={dryRunType}
                  onChange={e => setDryRunType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="step-by-step">Step-by-Step</option>
                  <option value="animated">Animated</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {dryRunType === 'step-by-step' && (
                  <>
                    <button
                      onClick={goToPrevDryRunStep}
                      disabled={dryRunStep === 0}
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-medium py-1.5 px-2 rounded-lg transition shadow-sm flex items-center justify-center"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={goToNextDryRunStep}
                      disabled={dryRunStep === dryRunSteps.length - 1}
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-medium py-1.5 px-2 rounded-lg transition shadow-sm flex items-center justify-center"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
                {dryRunType === 'animated' && (
                  <>
                    <button
                      onClick={toggleAnimation}
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-1.5 px-2 rounded-lg transition shadow-sm flex items-center justify-center"
                    >
                      {isAnimating ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      onClick={resetDryRun}
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-1.5 px-2 rounded-lg transition shadow-sm flex items-center justify-center"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={skipToEnd}
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-1.5 px-2 rounded-lg transition shadow-sm flex items-center justify-center"
                    >
                      <SkipForward size={16} />
                    </button>
                  </>
                )}
              </div>
              {dryRunSteps.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-1">
                    Step {dryRunStep + 1} of {dryRunSteps.length}
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg text-sm">
                    {dryRunSteps[dryRunStep].description}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Middle Column - Chessboard */}
        <div className="bg-gray-50 rounded-xl p-5 shadow-md flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Chessboard ({boardSize}×{boardSize})
          </h2>
          <div className="relative" style={{ width: '100%', maxWidth: '400px' }}>
            <div 
              className="grid border-2 border-gray-800 rounded-sm shadow-lg"
              style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)`, aspectRatio: '1/1' }}
            >
              {Array.from({ length: boardSize * boardSize }).map((_, index) => {
                const row = Math.floor(index / boardSize);
                const col = index % boardSize;
                const isBlack = (row + col) % 2 === 1;
                const hasQueen = queens.some(([r, c]) => r === row && c === col);
                const isAttacked = attackedCells.some(([r, c]) => r === row && c === col);
                const isCurrentRow = currentRow === row;
                return (
                  <div 
                    key={index}
                    className={`relative ${getCellStyles(isBlack)} flex items-center justify-center transition-all duration-200
                      ${isCurrentRow && !hasQueen ? 'ring-2 ring-blue-400 ring-inset' : ''}
                      ${isAttacked && !hasQueen ? 'after:absolute after:inset-0 after:bg-red-500 after:opacity-20' : ''}
                    `}
                  >
                    {hasQueen && (
                      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                        <Crown size={24} className={`${getQueenStyles()} drop-shadow-md`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {solutions.length > 0 && !showDryRun && (
            <div className="mt-4 text-center">
              <p className="font-medium text-indigo-700">
                Found {solutions.length} solution{solutions.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          {showDryRun && (
            <div className="w-full mt-4 bg-indigo-50 p-3 rounded-lg">
              <div className="flex items-center text-indigo-700 mb-2">
                <Code size={18} className="mr-2" />
                <span className="font-medium">Legend</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-400 mr-2"></div>
                  <span>Current row</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 opacity-20 mr-2"></div>
                  <span>Attacked cell</span>
                </div>
                <div className="flex items-center">
                  <Crown size={16} className={`${getQueenStyles()} mr-2`} />
                  <span>Placed queen</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Information */}
        <div className="bg-gray-50 rounded-xl p-5 shadow-md max-h-[600px] overflow-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Information</h2>
          <div className="prose prose-sm">
            <h3 className="text-lg font-medium text-indigo-700">The N-Queens Problem</h3>
            <p>
              The N-Queens problem asks: "How can N queens be placed on an N×N chessboard so that no queen attacks any other queen?"
            </p>
            <p>
              In chess, a queen can attack any piece that shares its row, column, or diagonal. The challenge is to place N queens on the board so that none are under attack.
            </p>
            <p>
              For a standard 8×8 chess board, there are 92 distinct solutions. The problem has solutions for all N ≥ 4.
            </p>
            {showExplanation && (
              <>
                <h3 className="text-lg font-medium mt-4 text-indigo-700">Backtracking Algorithm</h3>
                <p>
                  Backtracking is an algorithmic technique that incrementally builds candidates for solutions and abandons a candidate ("backtracks") as soon as it determines the candidate cannot lead to a valid solution.
                </p>
                <p>The N-Queens algorithm works as follows:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Start with an empty board</li>
                  <li>Place a queen in the first available valid position in the current row</li>
                  <li>Move to the next row and repeat step 2</li>
                  <li>If no valid position exists in the current row, backtrack to the previous row and try the next position</li>
                  <li>If all queens are placed successfully, a solution is found</li>
                  <li>To find all solutions, continue backtracking after finding a solution</li>
                </ol>
                <p>
                  The time complexity is O(N!), as in the worst case, we might need to explore all possible arrangements.
                </p>
                <h3 className="text-lg font-medium mt-4 text-indigo-700">Checking Valid Positions</h3>
                <p>For a position to be valid for a queen:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>No other queen can be in the same row</li>
                  <li>No other queen can be in the same column</li>
                  <li>No other queen can be on the same diagonal</li>
                </ul>
                <p>
                  Two queens are on the same diagonal if the absolute difference between their rows equals the absolute difference between their columns.
                </p>
                <h3 className="text-lg font-medium mt-4 text-indigo-700">Optimizations</h3>
                <p>Several optimizations can be applied to the N-Queens problem:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Place one queen per row (reduces the search space)</li>
                  <li>Use bit manipulation for faster checking of valid positions</li>
                  <li>Exploit symmetry to reduce the number of solutions to compute</li>
                  <li>Use iterative deepening to find solutions more efficiently</li>
                </ul>
              </>
            )}
            <h3 className="text-lg font-medium mt-4 text-indigo-700">Fun Facts</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>For N=1, there is 1 solution</li>
              <li>For N=4, there are 2 solutions</li>
              <li>For N=8, there are 92 solutions</li>
              <li>For N=9, there are 352 solutions</li>
              <li>No solution exists for N=2 and N=3</li>
              <li>The N-Queens problem is often used to teach recursion and backtracking</li>
              <li>The problem was first posed in 1848 by chess player Max Bezzel</li>
              <li>The number of solutions for N=27 is approximately 2.34 × 10^16</li>
            </ul>
            <h3 className="text-lg font-medium mt-4 text-indigo-700">Applications</h3>
            <p>The N-Queens problem has applications in:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Parallel memory schemes</li>
              <li>VLSI testing</li>
              <li>Traffic control</li>
              <li>Deadlock prevention in concurrent programming</li>
              <li>Neural networks</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 border-t border-gray-200">
        <p className="text-center text-gray-600 text-sm">
          N-Queens Backtracking Visualizer 
        </p>
      </div>
    </div>
  );
};

export default NQueensVisualizer;
