import React from "react";

import { ITask, IWidget } from "../App";
import { getTheme } from "../resources/theme";
import { StatusBarLoading } from "./StatusBarLoading";

export interface StatusBarProps {
  tasks: ITask[];
  statusBarWidgets: IWidget[];
  onShowTasksPanel: () => void;
}

export function StatusBar({
  tasks,
  statusBarWidgets: widgets,
  onShowTasksPanel,
}: StatusBarProps): JSX.Element {
  let task;
  if (tasks.length > 0) task = tasks[0];

  const statusBarStyle = {
    backgroundColor: getTheme().palette.white,
  };

  return (
    <div
      className="w-[100%] h-5 z-50 flex flex-row items-center px-2 select-none"
      style={statusBarStyle}
    >
      <div className="w-[100%]">
        {task && (
          <StatusBarLoading
            text={task.name}
            onShowTasksPanel={onShowTasksPanel}
          />
        )}
      </div>

      <div className="w-[100%] h-[100%] flex flex-row-reverse space-x-2">
        {widgets.map((widget) => widget.element)}
      </div>
    </div>
  );
}
