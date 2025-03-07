import React, { useState, useEffect } from 'react';

const GCDVisualizer = () => {
  const [numberA, setNumberA] = useState(48);
  const [numberB, setNumberB] = useState(18);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [error, setError] = useState('');

  // Calculate GCD steps
  const calculateGCDSteps = (a, b) => {
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
      setError('Please enter positive integers only');
      return [];
    }
    
    setError('');
    let steps = [];
    let x = Math.max(a, b);
    let y = Math.min(a, b);
    
    steps.push({
      a: x,
      b: y,
      remainder: x % y,
      quotient: Math.floor(x / y),
      explanation: `Start with ${x} and ${y}. ${x} = ${y} × ${Math.floor(x / y)} + ${x % y}`
    });
    
    while (y !== 0) {
      const remainder = x % y;
      const quotient = Math.floor(x / y);
      
      x = y;
      y = remainder;
      
      steps.push({
        a: x,
        b: y,
        remainder,
        quotient,
        explanation: y !== 0 ? 
          `Use ${x} and ${y}. ${x} = ${y} × ${quotient} + ${remainder}` : 
          `Since remainder is 0, GCD = ${x}`
      });
    }
    
    return steps;
  };

  // Handle input changes
  const handleNumberChange = (e, setter) => {
    const value = parseInt(e.target.value, 10);
    setter(value);
  };

  // Recalculate GCD when inputs change
  useEffect(() => {
    const gcdSteps = calculateGCDSteps(numberA, numberB);
    setSteps(gcdSteps);
    setCurrentStep(0);
  }, [numberA, numberB]);

  // Start animation
  const startAnimation = () => {
    if (steps.length === 0) return;
    
    setIsAnimating(true);
    setCurrentStep(0);
  };

  // Handle animation steps
  useEffect(() => {
    let timer;
    
    if (isAnimating && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, animationSpeed);
    } else if (currentStep >= steps.length - 1) {
      setIsAnimating(false);
    }
    
    return () => clearTimeout(timer);
  }, [isAnimating, currentStep, steps.length, animationSpeed]);

  // Reset animation
  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentStep(0);
  };

  // Arrow component for visualization
  const Arrow = () => (
    <div className="flex items-center justify-center my-2">
      <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  );

  // Number block component for visualization
  const NumberBlock = ({ number, label, highlight }) => (
    <div className={`flex flex-col items-center transition-all duration-500 transform ${highlight ? 'scale-110' : 'scale-100'}`}>
      <div className={`w-16 h-16 flex items-center justify-center rounded-lg text-xl font-bold shadow-md 
        ${highlight ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
        {number}
      </div>
      <div className="mt-1 text-sm text-gray-600">{label}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Euclidean Algorithm (GCD) Visualizer</h1>
      
      {/* Input controls */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Number A</label>
          <input
            type="number"
            value={numberA}
            onChange={(e) => handleNumberChange(e, setNumberA)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Number B</label>
          <input
            type="number"
            value={numberB}
            onChange={(e) => handleNumberChange(e, setNumberB)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Animation Speed</label>
          <select
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseInt(e.target.value, 10))}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2000}>Slow</option>
            <option value={1000}>Medium</option>
            <option value={500}>Fast</option>
          </select>
        </div>
      </div>
      
      {/* Animation controls */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={startAnimation}
          disabled={isAnimating || steps.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Start Animation
        </button>
        
        <button
          onClick={resetAnimation}
          disabled={!isAnimating && currentStep === 0}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
        >
          Reset
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}
      
      {/* GCD visualization */}
      {steps.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
          <div className="text-center mb-4 font-medium">
            Step {currentStep + 1} of {steps.length}
          </div>
          
          <div className="flex justify-center items-center gap-6 mb-6">
            <NumberBlock 
              number={steps[currentStep].a} 
              label="A" 
              highlight={true} 
            />
            
            <div className="text-xl font-bold">÷</div>
            
            <NumberBlock 
              number={steps[currentStep].b} 
              label="B" 
              highlight={steps[currentStep].b !== 0} 
            />
          </div>
          
          {steps[currentStep].b !== 0 && (
            <>
              <Arrow />
              
              <div className="flex justify-center items-center gap-6 mb-6">
                <NumberBlock 
                  number={steps[currentStep].quotient} 
                  label="Quotient" 
                  highlight={false} 
                />
                
                <div className="text-xl font-bold">R</div>
                
                <NumberBlock 
                  number={steps[currentStep].remainder} 
                  label="Remainder" 
                  highlight={true} 
                />
              </div>
            </>
          )}
          
          <div className="text-center mt-4 p-3 bg-white rounded-md shadow-sm">
            {steps[currentStep].explanation}
          </div>
          
          {currentStep === steps.length - 1 && (
            <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-md text-center font-bold">
              GCD({numberA}, {numberB}) = {steps[steps.length - 1].a}
            </div>
          )}
        </div>
      )}
      
      {/* Algorithm explanation */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Euclidean Algorithm Explanation</h2>
        
        <p className="mb-3">
          The Euclidean algorithm is an efficient method for computing the greatest common divisor (GCD) of two numbers.
        </p>
        
        <ol className="list-decimal pl-6 space-y-2 mb-3">
          <li>Take two numbers A and B.</li>
          <li>Divide the larger number by the smaller one.</li>
          <li>Replace the larger number with the smaller number.</li>
          <li>Replace the smaller number with the remainder from the division.</li>
          <li>Repeat until the remainder is 0.</li>
          <li>The last non-zero remainder is the GCD.</li>
        </ol>
        
        <p>
          The algorithm is based on the observation that if A = BQ + R, then gcd(A, B) = gcd(B, R).
        </p>
      </div>
    </div>
  );
};

export default GCDVisualizer;