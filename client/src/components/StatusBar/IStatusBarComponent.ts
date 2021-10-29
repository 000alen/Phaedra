import { ITask } from "../../structures/tasks/ITasksManipulation";
import { IWidget } from "../../structures/widgets/IWidgetsManipulation";

export interface StatusBarComponentProps {
  tasks: ITask[];
  widgets: IWidget[];
}
