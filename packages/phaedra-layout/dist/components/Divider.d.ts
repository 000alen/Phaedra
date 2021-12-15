import React from "react";
import { ILayout, IPane, ILayoutController, IOrientation } from "../types";
export interface DividerProps {
    notebook: ILayoutController;
    pageId: string;
    orientation: IOrientation;
    previous: ILayout | IPane;
    next: ILayout | IPane;
}
export declare class Divider extends React.Component<DividerProps> {
    computeSize(orientation: IOrientation): React.CSSProperties;
    render(): JSX.Element;
}
