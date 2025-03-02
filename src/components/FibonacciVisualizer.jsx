import React, { useState } from "react";

const FibonacciVisualizer = () => {
  const [n, setN] = useState(0);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [treeData, setTreeData] = useState([]);

  // Color definitions
  const colors = {
    primary: "#2c3e50",
    secondary: "#3498db",
    background: "#ecf0f1",
    text: "#2c3e50",
  };

  // Base container style
  const containerStyle = {
    maxWidth: "1200px",
    margin: "auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: colors.background,
    minHeight: "100vh",
  };

  const inputStyle = {
    padding: "12px",
    fontSize: "1.1rem",
    width: "120px",
    marginRight: "15px",
    borderRadius: "8px",
    border: `2px solid ${colors.secondary}`,
    outline: "none",
  };

  const buttonStyle = {
    padding: "12px 25px",
    fontSize: "1.1rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: colors.secondary,
    color: "white",
    cursor: "pointer",
    transition: "transform 0.2s",
  };

  const treeContainerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    margin: "40px 0",
    position: "relative",
  };

  const treeNodeStyle = {
    position: "relative",
    margin: "40px 20px",
  };

  // Node container style (width & height are controlled via CSS classes)
  const nodeStyle = {
    backgroundColor: "white",
    border: `3px solid ${colors.secondary}`,
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  const nodeLabelStyle = {
    fontSize: "0.9rem",
    color: colors.text,
    fontWeight: "600",
  };

  // Helper function to compute dynamic font size for node values.
  // It reduces the font size when the number of digits exceeds 3.
  const getNodeValueStyle = (value) => {
    const len = String(value).length;
    const baseSize = 1.4; // in rem
    // Reduce font size 0.1rem for each extra digit beyond 3, with a minimum of 0.8rem.
    const fontSize = len > 3 ? Math.max(0.8, baseSize - (len - 3) * 0.1) : baseSize;
    return {
      fontSize: `${fontSize}rem`,
      fontWeight: "bold",
      color: colors.primary,
      textAlign: "center",
      padding: "0 5px",
      wordBreak: "break-all",
    };
  };

  const connectorStyle = {
    position: "absolute",
    top: "-30px",
    left: "50%",
    width: "100%",
  };

  const lineStyle = {
    position: "absolute",
    width: "80px",
    height: "40px",
    borderLeft: `3px dashed ${colors.secondary}`,
    borderTop: `3px dashed ${colors.secondary}`,
    left: "-90px",
    top: "-40px",
    borderRadius: "20px",
  };

  const arrowStyle = {
    position: "absolute",
    width: "10px",
    height: "10px",
    borderTop: `3px solid ${colors.secondary}`,
    borderRight: `3px solid ${colors.secondary}`,
    transform: "rotate(45deg)",
    right: "-5px",
    top: "-8px",
  };

  // Tree visualization component
  const TreeVisualization = ({ data }) => (
    <div style={treeContainerStyle} className="treeContainer">
      {data.map((node) => (
        <div key={node.id} style={treeNodeStyle}>
          <div className="node" style={nodeStyle}>
            <span style={nodeLabelStyle}>dp[{node.id}]</span>
            <div style={getNodeValueStyle(node.value)}>{node.value}</div>
          </div>
          {node.parents.length > 0 && (
            <div style={connectorStyle}>
              {node.parents.map((parent) => (
                <div key={`${node.id}-${parent}`} style={lineStyle}>
                  <div style={arrowStyle}></div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Fibonacci calculation logic using dynamic programming
  const handleCalculate = () => {
    let dp = [];
    let computedSteps = [];
    let treeNodes = [];

    if (n >= 0) {
      dp[0] = 0;
      computedSteps.push("Initialize dp[0] = 0");
      treeNodes.push({ id: 0, value: 0, parents: [] });
    }
    if (n >= 1) {
      dp[1] = 1;
      computedSteps.push("Initialize dp[1] = 1");
      treeNodes.push({ id: 1, value: 1, parents: [] });
    }

    for (let i = 2; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      computedSteps.push(
        `Compute dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i]}`
      );
      treeNodes.push({
        id: i,
        value: dp[i],
        parents: [i - 1, i - 2],
      });
    }

    setSteps(computedSteps);
    setResult(dp[n]);
    setTreeData(treeNodes);
  };

  return (
    <div style={containerStyle} className="container">
      {/* Responsive CSS */}
      <style>{`
        .container, .inputField, .buttonField {
          box-sizing: border-box;
        }
        /* Base node size */
        .node {
          width: 80px;
          height: 80px;
        }
        @media (max-width: 768px) {
          .container {
            padding: 10px;
          }
          .inputField {
            width: 100px;
            margin-right: 10px;
          }
          .buttonField {
            padding: 10px 20px;
          }
          .treeContainer {
            flex-direction: column;
          }
          /* Reduce node size on small screens */
          .node {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>

      <h1 style={{ color: colors.primary, textAlign: "center" }}>
        Fibonacci Dynamic Programming Visualizer
      </h1>

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <input
          type="number"
          value={n}
          onChange={(e) =>
            setN(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))
          }
          min="0"
          max="50"
          className="inputField"
          style={inputStyle}
        />
        <button
          onClick={handleCalculate}
          style={buttonStyle}
          className="buttonField"
        >
          Visualize
        </button>
      </div>

      {result !== null && (
        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <h2 style={{ color: colors.primary }}>
            Fibonacci({n}) ={" "}
            <span style={{ color: colors.secondary }}>{result}</span>
          </h2>
        </div>
      )}

      {treeData.length > 0 && <TreeVisualization data={treeData} />}

      {steps.length > 0 && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            margin: "20px auto",
            maxWidth: "800px",
          }}
        >
          <h3 style={{ color: colors.primary }}>Computation Steps:</h3>
          <ol style={{ textAlign: "left", lineHeight: "1.6" }}>
            {steps.map((step, index) => (
              <li key={index} style={{ margin: "10px 0", padding: "8px" }}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div
        style={{
          backgroundColor: "#f8f9fa",
          borderRadius: "10px",
          padding: "20px",
          margin: "30px auto",
          maxWidth: "800px",
        }}
      >
        <h3 style={{ color: colors.primary }}>How Dynamic Programming Works</h3>
        <div style={{ lineHeight: "1.6" }}>
          <p>
            The visualization shows how each Fibonacci number is built from previous
            results:
          </p>
          <ul>
            <li>🔵 Each circle represents a Fibonacci number calculation</li>
            <li>⏫ Arrows show dependencies between numbers</li>
            <li>
              💡 Notice there are no duplicate calculations - this is the power of DP!
            </li>
          </ul>
          <p>
            Time Complexity: O(n) (linear time) instead of O(2ⁿ) in naive recursion
          </p>
        </div>
      </div>
    </div>
  );
};

export default FibonacciVisualizer;
