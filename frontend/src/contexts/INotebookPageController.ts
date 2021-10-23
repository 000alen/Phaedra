import { MessageBarType } from "@fluentui/react";

import CommandBoxComponent from "../components/CommandBoxComponent";
import NotebookComponent from "../components/Notebook/NotebookComponent";
import { IAppController } from "./IAppController";

export interface INotebookPageController {
  showCommandBox: () => void;
  hideCommandBox: () => void;
  addMessageBar: (text: string, type: MessageBarType) => void;
  removeMessageBar: (id: string) => void;
  getNotebookRef: () => React.RefObject<NotebookComponent> | undefined;
  getCommandBoxRef: () => React.RefObject<CommandBoxComponent> | undefined;
  getAppController: () => IAppController | undefined;
}
