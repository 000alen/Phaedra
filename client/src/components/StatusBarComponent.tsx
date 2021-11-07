import "../css/StatusBarComponent.css";

import React from "react";

import { theme } from "../resources/theme";
import { ITask } from "../structures/TasksStructure";
import { IWidget } from "../structures/WidgetsStructure";
import { StatusBarLoadingComponent } from "./StatusBarLoadingComponent";

export interface StatusBarComponentProps {
  tasks: ITask[];
  statusBarWidgets: IWidget[];
  onShowTasksPanel: () => void;
}

export function StatusBarComponent({
  tasks,
  statusBarWidgets: widgets,
  onShowTasksPanel,
}: StatusBarComponentProps): JSX.Element {
  let task;
  if (tasks.length > 0) task = tasks[0];

  const statusBarStyle = {
    backgroundColor: theme.palette.neutralLight,
  };

  return (
    <div
      className="statusBar flex flex-row items-center px-2 select-none"
      style={statusBarStyle}
    >
      <div className="statusBarMessageSection">
        {task && (
          <StatusBarLoadingComponent
            text={task.name}
            onShowTasksPanel={onShowTasksPanel}
          />
        )}
      </div>

      <div className="statusBarButtonsSection flex flex-row-reverse space-x-2">
        {widgets.map((widget) => widget.element)}
      </div>
    </div>
  );
}
