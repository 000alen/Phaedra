import { useState } from "react";

import { ITask } from "../App";

export function useTasks(initialTasks: ITask[]) {
  const [tasks, setTasks] = useState(initialTasks);

  return {
    tasks,
    tasksManager: new TasksManager(tasks, setTasks),
  };
}

export class TasksManager {
  tasks: ITask[];
  setTasks: (tasks: ITask[]) => void;

  constructor(tasks: ITask[], setTasks: (tasks: ITask[]) => void) {
    this.tasks = tasks;
    this.setTasks = setTasks;
  }

  get(id: string) {}

  add(task: ITask) {}

  remove(id: string) {}
}
