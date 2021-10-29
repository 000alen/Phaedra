import { ITask, ITasksCommand } from "./ITasksManipulation";

export function addTask(tasks: ITask[], { task }: ITasksCommand): ITask[] {
  return [...tasks, task!];
}

export function removeTask(tasks: ITask[], { id }: ITasksCommand): ITask[] {
  return tasks.filter((task) => task.id === id);
}
