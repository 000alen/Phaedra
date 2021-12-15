export declare enum Direction {
    North = 0,
    South = 1,
    East = 2,
    West = 3
}
export declare enum Orientation {
    Horizontal = 0,
    Vertical = 1
}
export declare class Rect {
    id: string;
    position: number;
    size: number;
    orientation: Orientation;
    parent: any;
    previous: any;
    next: any;
    constructor(id: string, position: number, size: number, orientation: Orientation, parent?: any, previous?: any, next?: any);
    get left(): number;
    get top(): number;
    get width(): number;
    get height(): number;
    computePosition(orientation: Orientation): number;
    computeSize(orientation: Orientation): number;
    setRange(a: number, b: number): void;
    bounds(domRect: DOMRect): {
        left: number;
        top: number;
        width: number;
        height: number;
    };
}
export declare class PaneRect extends Rect {
    destroy(panes: PaneRect[], dividers: DividerRect[]): void;
}
export declare class DividerRect extends Rect {
    dragging: boolean;
    closing: boolean;
    constructor(id: string, position: number, size: number, orientation: Orientation, parent?: any, previous?: any, next?: any, dragging?: boolean, closing?: boolean);
    destroy(dividers: DividerRect[]): void;
}
export declare class LayoutRect extends Rect {
    children: any[];
    dividers: any[];
    constructor(id: string, position: number, size: number, orientation: Orientation, parent?: any, previous?: any, next?: any, children?: any[], dividers?: any[]);
    getAllPanes(): any;
    getAllDividers(): any;
    destroy(panes: PaneRect[], dividers: DividerRect[]): void;
    addChild(child: PaneRect | LayoutRect): void;
    replaceChild(child: PaneRect | LayoutRect, replacement: LayoutRect): void;
    addDivider(divider: DividerRect): void;
}
