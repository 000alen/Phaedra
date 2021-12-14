import React from "react";

interface PaperProps {
  size?: any;
  children?: React.ReactNode;
}

export function Paper({ children }: PaperProps) {
  return (
    <div className="w-full h-full p-2 overflow-auto">
      <div className="w-full h-full bg-white rounded-sm shadow-sm">
        {children}
      </div>
    </div>
  );
}
