import React from "react";
import { IDirection, ILayoutController, IOrientation, IPane, IPaneProps } from "../types";
export interface PaneProps {
    notebook: ILayoutController;
    pageId: string;
    pane: IPane;
    orientation: IOrientation;
    Component: React.ComponentType<IPaneProps>;
}
export declare class Pane extends React.Component<PaneProps> {
    paneRef: React.RefObject<HTMLDivElement>;
    constructor(props: PaneProps);
    computeEdge(event: React.MouseEvent): IDirection | null;
    computeRelativeSize(orientation: IOrientation, event: React.MouseEvent): number;
    handleMouseDown(event: React.MouseEvent): void;
    render(): JSX.Element;
}
