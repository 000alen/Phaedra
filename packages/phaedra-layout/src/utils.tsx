import { IOrientation } from "phaedra-notebook";
import React from "react";

export function computePosition(
  orientation: IOrientation,
  position: number
): React.CSSProperties {
  return orientation === "horizontal"
    ? {
        left: `${position * 100}%`,
        top: "0"
      }
    : {
        left: "0",
        top: `${position * 100}%`
      };
}

export function computeSize(
  orientation: IOrientation,
  size: number
): React.CSSProperties {
  return orientation === "horizontal"
    ? {
        width: `${size * 100}%`,
        height: "100%"
      }
    : {
        width: "100%",
        height: `${size * 100}%`
      };
}
