import React from "react";
import { IOrientation } from "..";
import { ILayout, ILayoutController, IPaneProps } from "../types";
export interface LayoutProps {
    notebook: ILayoutController;
    pageId: string;
    layout: ILayout;
    orientation: IOrientation;
    Component: React.ComponentType<IPaneProps>;
}
export declare class Layout extends React.Component<LayoutProps> {
    render(): JSX.Element;
}
