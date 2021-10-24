import { INotebookPageController } from "../../contexts/INotebookPageController";
import { IMessage } from "../../manipulation/IMessagesManipulation";
import { INotebook } from "../../manipulation/INotebookManipulation";

export interface NotebookPageProps {
  id: string;
  notebook: INotebook;
  notebookPath?: string | undefined;
}

export interface NotebookPageState {
  messages: IMessage[];
  ribbonKey: string;
  commandBoxShown: boolean;
  notebookPageController: INotebookPageController;
}

export interface NotebookPageViewProps {}
