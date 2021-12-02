import Mousetrap from "mousetrap";
import React from "react";

import style from "../css/Layout.module.css";
import { UseLayoutInjectedProps } from "../UseLayout/UseLayout";
import { Divider } from "./Divider";
import { Pane } from "./Pane";

export type LayoutSkeletonProps<P> = UseLayoutInjectedProps & {
  PaneComponent: React.ComponentType<P>;
  props: P;
};

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
      PaneComponent,
      props,
      _panes,
      _dividers,
      _layoutManager,
      _layoutContainerRef,
    } = this.props;
    const { keyPressed } = this.state;

    return (
      <div className={`${style.clip}`}>
        <div ref={_layoutContainerRef} className={`${style.layout}`}>
          {_panes.map((pane) => (
            <Pane
              key={pane.id}
              pane={pane}
              layoutManager={_layoutManager}
              keyPressed={keyPressed}
              Component={PaneComponent}
              props={props}
            />
          ))}

          {_dividers.map((divider) => (
            <Divider
              key={divider.id}
              divider={divider}
              layoutManager={_layoutManager}
            />
          ))}
        </div>
      </div>
    );
  }
}
