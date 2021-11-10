import React from "react";

import { theme } from "../resources/theme";

interface PaperComponentProps {
  className?: string;
  size?: { width: string; height: string };
  children?: React.ReactNode;
}

export const PaperSize = {
  Letter: {
    width: "8.5in",
    height: "11in",
  },
  Legal: {
    width: "8.5in",
    height: "14in",
  },
  Fill: {
    width: "100%",
    height: "100%",
  },
};

export default function PaperContainerComponent({
  className,
  size,
  children,
}: PaperComponentProps) {
  if (size === undefined) size = PaperSize.Fill;

  const pageStyle = {
    width: size.width,
    minHeight: size.height,
    backgroundColor: theme.palette.white,
  };

  return (
    <div className="flex justify-center">
      <div
        className={`px-2 py-10 m-2 rounded-sm shadow-sm ${
          className !== undefined ? className : ""
        }`}
        style={pageStyle}
      >
        {children}
      </div>
    </div>
  );
}
