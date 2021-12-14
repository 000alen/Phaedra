import { IPage } from "../../Notebook/Notebook";
import { NotebookManager } from "../../Notebook/UseNotebook";

interface BlotsProps {
  data: string | any;
  notebookManager: NotebookManager;
  page: IPage;
}

interface BlotsState {
  query: string;
  response: any;
}
