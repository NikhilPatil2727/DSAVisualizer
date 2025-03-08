import React from "react";
import ReactDOM from "react-dom/client";
import DijkstraVisualizer from "./components/DijkstraVisualizer";
import HuffmanCodingVisualizer from "./components/HuffmanCodingVisualizer";
import GCDVisualizer from "./components/GCDVisualizer";
import PrimsAlgorithmVisualizer from "./components/PrimsAlgorithmVisualizer";
import KruskalsAlgorithmVisualizer from "./components/KruskalsAlgorithmVisualizer";







function App() {
  return (
    <>

   {/* <DijkstraVisualizer/> */}
   {/* <HuffmanCodingVisualizer/> */}
   {/* <GCDVisualizer/> */}
   {/* <PrimsAlgorithmVisualizer/> */}
   <KruskalsAlgorithmVisualizer/>


    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
