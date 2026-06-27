import React from "react";

function ToggleLogs() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1>Activity Logs</h1>
        <button title="sort">Sort</button>
      </div>
    </div>
  );
}

export default ToggleLogs;
