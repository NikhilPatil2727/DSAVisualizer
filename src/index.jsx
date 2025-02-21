import React from "react";
import ReactDOM from "react-dom/client";
import BubbleSortVisualizer from "./components/BubbleSortVisualizer";
import InsertionSortVisualizer from "./components/InsertionSortVisualizer";
import SelectionSortVisualizer from "./components/SelectionSortVisualizer";
import MergeSortVisualizer from "./components/MergeSortVisualizer";

function App() {
  return (
    <>
      {/* <BubbleSortVisualizer /> */}
      {/* <InsertionSortVisualizer/> */}
      {/* <SelectionSortVisualizer/> */}
      <MergeSortVisualizer />
      
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
