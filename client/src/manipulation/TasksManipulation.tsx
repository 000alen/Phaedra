import { v4 as uuidv4 } from "uuid";

import { ITask, ITasksCommand } from "./ITasksManipulation";

export function createTask({ id, name }: Partial<ITask>): ITask {
  if (!id) id = uuidv4();
  if (!name) name = "New Task";
  return { id: id, name: name };
}

export function addTask(tasks: ITask[], { task }: ITasksCommand): ITask[] {
  return [...tasks, task!];
}

export function removeTask(tasks: ITask[], { id }: ITasksCommand): ITask[] {
  return tasks.filter((task) => task.id === id);
}
