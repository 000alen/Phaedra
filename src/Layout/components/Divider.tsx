import React from "react";

import style from "../css/Divider.module.css";
import { Direction, DividerRect, Orientation } from "../UseLayout/Rect";
import { LayoutManager } from "../UseLayout/UseLayout";

interface DividerProps {
  divider: DividerRect;
  layoutManager: LayoutManager;
}

interface DividerState {}

export class Divider extends React.Component<DividerProps, DividerState> {
  constructor(props: DividerProps) {
    super(props);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  get style() {
    const { divider } = this.props;

    const group = divider.parent;

    const x = group.left;
    const y = group.top;
    const w = group.width;
    const h = group.height;

    if (divider.orientation === Orientation.Horizontal) {
      return {
        left: `${x * 100}%`,
        top: `${(y + divider.position! * h) * 100}%`,
        width: `${w * 100}%`
      };
    } else {
      return {
        top: `${y * 100}%`,
        left: `${(x + divider.position! * w) * 100}%`,
        height: `${h * 100}%`
      };
    }
  }

  handleMouseDown(event: React.MouseEvent) {
    const { layoutManager, divider } = this.props;
    layoutManager.setDragging(divider, true);
  }

  handleMouseMove(event: React.MouseEvent) {
    const { divider, layoutManager } = this.props;
    if (!divider.dragging) return;
    const bounds = divider.parent.bounds(
      layoutManager.layoutContainerRef.current!.getBoundingClientRect()
    );
    const size = layoutManager.computeRelativeSize(
      event,
      bounds,
      divider.orientation === Orientation.Vertical
        ? Direction.West
        : Direction.North
    );

    if (divider.previous!.size <= 0 || divider.next!.size <= 0)
      layoutManager.setClosing(divider, true);

    layoutManager.resize(divider, size);
  }

  handleMouseUp(event: React.MouseEvent) {
    const { divider, layoutManager } = this.props;

    if (!divider.dragging) return;

    this.handleMouseMove(event);

    layoutManager.setDragging(divider, false);
    layoutManager.setClosing(divider, false);

    if (divider.previous!.size <= 0 || divider.next!.size <= 0)
      layoutManager.remove(divider);
  }

  render() {
    const { divider } = this.props;
    return (
      <React.Fragment>
        <div
          className={`${style.divider} ${
            divider.orientation === Orientation.Horizontal
              ? style.horizontal
              : style.vertical
          }`}
          style={this.style}
          onMouseDown={this.handleMouseDown}
        />

        {divider.dragging && (
          <div
            className={`${style.overlay} ${
              divider.orientation === Orientation.Horizontal
                ? style.horizontal
                : style.vertical
            } ${divider.closing ? style.closing : ""}`}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}
            onMouseLeave={this.handleMouseUp}
          />
        )}
      </React.Fragment>
    );
  }
}
