export type IDirection = "north" | "south" | "east" | "west";

export type IOrientation = "horizontal" | "vertical";

export interface IPaneProps {
  type: string;
  paramId?: string | undefined;
}

export interface IPane {
  type: "pane";
  id: string;
  position: number;
  size: number;
  previous: string | null;
  next: string | null;
  props: IPaneProps;
}

export interface ILayout {
  type: "layout";
  id: string;
  position: number;
  size: number;
  orientation: "horizontal" | "vertical";
  previous: string | null;
  next: string | null;
  children: (ILayout | IPane)[];
}

export interface ILayoutController {
  splitPageLayoutPane: (
    pageId: string,
    paneId: string,
    edge: IDirection,
    relativeSize: number
  ) => void;
  resizePageLayoutPane: (
    pageId: string,
    paneId: string,
    edge: IDirection,
    size: number
  ) => void;
  removePageLayoutPane: (pageId: string, paneId: string) => void;
}
