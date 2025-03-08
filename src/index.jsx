import React from "react";
import ReactDOM from "react-dom/client";
import DijkstraVisualizer from "./components/DijkstraVisualizer";
import HuffmanCodingVisualizer from "./components/HuffmanCodingVisualizer";
import GCDVisualizer from "./components/GCDVisualizer";
import PrimsAlgorithmVisualizer from "./components/PrimsAlgorithmVisualizer";
import KruskalsAlgorithmVisualizer from "./components/KruskalsAlgorithmVisualizer";
import SearchAlgorithmRace from "./components/SearchAlgorithmRace";







function App() {
  return (
    <>

   {/* <DijkstraVisualizer/> */}
   {/* <HuffmanCodingVisualizer/> */}
   {/* <GCDVisualizer/> */}
   {/* <PrimsAlgorithmVisualizer/> */}
   {/* <KruskalsAlgorithmVisualizer/> */}
   <SearchAlgorithmRace/>


    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
