import React from "react";

import { getTheme } from "../themes";
import { ITask, IWidget } from "../types";
import { StatusBarLoading } from "./StatusBarLoading";

export interface StatusBarProps {
  tasks: ITask[];
  statusBarWidgets: IWidget[];
  onShowTasksPanel: () => void;
}

export function StatusBar({
  tasks,
  statusBarWidgets: widgets,
  onShowTasksPanel
}: StatusBarProps): JSX.Element {
  let task;
  if (tasks.length > 0) task = tasks[0];

  const statusBarStyle = {
    backgroundColor: getTheme().palette.white
  };

  return (
    <div
      className="w-full h-5 z-50 flex flex-row items-center px-2 select-none"
      style={statusBarStyle}
    >
      <div className="w-full">
        {task && (
          <StatusBarLoading
            text={task.name}
            onShowTasksPanel={onShowTasksPanel}
          />
        )}
      </div>

      <div className="w-full h-full flex flex-row-reverse space-x-2">
        {widgets.map((widget) => widget.element)}
      </div>
    </div>
  );
}
