export interface ISource {
  id: string;
  title: string;
  type: string;
  content: string;
  path?: string;
  index?: number;
}

export interface IReference {
  id: string;
  title: string;
  sourceId: string;
}

export interface IContent {
  ops: object[];
}

export interface IQuill {
  id: string;
  content: IContent;
}

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

export interface IPage {
  id: string;
  references: IReference[];
  layout: ILayout;
  content: IContent;
  quills: IQuill[];
}

export interface INotebook {
  id: string;
  name: string;
  sources: ISource[];
  pages: IPage[];
}
