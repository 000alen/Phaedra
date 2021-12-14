import { LayoutJSON } from "../Layout/UseLayout/UseLayout";

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

export type IContent = object;

export interface IQuill {
  id: string;
  content: IContent;
}

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
