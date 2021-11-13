import React from "react";

interface ContextMenuProps {
  x: number;
  y: number;
}

export function ContextMenu({ x, y }: ContextMenuProps) {
  return (
    <ul
      className="contextMenu z-50"
      style={{
        top: y,
        left: x,
      }}
    >
      <li>Share to..</li>
      <li>Cut</li>
      <li>Copy</li>
      <li>Paste</li>
      <hr className="divider" />
      <li>Refresh</li>
      <li>Exit</li>
    </ul>
  );
}
