import React from "react";

import style from "../css/Pane.module.css";
import { Direction, DividerRect, PaneRect } from "../UseLayout/Rect";
import { LayoutManager } from "../UseLayout/UseLayout";

interface PaneProps<P> {
  Component: React.ComponentType<P>;
  props: P;
  pane: PaneRect;
  layoutManager: LayoutManager;
  keyPressed: boolean;
}

interface PaneState {
  edge: Direction | null;
}

export class Pane<P> extends React.Component<PaneProps<P>, PaneState> {
  paneRef: React.RefObject<HTMLDivElement>;

  constructor(props: PaneProps<P>) {
    super(props);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);

    this.paneRef = React.createRef();

    this.state = {
      edge: null,
    };
  }

  get cursor() {
    const { keyPressed } = this.props;
    const { edge } = this.state;

    if (edge === null || !keyPressed) return "default";

    return edge === Direction.North
      ? "s-resize"
      : edge === Direction.South
      ? "n-resize"
      : edge === Direction.West
      ? "e-resize"
      : edge === Direction.East
      ? "w-resize"
      : "default";
  }

  handleMouseDown(event: React.MouseEvent) {
    const { pane, layoutManager, keyPressed } = this.props;

    if (keyPressed === false) return;

    const domRect = this.paneRef.current!.getBoundingClientRect();

    const edge = layoutManager.paneFindEdge(event, domRect);

    if (edge === null) return;

    layoutManager.split(
      pane,
      edge,
      layoutManager.computeRelativeSize(event, domRect, edge),
      (newDivider: DividerRect) => {
        layoutManager.setDragging(newDivider, true);
      }
    );
  }

  handleMouseMove(event: React.MouseEvent) {
    const { layoutManager, keyPressed } = this.props;

    if (keyPressed === false) return;

    const edge = layoutManager.paneFindEdge(
      event,
      this.paneRef.current!.getBoundingClientRect()
    );
    this.setState({ edge });
  }

  render() {
    const { pane, Component, props } = this.props;

    const paneStyle: React.CSSProperties = {
      left: `${pane.left * 100}%`,
      top: `${pane.top * 100}%`,
      width: `${pane.width * 100}%`,
      height: `${pane.height * 100}%`,
      cursor: this.cursor,
    };

    return (
      <div
        ref={this.paneRef}
        className={`${style.pane}`}
        style={paneStyle}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
      >
        <div className={`${style.inner}`}>
          <Component {...(props as P)} />
        </div>
      </div>
    );
  }
}
