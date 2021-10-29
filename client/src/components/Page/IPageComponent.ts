import { ICell } from "../../structures/notebook/INotebookManipulation";
import { DocumentFile } from "../Notebook/INotebookComponent";

export interface PageComponentProps {
  id: string;
  data: any;
  cells: ICell[];
  active: boolean;
  activeCell: string | undefined;
  document: DocumentFile | undefined;
  editing: boolean;
}

export interface PageComponentState {}
