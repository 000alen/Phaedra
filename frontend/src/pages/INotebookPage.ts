import { INotebookPageController } from "../contexts/INotebookPageController";
import { INotebook } from "../manipulation/INotebookManipulation";

export interface NotebookPageProps {
  id: string;
  notebook: INotebook;
  notebookPath?: string | undefined;
}

export interface NotebookPageState {
  commandBoxShown: boolean;
  messageBars: JSX.Element[];
  notebookPageController: INotebookPageController;
}
