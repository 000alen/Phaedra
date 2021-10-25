import { ICell } from "../../../manipulation/INotebookManipulation";
import { DocumentFile } from "../INotebookComponent";

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
