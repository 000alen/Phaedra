import React from "react";
import { Subtract } from "utility-types";
import { v4 as uuidv4 } from "uuid";

import { clamp, removeFromArray } from "../utils";
import {
  Direction,
  DividerRect,
  LayoutRect,
  Orientation,
  PaneRect,
} from "./Rect";

export interface UseLayoutProps {
  forwardedRef: React.Ref<any>;
  defaultLayout?: LayoutJSON;
  onLayoutChange?: (layout: LayoutJSON) => void;
}

export interface UseLayoutState {
  layout: LayoutRect;
  panes: PaneRect[];
  dividers: DividerRect[];
}

export interface UseLayoutInjectedProps {
  _layoutManager: LayoutManager;
  _layout: LayoutRect;
  _panes: PaneRect[];
  _dividers: DividerRect[];
  _layoutContainerRef: React.RefObject<HTMLDivElement>;
}

export interface PaneJSON {
  type: "pane";
  id: string;
  position: number;
  size: number;
  previous: string | null;
  next: string | null;
  props: object;
}

export interface LayoutJSON {
  type: "layout";
  id: string;
  position: number;
  size: number;
  orientation: "horizontal" | "vertical";
  previous: string | null;
  next: string | null;
  children: (LayoutJSON | PaneJSON)[];
}

export interface LayoutManager {
  layoutContainerRef: React.RefObject<HTMLDivElement>;
  layoutFromJSON(layout: LayoutJSON): LayoutRect;
  layoutToJSON(layout: LayoutRect): LayoutJSON;
  JSON(): LayoutJSON;
  computeRelativeSize(
    event: React.MouseEvent,
    domRect: DOMRect,
    edge: Direction
  ): number;
  computeAbsoluteSize(
    event: React.MouseEvent,
    domRect: DOMRect,
    edge: Direction
  ): number;
  paneFindEdge(event: React.MouseEvent, domRect: DOMRect): Direction | null;
  split(
    pane: PaneRect,
    direction: Direction,
    size: number,
    callback?: (newDivider: DividerRect) => void
  ): void;
  resize(divider: DividerRect, size: number, callback?: () => void): void;
  remove(divider: DividerRect, callback?: () => void): void;
  setDragging(
    divider: DividerRect,
    dragging: boolean,
    callback?: () => void
  ): void;
  setClosing(
    divider: DividerRect,
    closing: boolean,
    callback?: () => void
  ): void;
}

type Props<P extends UseLayoutInjectedProps> = Subtract<
  P & UseLayoutProps,
  UseLayoutInjectedProps
>;

type PropsWithouthRef<P extends UseLayoutInjectedProps> = Subtract<
  Props<P>,
  { forwardedRef: React.Ref<any> }
>;

const PANE_EDGE_THRESHOLD = 100;

export function emptyPane(): PaneJSON {
  return {
    type: "pane",
    id: uuidv4(),
    position: 0,
    size: 1,
    previous: null,
    next: null,
    props: {
      pane: "default",
    },
  };
}

export function empty(): LayoutJSON {
  return {
    type: "layout",
    id: uuidv4(),
    position: 0,
    size: 1,
    orientation: "horizontal",
    previous: null,
    next: null,
    children: [emptyPane()],
  };
}

