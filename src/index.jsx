import React from "react";
import ReactDOM from "react-dom/client";
import DijkstraVisualizer from "./components/DijkstraVisualizer";







function App() {
  return (
    <>

   <DijkstraVisualizer/>


    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
