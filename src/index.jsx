import React from "react";
import ReactDOM from "react-dom/client";
import BFSVisualizer from "./components/BFSVisualizer";
import DFSVisualizer from "./components/DFSVisualizer";






function App() {
  return (
    <>

     
    <BFSVisualizer/>
    {/* <DFSVisualizer/> */}


    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
