import React from "react";
import { ILayout, IPane, ILayoutController, IOrientation } from "../types";
import { computePosition } from "../utils";

export interface DividerProps {
  notebook: ILayoutController;
  pageId: string;
  orientation: IOrientation;
  previous: ILayout | IPane;
  next: ILayout | IPane;
}

export class Divider extends React.Component<DividerProps> {
  computeSize(orientation: IOrientation): React.CSSProperties {
    return orientation === "horizontal"
      ? {
          width: "10px",
          height: "100%"
        }
      : {
          width: "100%",
          height: "10px"
        };
  }

  render() {
    const { orientation, next } = this.props;

    const style = {
      backgroundColor: "red",
      position: "absolute",
      ...computePosition(orientation, next.position),
      ...this.computeSize(orientation)
    } as React.CSSProperties;

    return <div style={style} />;
  }
}
