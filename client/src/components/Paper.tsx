import "../css/Paper.css";

import React from "react";

interface PaperProps {
  size?: any;
  children?: React.ReactNode;
}

export function Paper({ children }: PaperProps) {
  return (
    <div className="p-2 bg-gray-600 fill">
      <div className="p-2 bg-white rounded-sm shadow-sm paper fill">
        {children}
      </div>
    </div>
  );
}
