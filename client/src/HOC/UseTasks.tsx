import React from "react";

export interface ITask {
  id: string;
  name: string;
}

interface UseTasksProps {}

interface UseTasksState {
  tasks: ITask[];
}

export function UseTasks<P extends object>(Component: React.ComponentType<P>) {
  return class extends React.Component<P & UseTasksProps, UseTasksState> {
    constructor(props: P & UseTasksProps) {
      super(props);

      this.get = this.get.bind(this);
      this.add = this.add.bind(this);
      this.remove = this.remove.bind(this);
      this.setName = this.setName.bind(this);

      this.state = {
        tasks: [],
      };
    }

    get(id: string) {
      return this.state.tasks.find((t) => t.id === id);
    }

    add(task: ITask) {
      const newTasks = [...this.state.tasks];
      newTasks.push(task);
      this.setState({ tasks: newTasks });
    }

    remove(id: string) {
      const newTasks = this.state.tasks.filter((task) => task.id !== id);
      this.setState({ tasks: newTasks });
    }

    setName(id: string, name: string) {
      const newTasks = this.state.tasks.map((task) =>
        task.id === id ? { ...task, name } : task
      );
      this.setState({ tasks: newTasks });
    }

    render() {
      return (
        <Component
          tasks={this.state.tasks}
          tasksManager={this}
          {...(this.props as P)}
        />
      );
    }
  };
}
