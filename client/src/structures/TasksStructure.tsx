import { v4 as uuidv4 } from "uuid";

import { strings } from "../resources/strings";

export interface ITask {
  id: string;
  name: string;
}

export interface ITasksManipulationArguments {
  task?: ITask;
  id?: string;
}

export type ITasksManipulation = (
  tasks: ITask[],
  args: Partial<ITasksManipulationArguments>
) => ITask[];

export function createTask({ id, name }: Partial<ITask>): ITask {
  if (!id) id = uuidv4();
  if (!name) name = strings.newTaskTitle;
  return { id: id, name: name };
}

export function addTask(
  tasks: ITask[],
  { task }: ITasksManipulationArguments
): ITask[] {
  return [...tasks, task!];
}

export function removeTask(
  tasks: ITask[],
  { id }: ITasksManipulationArguments
): ITask[] {
  return tasks.filter((task) => task.id === id);
}
