import CommandBoxComponent from "../components/CommandBoxComponent";
import NotebookComponent from "../components/Notebook/NotebookComponent";
import {
  IMessagesCommand,
  IMessagesManipulation,
} from "../manipulation/IMessagesManipulation";
import { IAppController } from "./IAppController";
import { INotebookController } from "./INotebookController";

export interface INotebookPageController {
  messagesDo: (
    manipulation: IMessagesManipulation,
    args: IMessagesCommand
  ) => void;
  showCommandBox: () => void;
  hideCommandBox: () => void;
  getCommandBoxRef: () => React.RefObject<CommandBoxComponent> | undefined;
  getAppController: () => IAppController | undefined;
  getNotebookController: () => INotebookController | undefined;
}
