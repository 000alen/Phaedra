import React from "react";
import { IOrientation } from "..";
import { ILayout, ILayoutController, IPaneProps } from "../types";
import { computePosition, computeSize } from "../utils";
import { Divider } from "./Divider";
import { Pane } from "./Pane";

export interface LayoutProps {
  notebook: ILayoutController;
  pageId: string;
  layout: ILayout;
  orientation: IOrientation;
  Component: React.ComponentType<IPaneProps>;
}

export class Layout extends React.Component<LayoutProps> {
  render() {
    const {
      notebook,
      pageId,
      layout,
      orientation: parentOrientation,
      Component
    } = this.props;
    const { orientation, children } = layout;

    const style = {
      position: "relative",
      ...computePosition(parentOrientation, layout.position),
      ...computeSize(parentOrientation, layout.size)
    } as React.CSSProperties;

    return (
      <div style={style}>
        {children.map((child) =>
          child.type === "layout" ? (
            <Layout
              key={child.id}
              notebook={notebook}
              pageId={pageId}
              layout={child}
              orientation={orientation}
              Component={Component}
            />
          ) : (
            <Pane
              key={child.id}
              notebook={notebook}
              pageId={pageId}
              pane={child}
              orientation={orientation}
              Component={Component}
            />
          )
        )}
        {children.slice(1).map((child, index) => (
          <Divider
            key={child.id}
            notebook={notebook}
            pageId={pageId}
            orientation={orientation}
            previous={children[index]}
            next={child}
          />
        ))}
      </div>
    );
  }
}
