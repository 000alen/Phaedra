import { INotebookPageController } from "../../contexts/INotebookPageController";
import { IMessage } from "../../structures/messages/IMessagesManipulation";
import { INotebook } from "../../structures/notebook/INotebookManipulation";

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
