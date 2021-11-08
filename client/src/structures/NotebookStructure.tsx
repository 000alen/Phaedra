import { v4 as uuidv4 } from "uuid";

import { strings } from "../resources/strings";

export type ISource = any;

export type IData = any;

export type IReference = any;

export type IBlock = any;

export interface IPage {
  id: string;
  references: IReference[];
  data: IData;
  blocks: IBlock[];
}

export interface INotebook {
  id: string;
  name: string;
  sources: ISource[];
  data: IData;
  pages: IPage[];
}

export function createNotebook({
  id,
  name,
  sources,
  data,
  pages,
}: Partial<INotebook>): INotebook {
  if (id === undefined) id = uuidv4();
  if (name === undefined) name = strings.newNotebookTitle;
  if (sources === undefined) sources = [];
  if (data === undefined) data = {};
  if (pages === undefined)
    pages = [
      {
        id: uuidv4(),
        references: [],
        data: {},
        blocks: [],
      },
    ];

  return {
    id: id,
    name: name,
    sources: sources,
    data: data,
    pages: pages,
  };
}

export function createPage({
  id,
  references,
  data,
  blocks,
}: Partial<IPage>): IPage {
  if (id === undefined) id = uuidv4();
  if (references === undefined) references = [];
  if (data === undefined) data = {};
  if (blocks === undefined) blocks = [];

  return {
    id: id,
    references: references,
    data: data,
    blocks: blocks,
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
