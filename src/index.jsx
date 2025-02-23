import React from "react";
import ReactDOM from "react-dom/client";
import BubbleSortVisualizer from "./components/BubbleSortVisualizer";
import InsertionSortVisualizer from "./components/InsertionSortVisualizer";
import SelectionSortVisualizer from "./components/SelectionSortVisualizer";
import MergeSortVisualizer from "./components/MergeSortVisualizer";
import QuickSortVisualizer from "./components/QuickSortVisualizer";
import TreeTraversalVisualizer from "./components/TreeTraversalVisualizer";



function App() {
  return (
    <>
      {/* <BubbleSortVisualizer /> */}
      {/* <InsertionSortVisualizer/> */}
        {/* <TreeTraversalVisualizer /> */}
      <SelectionSortVisualizer/>
      {/* <MergeSortVisualizer /> */}
      {/* <QuickSortVisualizer /> */}
    
      
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
