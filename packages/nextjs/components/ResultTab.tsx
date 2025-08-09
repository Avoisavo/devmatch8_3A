import React from "react";

interface ResultTabProps {
  results: string[];
}

const ResultTab: React.FC<ResultTabProps> = ({ results }) => {
  return (
    <div
      style={{
        position: "fixed", // Changed from absolute
        top: 0,
        right: 0,
        bottom: 0,
        width: "300px",
        boxSizing: "border-box", // Added
        background: "#e3f0fd", // pastel blue
        color: "#22334d",
        borderLeft: "3px solid #3a5ca8",
        borderTop: "3px solid #3a5ca8",
        borderBottom: "3px solid #3a5ca8",
        borderTopLeftRadius: "18px",
        // No borderBottomLeftRadius
        zIndex: 30,
        padding: "24px 16px 16px 16px",
        overflowY: "auto",
        fontFamily: "'PressStart2P', 'Courier New', monospace",
        fontSize: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: "-4px 0 0 #3a5ca8",
      }}
    >
      <div
        style={{ fontWeight: "bold", marginBottom: "14px", fontSize: "14px", letterSpacing: "1px", color: "#3a5ca8" }}
      >
        Results
      </div>
      {results && results.length > 0 ? (
        results.map((res, i) => (
          <div
            key={i}
            style={{
              background: "#f5faff",
              padding: "10px",
              borderRadius: "10px",
              border: "2px solid #b3d1f7",
              color: "#22334d",
              boxShadow: "2px 3px 0 #b3d1f7",
            }}
          >
            {res}
          </div>
        ))
      ) : (
        <div style={{ color: "#7a8ca8" }}>No results yet.</div>
      )}
    </div>
  );
};

export default ResultTab;
