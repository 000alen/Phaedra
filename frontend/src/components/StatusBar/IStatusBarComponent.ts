import { ITask } from "../../manipulation/ITasksManipulation";
import { IWidget } from "../../manipulation/IWidgetsManipulation";

export interface StatusBarComponentProps {
  tasks: ITask[];
  widgets: IWidget[];
}
