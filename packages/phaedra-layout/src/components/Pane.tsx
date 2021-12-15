import React from "react";

import { IDirection, ILayoutController, IOrientation, IPane, IPaneProps } from "../types";
import { computePosition, computeSize } from "../utils";

export interface PaneProps {
  notebook: ILayoutController;
  pageId: string;
  pane: IPane;
  orientation: IOrientation;
  Component: React.ComponentType<IPaneProps>;
}

export class Pane extends React.Component<PaneProps> {
  paneRef: React.RefObject<HTMLDivElement>;

  constructor(props: PaneProps) {
    super(props);

    this.computeEdge = this.computeEdge.bind(this);
    this.computeRelativeSize = this.computeRelativeSize.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);

    this.paneRef = React.createRef();
  }

  computeEdge(event: React.MouseEvent): IDirection | null {
    const { left, right, top, bottom } =
      this.paneRef.current!.getBoundingClientRect();

    const { clientX, clientY } = event;

    const [distance, closestDirection] = ([
      [clientX - left, "west"],
      [right - clientX, "east"],
      [clientY - top, "north"],
      [bottom - clientY, "south"]
    ] as [number, IDirection][]).sort(([a, b], [c, d]) => a - c)[0];

    return distance <= 100 ? (closestDirection as IDirection) : null;
  }

  computeRelativeSize(orientation: IOrientation, event: React.MouseEvent) {
    const { left, top, width, height } =
      this.paneRef.current!.getBoundingClientRect();

    return orientation === "horizontal"
      ? event.clientX - left / width
      : event.clientY - top / height;
  }

  handleMouseDown(event: React.MouseEvent) {
    if (!event.ctrlKey || !event.metaKey) return;

    const edge = this.computeEdge(event);
    if (edge === null) return;

    const { notebook, pageId, pane } = this.props;

    notebook.splitPageLayoutPane(
      pageId,
      pane.id,
      edge,
      this.computeRelativeSize(
        edge === "west" || edge === "east" ? "horizontal" : "vertical",
        event
      )
    );
  }

  render() {
    const { pane, orientation, Component } = this.props;
    const { position, size, props } = pane;

    const style = {
      position: "absolute",
      ...computePosition(orientation, position),
      ...computeSize(orientation, size)
    } as React.CSSProperties;

    return (
      <div ref={this.paneRef} style={style} onMouseDown={this.handleMouseDown}>
        <Component {...props} />
      </div>
    );
  }
}