export function UseLayout<P extends UseLayoutInjectedProps>(
  Component: React.ComponentType<P>
) {
  class WithLayout
    extends React.Component<Props<P>, UseLayoutState>
    implements LayoutManager
  {
    layoutContainerRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props<P>) {
      super(props);

      this.computeRelativeSize = this.computeRelativeSize.bind(this);
      this.computeAbsoluteSize = this.computeAbsoluteSize.bind(this);
      this.paneFindEdge = this.paneFindEdge.bind(this);
      this.split = this.split.bind(this);
      this.resize = this.resize.bind(this);
      this.remove = this.remove.bind(this);
      this.setDragging = this.setDragging.bind(this);
      this.setClosing = this.setClosing.bind(this);

      this.layoutContainerRef = React.createRef();

      const { defaultLayout } = this.props;

      const layout = this.layoutFromJSON(
        defaultLayout !== undefined ? defaultLayout : empty()
      );
      this.state = {
        layout: layout,
        panes: layout.getAllPanes(),
        dividers: layout.getAllDividers(),
      };
    }

    layoutFromJSON(layoutJSON: LayoutJSON): LayoutRect {
      const layout = new LayoutRect(
        layoutJSON.id,
        layoutJSON.position,
        layoutJSON.size,
        layoutJSON.orientation === "horizontal"
          ? Orientation.Horizontal
          : Orientation.Vertical
      );

      const children: (LayoutRect | PaneRect)[] = [];
      const dividers: DividerRect[] = [];
      layoutJSON.children.forEach((childJSON, index) => {
        const child: LayoutRect | PaneRect =
          childJSON.type === "layout"
            ? this.layoutFromJSON(childJSON)
            : new PaneRect(
                childJSON.id,
                childJSON.position,
                childJSON.size,
                Orientation.Horizontal,
                null,
                null,
                null,
                childJSON.props
              );

        child.parent = layout;

        if (index > 0) {
          const divider = new DividerRect(
            uuidv4(),
            child.position,
            1,
            layoutJSON.orientation === "horizontal"
              ? Orientation.Vertical
              : Orientation.Horizontal,
            layout,
            children[index - 1],
            child
          );
          dividers.push(divider);

          child.previous = divider;
          children[index - 1].next = divider;
        }

        children.push(child);
      });

      layout.children = children;
      layout.dividers = dividers;

      return layout;
    }

    layoutToJSON(layout: LayoutRect): LayoutJSON {
      return {
        id: layout.id,
        position: layout.position,
        size: layout.size,
        orientation:
          layout.orientation === Orientation.Horizontal
            ? "horizontal"
            : "vertical",
        children: layout.children.map((child) =>
          child instanceof LayoutRect
            ? this.layoutToJSON(child)
            : ({
                id: child.id,
                position: child.position,
                size: child.size,
                previous: child.previous !== null ? child.previous.id : null,
                next: child.next !== null ? child.next.id : null,
                props: child.props,
              } as PaneJSON)
        ),
        previous: layout.previous !== null ? layout.previous.id : null,
        next: layout.next !== null ? layout.next.id : null,
      } as LayoutJSON;
    }

    JSON(): LayoutJSON {
      return this.layoutToJSON(this.state.layout);
    }

    computeRelativeSize(
      event: React.MouseEvent,
      domRect: DOMRect,
      edge: Direction
    ) {
      const { top, right, bottom, left, width, height } = domRect;

      switch (edge) {
        case Direction.North:
          return (event.clientY - top) / height;
        case Direction.South:
          return (bottom - event.clientY) / height;
        case Direction.East:
          return (right - event.clientX) / width;
        case Direction.West:
          return (event.clientX - left) / width;
      }
    }

    computeAbsoluteSize(
      event: React.MouseEvent,
      domRect: DOMRect,
      edge: Direction
    ) {
      const { top, right, bottom, left } = domRect;

      switch (edge) {
        case Direction.North:
          return event.clientY - top;
        case Direction.South:
          return bottom - event.clientY;
        case Direction.East:
          return right - event.clientX;
        case Direction.West:
          return event.clientX - left;
      }
    }

    paneFindEdge(event: React.MouseEvent, domRect: DOMRect) {
      const distances: [Direction, number][] = [
        [
          Direction.North,
          this.computeAbsoluteSize(event, domRect, Direction.North),
        ],
        [
          Direction.South,
          this.computeAbsoluteSize(event, domRect, Direction.South),
        ],
        [
          Direction.East,
          this.computeAbsoluteSize(event, domRect, Direction.East),
        ],
        [
          Direction.West,
          this.computeAbsoluteSize(event, domRect, Direction.West),
        ],
      ];

      if (
        distances[0][1] > PANE_EDGE_THRESHOLD &&
        distances[1][1] > PANE_EDGE_THRESHOLD &&
        distances[2][1] > PANE_EDGE_THRESHOLD &&
        distances[3][1] > PANE_EDGE_THRESHOLD
      )
        return null;

      distances.sort((a, b) => a[1] - b[1]);

      return distances[0][0];
    }

    split(
      pane: PaneRect,
      edge: Direction,
      size: number,
      callback?: (newDivider: DividerRect) => void
    ) {
      const { panes, dividers } = this.state;

      const newDividerOrientation =
        edge === Direction.North || edge === Direction.South
          ? Orientation.Horizontal
          : Orientation.Vertical;

      const newLayoutOrientation =
        newDividerOrientation === Orientation.Vertical
          ? Orientation.Horizontal
          : Orientation.Vertical;

      let layout = pane.parent;

      const newLayoutId = uuidv4();

      const newLayout =
        layout.orientation === newLayoutOrientation
          ? null
          : new LayoutRect(
              newLayoutId,
              pane.position,
              pane.size,
              newLayoutOrientation,
              pane.parent,
              pane.previous,
              pane.next
            );

      if (newLayout !== null) {
        pane.position = 0;
        pane.size = 1;

        pane.parent.replaceChild(pane, newLayout);
        layout = newLayout;

        if (pane.next) pane.next.previous = newLayout;
        if (pane.previous) pane.previous.next = newLayout;

        pane.next = pane.previous = null;
      }

      const newPaneId = uuidv4();

      const newPane = new PaneRect(
        newPaneId,
        pane.position,
        pane.size,
        pane.orientation,
        pane.parent,
        pane.previous,
        pane.next
      );
      layout.addChild(newPane);

      const newDividerId = uuidv4();

      const newDivider = new DividerRect(
        newDividerId,
        -1, // ? Placeholder
        1,
        newDividerOrientation,
        layout,
        null,
        null
      );
      layout.addDivider(newDivider);

      if (edge === Direction.North || edge === Direction.West) {
        pane.position += size;
        pane.size -= size;
        newPane.size = size;

        newDivider.position = size + pane.position;

        if (pane.previous) pane.previous.next = newPane;

        pane.previous = newDivider;
        newPane.next = newDivider;

        newDivider.previous = newPane;
        newDivider.next = pane;
      } else {
        pane.size -= size;
        newPane.position = pane.position + pane.size;
        newPane.size = size;

        newDivider.position = pane.position + pane.size;

        if (pane.next) pane.next.previous = newPane;

        pane.next = newDivider;
        newPane.previous = newDivider;

        newDivider.previous = pane;
        newDivider.next = newPane;
      }

      panes.push(newPane);
      dividers.push(newDivider);

      this.forceUpdate(
        callback
          ? () => {
              callback(newDivider);
              if (this.props.onLayoutChange)
                this.props.onLayoutChange(this.JSON());
            }
          : () => {
              if (this.props.onLayoutChange)
                this.props.onLayoutChange(this.JSON());
            }
      );
    }

    resize(divider: DividerRect, size: number, callback?: () => void) {
      const { previous, next } = divider;

      const min = previous!.position;
      const max = next!.position + next!.size;

      const position = clamp(size, min, max);

      previous!.setRange(min, position);
      next!.setRange(position, max);

      divider.position = position;

      this.forceUpdate(
        callback
          ? () => {
              callback();
              if (this.props.onLayoutChange)
                this.props.onLayoutChange(this.JSON());
            }
          : () => {
              if (this.props.onLayoutChange)
                this.props.onLayoutChange(this.JSON());
            }
      );
    }

    remove(divider: DividerRect, callback?: () => void) {
      const { dividers, panes } = this.state;

      removeFromArray(divider.parent.dividers, divider);
      removeFromArray(dividers, divider);

      const prevSize = divider.previous!.size;

      const destroyed = prevSize <= 0 ? divider.previous : divider.next;

      if (prevSize <= 0) {
        const mergedDivider = divider.previous!.previous;

        divider.next!.previous = mergedDivider;
        if (mergedDivider) mergedDivider.next = divider.next;
      } else {
        const mergedDivider = divider.next!.next;

        divider.previous!.next = mergedDivider;
        if (mergedDivider) mergedDivider.previous = divider.previous;
      }

      destroyed!.destroy(panes, dividers);

      if (destroyed!.parent)
        removeFromArray(destroyed!.parent.children, destroyed);

      this.forceUpdate(
        callback
          ? () => {
              callback();
              if (this.props.onLayoutChange)
                this.props.onLayoutChange(this.JSON());
            }
          : () => {
              if (this.props.onLayoutChange)
                this.props.onLayoutChange(this.JSON());
            }
      );
    }

    setDragging(
      divider: DividerRect,
      dragging: boolean,
      callback?: () => void
    ) {
      divider.dragging = dragging;
      this.forceUpdate(callback);
    }

    setClosing(divider: DividerRect, closing: boolean, callback?: () => void) {
      divider.closing = closing;
      this.forceUpdate(callback);
    }

    render() {
      const { forwardedRef, defaultLayout, onLayoutChange, ...rest } =
        this.props;
      const { layout, panes, dividers } = this.state;
      return (
        <Component
          {...(rest as P)}
          ref={forwardedRef}
          _layout={layout}
          _panes={panes}
          _dividers={dividers}
          _layoutManager={this}
          _layoutContainerRef={this.layoutContainerRef}
        />
      );
    }
  }

  return React.forwardRef<unknown, PropsWithouthRef<P>>((props, ref) => (
    <WithLayout {...(props as Props<P>)} forwardedRef={ref} />
  ));
}
