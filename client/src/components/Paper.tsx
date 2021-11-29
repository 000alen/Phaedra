import React from "react";

interface PaperProps {
  size?: any;
  children?: React.ReactNode;
}

export function Paper({ children }: PaperProps) {
  return (
    <div className="w-[100%] h-[100%] p-2">
      <div className="w-[100%] h-[100%] bg-white rounded-sm shadow-sm">
        {children}
      </div>
    </div>
  );
}
