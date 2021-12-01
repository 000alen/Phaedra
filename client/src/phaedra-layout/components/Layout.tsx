import Mousetrap from "mousetrap";
import React from "react";

import style from "../css/Layout.module.css";
import { DividerRect, LayoutRect, PaneRect } from "../UseLayout/Rect";
import { LayoutManager } from "../UseLayout/UseLayout";
import { Divider } from "./Divider";
import { Pane } from "./Pane";

export interface LayoutSkeletonProps<P> {
  Component: React.ComponentType<P>;
  props: P;
  layout: LayoutRect;
  panes: PaneRect[];
  dividers: DividerRect[];
  layoutManager: LayoutManager;
  layoutContainerRef: React.RefObject<HTMLDivElement>;
}

export interface LayoutSkeletonState {
  keyPressed: boolean;
}

export class LayoutSkeleton<P> extends React.Component<
  LayoutSkeletonProps<P>,
  LayoutSkeletonState
> {
  constructor(props: LayoutSkeletonProps<P>) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    this.state = {
      keyPressed: false,
    };
  }

  componentDidMount() {
    Mousetrap.bind("mod", this.handleKeyDown, "keydown");
    Mousetrap.bind("mod", this.handleKeyUp, "keyup");
  }

  componentWillUnmount() {
    Mousetrap.unbind("mod", "keydown");
    Mousetrap.unbind("mod", "keyup");
  }

  handleKeyDown(event: KeyboardEvent) {
    this.setState({
      keyPressed: true,
    });
  }

  handleKeyUp(event: KeyboardEvent) {
    this.setState({
      keyPressed: false,
    });
  }

  render() {
    const {
      Component,
      props,
      panes,
      dividers,
      layoutManager,
      layoutContainerRef,
    } = this.props;
    const { keyPressed } = this.state;

    return (
      <div className={`${style.clip}`}>
        <div ref={layoutContainerRef} className={`${style.layout}`}>
          {panes.map((pane) => (
            <Pane
              key={pane.id}
              Component={Component}
              props={props}
              pane={pane}
              layoutManager={layoutManager}
              keyPressed={keyPressed}
            />
          ))}

          {dividers.map((divider) => (
            <Divider
              key={divider.id}
              divider={divider}
              layoutManager={layoutManager}
            />
          ))}
        </div>
      </div>
    );
  }
}
