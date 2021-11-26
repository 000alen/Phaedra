import React from "react";

interface PaperProps {
  size?: any;
  children?: React.ReactNode;
}

export function Paper({ children }: PaperProps) {
  return (
    <div className="w-[100%] overflow-auto">
      <div className="w-[8.5in] h-[11in] p-2 mx-auto my-2 bg-white rounded-sm shadow-sm overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
