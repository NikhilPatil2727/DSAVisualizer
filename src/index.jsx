import React from "react";
import ReactDOM from "react-dom/client";

import FibonacciVisualizer from "./components/FibonacciVisualizer";



function App() {
  return (
    <>

      <FibonacciVisualizer />


    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
