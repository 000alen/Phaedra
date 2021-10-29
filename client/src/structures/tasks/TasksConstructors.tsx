import { v4 as uuidv4 } from "uuid";

import { strings } from "../../strings";
import { ITask } from "./ITasksManipulation";

export function createTask({ id, name }: Partial<ITask>): ITask {
  if (!id) id = uuidv4();
  if (!name) name = strings.newTaskTitle;
  return { id: id, name: name };
}
