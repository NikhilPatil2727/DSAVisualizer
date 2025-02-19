import React from "react";
import ReactDOM from "react-dom/client";
import BubbleSortVisualizer from "./components/BubbleSortVisualizer";
import InsertionSortVisualizer from "./components/InsertionSortVisualizer";
import SelectionSortVisualizer from "./components/SelectionSortVisualizer";

function App() {
  return (
    <>
      <BubbleSortVisualizer />
      {/* <InsertionSortVisualizer/> */}
      {/* <SelectionSortVisualizer/> */}
      
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
