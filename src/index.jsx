import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router";
import LinearSearchVisualizer from "./components/LinearSearchVisualizer";
import BinarySearchVisualizer from "./components/BinarySearchVisualizer";
import SearchAlgorithmRace from "./components/SearchAlgorithmRace";
import BubbleSortVisualizer from "./components/BubbleSortVisualizer";
import InsertionSortVisualizer from "./components/InsertionSortVisualizer";
import SelectionSortVisualizer from "./components/SelectionSortVisualizer";
import MergeSortVisualizer from "./components/MergeSortVisualizer";
import QuickSortVisualizer from "./components/QuickSortVisualizer";
import AlgorithmRace from "./components/AlgorithmRace";
import NQueensVisualize from "./components/NQueensVisualize";
import SudokuSolverVisualizer from "./components/SudokuSolverVisualizer";
import BFSVisualizer from "./components/BFSVisualizer";
import DFSVisualizer from "./components/DFSVisualizer";
import DijkstraVisualizer from "./components/DijkstraVisualizer";
import PrimsAlgorithmVisualizer from "./components/PrimsAlgorithmVisualizer";
import KruskalsAlgorithmVisualizer from "./components/KruskalsAlgorithmVisualizer";
import FibonacciVisualizer from "./components/FibonacciVisualizer";
import TreeTraversalVisualizer from "./components/TreeTraversalVisualizer";
import BSTVisualizer from "./components/BSTVisualizer";
import HuffmanCodingVisualizer from "./components/HuffmanCodingVisualizer";
import GCDVisualizer from "./components/GCDVisualizer";

import Home from "./components/Home";

// Sticky Navbar Component
const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-gray-800 text-white px-4 py-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
    
        <Link to="/" className="text-xl font-bold">
       
          DSA Visualizer
        </Link>
        <div>
          <Link to="/" className="mr-4 hover:text-gray-300">
            Home
          </Link>
          {/* Add additional nav links as needed */}
        </div>
      </div>
    </nav>
  );
};

// Layout component wraps all pages so that the Navbar is always visible
const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          {/* Routes for Searching Algos */}
          <Route path="/searching/algo1" element={<LinearSearchVisualizer />} />
          <Route path="/searching/algo2" element={<BinarySearchVisualizer />} />
          <Route path="/searching/algo3" element={<SearchAlgorithmRace />} />

          {/* Routes for Sorting Algos */}
          <Route path="/sorting/algoA" element={<BubbleSortVisualizer/>} />
          <Route path="/sorting/algoB" element={<InsertionSortVisualizer/>} />
          <Route path="/sorting/algoC" element={<SelectionSortVisualizer/>} />
          <Route path="/sorting/algoD" element={<MergeSortVisualizer/>} />
          <Route path="/sorting/algoE" element={<QuickSortVisualizer/>} />
          <Route path="/sorting/algoF" element={<AlgorithmRace/>} />


          {/* Routes for Backtracking Algos */}
          <Route path="/backtracking/algoX" element={<NQueensVisualize/>} />
          <Route path="/backtracking/algoY" element={<SudokuSolverVisualizer/>} />
          

          {/* Dummy Routes for Graph Algos */}
          <Route path="/graph/algo1" element={<BFSVisualizer/>} />
          <Route path="/graph/algo2" element={<DFSVisualizer/>} />
          <Route path="/graph/algo3" element={<DijkstraVisualizer/>} />
          <Route path="/graph/algo4" element={<PrimsAlgorithmVisualizer/>} />
          <Route path="/graph/algo5" element={<KruskalsAlgorithmVisualizer/>} />

          {/* Daynamic Programming*/}
          <Route path="/dp/algo1" element={<FibonacciVisualizer/>} />

          {/* Tree Algorithms*/}
          <Route path="/tree/algo1" element={<TreeTraversalVisualizer/>} />
          <Route path="/tree/algo2" element={<BSTVisualizer/>} />
           
           {/* Greedy Algorithm  */}
            <Route path="/greedy/algo1" element={<HuffmanCodingVisualizer/>} />

            {/* Mathematical Algorithms*/}
            <Route path="/math/algo1" element={<GCDVisualizer/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
