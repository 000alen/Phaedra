import "../../css/SplitViewComponent.css";

import React, { Component } from "react";

import LeftPanel from "./LeftPanel";

interface SplitViewComponentProps {
  left: JSX.Element;
  right: JSX.Element;
}

interface SplitViewComponentState {
  leftWidth: number | undefined;
  dragging: boolean;
  separatorXPosition: number | undefined;
}

const MIN_WIDTH = 50;
const SHOW_THRESHOLD = 100;

export default class SplitViewComponent extends Component<
  SplitViewComponentProps,
  SplitViewComponentState
> {
  splitViewRef: React.RefObject<HTMLDivElement>;

  constructor(props: SplitViewComponentProps) {
    super(props);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.setLeftWidth = this.setLeftWidth.bind(this);
    this.setDragging = this.setDragging.bind(this);
    this.setSeparatorXPosition = this.setSeparatorXPosition.bind(this);

    this.splitViewRef = React.createRef<HTMLDivElement>();

    this.state = {
      leftWidth: undefined,
      separatorXPosition: undefined,
      dragging: false,
    };
  }

  componentDidMount() {
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  }

  onMouseDown(event: React.MouseEvent) {
    this.setSeparatorXPosition(event.clientX);
    this.setDragging(true);
  }

  onMouseMove(event: MouseEvent) {
    const { dragging, leftWidth, separatorXPosition } = this.state;

    if (dragging && leftWidth && separatorXPosition) {
      const newLeftWidth = leftWidth + event.clientX - separatorXPosition;
      this.setSeparatorXPosition(event.clientX);

      if (newLeftWidth < MIN_WIDTH) {
        this.setLeftWidth(MIN_WIDTH);
        return;
      }

      if (this.splitViewRef.current) {
        const splitViewWidth = this.splitViewRef.current.clientWidth;

        if (newLeftWidth > splitViewWidth - MIN_WIDTH) {
          this.setLeftWidth(splitViewWidth - MIN_WIDTH);
          return;
        }
      }

      this.setLeftWidth(newLeftWidth);
    }
  }

  onMouseUp() {
    this.setDragging(false);
  }

  setLeftWidth(leftWidth: number) {
    this.setState({ leftWidth: leftWidth });
  }

  setDragging(dragging: boolean) {
    this.setState({ dragging: dragging });
  }

  setSeparatorXPosition(separatorXPosition: number) {
    this.setState({ separatorXPosition: separatorXPosition });
  }

  render() {
    const { leftWidth } = this.state;
    const { left, right } = this.props;

    const splitViewWidth = this.splitViewRef.current
      ? this.splitViewRef.current.clientWidth
      : undefined;

    const showRight =
      splitViewWidth &&
      leftWidth &&
      splitViewWidth - leftWidth > SHOW_THRESHOLD;

    return (
      <div ref={this.splitViewRef} className="splitView">
        <LeftPanel leftWidth={leftWidth} setLeftWidth={this.setLeftWidth}>
          {left}
        </LeftPanel>

        <div className="splitViewDividerHitbox" onMouseDown={this.onMouseDown}>
          <div className="splitViewDivider" />
        </div>

        {showRight && <div className="splitViewRightPane">{right}</div>}
      </div>
    );
  }
}
