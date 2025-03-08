import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import LinearSearchVisualizer from "./components/LinearSearchVisualizer";
import Home from "./components/Home";




function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Dummy Routes for Searching Algos */}
          <Route path="/searching/algo1" element={<LinearSearchVisualizer/>} />
          <Route path="/searching/algo2" element={<div>Searching Algo 2 Page</div>} />
          <Route path="/searching/algo3" element={<div>Searching Algo 3 Page</div>} />

          {/* Dummy Routes for Sorting Algos */}
          <Route path="/sorting/algoA" element={<div>Sorting Algo A Page</div>} />
          <Route path="/sorting/algoB" element={<div>Sorting Algo B Page</div>} />
          <Route path="/sorting/algoC" element={<div>Sorting Algo C Page</div>} />

          {/* Dummy Routes for Backtracking Algos */}
          <Route path="/backtracking/algoX" element={<div>Backtracking Algo X Page</div>} />
          <Route path="/backtracking/algoY" element={<div>Backtracking Algo Y Page</div>} />
          <Route path="/backtracking/algoZ" element={<div>Backtracking Algo Z Page</div>} />

         
        </Routes>
      </BrowserRouter>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
