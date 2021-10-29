import { v4 as uuidv4 } from "uuid";

import { strings } from "../../strings";
import {
  ICell,
  INotebook,
  INotebookManipulationArguments,
  IPage,
} from "./INotebookManipulation";

export function createNotebook({
  id,
  name,
  document_path,
  pages,
}: Partial<INotebook>): INotebook {
  if (id === undefined) id = uuidv4();
  if (name === undefined) name = strings.newNotebookTitle;
  if (document_path === undefined) document_path = undefined;
  if (pages === undefined)
    pages = [
      {
        id: uuidv4(),
        data: {},
        cells: [],
      },
    ];

  return {
    id: id,
    name: name,
    document_path: document_path,
    pages: pages,
  };
}

export function createPage({ id, data, cells }: Partial<IPage>): IPage {
  if (id === undefined) id = uuidv4();
  if (data === undefined) data = {};
  if (cells === undefined) cells = [];

  return {
    id: id,
    data: data,
    cells: cells,
  };
}

export function createCell({ id, data, content }: Partial<ICell>): ICell {
  if (id === undefined) id = uuidv4();
  if (data === undefined) data = {};
  if (content === undefined) content = strings.newCellContent;

  return {
    id: id,
    data: data,
    content: content,
  };
}

export function createCommand({
  action,
  page,
  pageId,
  cell,
  cellId,
  index,
  question,
  prompt,
  query,
  content,
  previousContent,
  data,
  previousData,
  word,
}: Partial<INotebookManipulationArguments>): INotebookManipulationArguments {
  return {
    action: action,
    page: page,
    pageId: pageId,
    cell: cell,
    cellId: cellId,
    index: index,
    question: question,
    prompt: prompt,
    query: query,
    content: content,
    previousContent: previousContent,
    data: data,
    previousData: previousData,
    word: word,
  };
}
