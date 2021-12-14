import { PaneRectProps } from "../Layout/UseLayout/Rect";
import { LayoutJSON, PaneJSON } from "../Layout/UseLayout/UseLayout";

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

export type IPaneProps = PaneRectProps;

export type IPane = PaneJSON;

export type ILayout = LayoutJSON;

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
