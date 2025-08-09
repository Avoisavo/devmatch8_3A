"use client";

import React, { useState } from "react";
import Floor from "../../../components/Floor";

export default function DebugFloorPage() {
  const [gatherAndTalk, setGatherAndTalk] = useState(false);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Floor gatherAndTalk={gatherAndTalk} />
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 50 }}>
        <button className="btn btn-primary" onClick={() => setGatherAndTalk(v => !v)}>
          {gatherAndTalk ? "Stop Talking" : "Gather & Talk"}
        </button>
      </div>
    </div>
  );
}
