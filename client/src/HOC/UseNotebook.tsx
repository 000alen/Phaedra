import { v4 as uuidv4 } from "uuid";

import { getStrings } from "../strings";

export interface ISource {
  id: string;
  content: string;
}

export interface IReference {
  id: string;
  sourceId: string;
}

export type IContent = object[];

export interface IPage {
  id: string;
  references: IReference[];
  layout: any;
  content: IContent;
}

export interface INotebook {
  id: string;
  name: string;
  sources: ISource[];
  pages: IPage[];
}

export function createNotebook({
  id,
  name,
  sources,
  pages,
}: Partial<INotebook>): INotebook {
  if (id === undefined) id = uuidv4();
  if (name === undefined) name = getStrings().newNotebookTitle;
  if (sources === undefined) sources = [];
  if (pages === undefined) pages = [createPage({})];

  return {
    id,
    name,
    sources,
    pages,
  };
}

export function createPage({
  id,
  references,
  layout,
  content,
}: Partial<IPage>): IPage {
  if (id === undefined) id = uuidv4();
  if (references === undefined) references = [];
  if (layout === undefined) layout = undefined;
  if (content === undefined) content = [];

  return {
    id,
    references,
    layout,
    content,
  };
}

export function makeNotebookUnique(notebook: INotebook): INotebook {
  return {
    ...notebook,
    id: uuidv4(),
    pages: notebook.pages.map(makePageUnique),
  };
}

export function makePageUnique(page: IPage): IPage {
  return {
    ...page,
    id: uuidv4(),
  };
}
