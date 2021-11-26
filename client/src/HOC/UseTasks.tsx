import React from "react";
import { Subtract } from "utility-types";

export interface ITask {
  id: string;
  name: string;
}

interface UseTasksProps {
  forwardedRef: React.Ref<any>;
}

interface UseTasksState {
  tasks: ITask[];
}

export interface UseTasksInjectedProps {
  tasks: ITask[];
  tasksManager: TasksManager;
}

export interface TasksManager {
  get(id: string): ITask | undefined;
  add(task: ITask, callback?: () => void): void;
  remove(id: string, callback?: () => void): void;
  setName(id: string, name: string, callback?: () => void): void;
}

type Props<P extends UseTasksInjectedProps> = Subtract<
  P & UseTasksProps,
  UseTasksInjectedProps
>;

type PropsWithoutRef<P extends UseTasksInjectedProps> = Subtract<
  Props<P>,
  { forwardedRef: React.Ref<any> }
>;

export function UseTasks<P extends UseTasksInjectedProps>(
  Component: React.ComponentType<P>
) {
  class WithTasks extends React.Component<Props<P>, UseTasksState> {
    constructor(props: Props<P>) {
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

    add(task: ITask, callback?: () => void) {
      const newTasks = [...this.state.tasks];
      newTasks.push(task);
      this.setState({ tasks: newTasks }, callback);
    }

    remove(id: string, callback?: () => void) {
      const newTasks = this.state.tasks.filter((task) => task.id !== id);
      this.setState({ tasks: newTasks }, callback);
    }

    setName(id: string, name: string, callback?: () => void) {
      const newTasks = this.state.tasks.map((task) =>
        task.id === id ? { ...task, name } : task
      );
      this.setState({ tasks: newTasks }, callback);
    }

    render() {
      return (
        <Component
          {...(this.props as P)}
          ref={this.props.forwardedRef}
          tasks={this.state.tasks}
          tasksManager={this}
        />
      );
    }
  }

  return React.forwardRef<unknown, PropsWithoutRef<P>>((props, ref) => (
    <WithTasks {...(props as Props<P>)} forwardedRef={ref} />
  ));
}
