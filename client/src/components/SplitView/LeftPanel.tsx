import React from "react";

interface LeftPanelProps {
  leftWidth: number | undefined;
  setLeftWidth: (value: number) => void;
}

export default function LeftPanel({
  children,
  leftWidth,
  setLeftWidth,
}: LeftPanelProps & { children: React.ReactNode }) {
  const leftRef = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    if (leftRef.current) {
      if (!leftWidth) {
        setLeftWidth(leftRef.current.clientWidth);
        return;
      }

      leftRef.current.style.width = `${leftWidth}px`;
    }
  }, [leftRef, leftWidth, setLeftWidth]);

  return <div ref={leftRef}>{children}</div>;
}
