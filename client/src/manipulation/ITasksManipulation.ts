export interface ITask {
  id: string;
  name: string;
}

export interface ITasksCommand {
  task?: ITask;
  id?: string;
}

export type ITasksManipulation = (
  tasks: ITask[],
  args: Partial<ITasksCommand>
) => ITask[];
