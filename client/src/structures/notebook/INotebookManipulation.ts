export interface ICell {
  id: string;
  data: any;
  content: string;
}

export interface IPage {
  id: string;
  data: any;
  cells: ICell[];
}

export interface INotebook {
  id: string;
  name: string;
  document_path?: string;
  pages: IPage[];
}

export interface INotebookManipulationArguments {
  action?: string;
  page?: IPage;
  pageId?: string;
  cell?: ICell;
  cellId?: string;
  index?: number;
  question?: string;
  prompt?: string;
  query?: string;
  content?: string;
  previousContent?: string;
  data?: any;
  previousData?: any;
  word?: string;
  pageIndex?: number;
  cellIndex?: number;
}

export type INotebookManipulation = (
  notebook: INotebook,
  notebookCommand: INotebookManipulationArguments
) => INotebook | Promise<INotebook>;
