import React from "react";
import { Direction, DividerRect, LayoutRect, PaneRect } from "./Rect";
export interface UseLayoutProps {
    forwardedRef: React.Ref<any>;
    defaultLayout?: LayoutJSON;
    onLayoutChange?: (layout: LayoutRect) => void;
}
export interface UseLayoutState {
    layout: LayoutRect;
    panes: PaneRect[];
    dividers: DividerRect[];
}
export interface UseLayoutInjectedProps {
    layoutManager: LayoutManager;
    layout: LayoutRect;
    layoutContainerRef: React.RefObject<HTMLDivElement>;
}
export interface PaneJSON {
    type: "pane";
    id: string;
    position: number;
    size: number;
    previous: string | null;
    next: string | null;
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
    computeRelativeSize(event: React.MouseEvent, domRect: DOMRect, edge: Direction): number;
    computeAbsoluteSize(event: React.MouseEvent, domRect: DOMRect, edge: Direction): number;
    paneFindEdge(event: React.MouseEvent, domRect: DOMRect): Direction | null;
    empty(): LayoutRect;
    split(pane: PaneRect, direction: Direction, size: number, callback?: (newDivider: DividerRect) => void): void;
    resize(divider: DividerRect, size: number, callback?: () => void): void;
    remove(divider: DividerRect, callback?: () => void): void;
    setDragging(divider: DividerRect, dragging: boolean, callback?: () => void): void;
    setClosing(divider: DividerRect, closing: boolean, callback?: () => void): void;
}
export declare function UseLayout<P extends UseLayoutInjectedProps>(Component: React.ComponentType<P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<Pick<Pick<P & UseLayoutProps, "forwardedRef" | "defaultLayout" | "onLayoutChange" | import("utility-types").SetDifference<keyof P, "layout" | "layoutManager" | "layoutContainerRef">>, "defaultLayout" | "onLayoutChange" | import("utility-types").SetDifference<import("utility-types").SetDifference<keyof P, "layout" | "layoutManager" | "layoutContainerRef">, "forwardedRef">>> & React.RefAttributes<unknown>>;
