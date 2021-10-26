import "../../css/components/StatusBarComponent.css";

import React from "react";

import { theme } from "../../index";
import { StatusBarComponentProps } from "./IStatusBarComponent";
import { StatusBarLoadingComponent } from "./StatusBarLoadingComponent";

export function StatusBarComponent({
  tasks,
  widgets,
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
        {task && <StatusBarLoadingComponent text={task.name} />}
      </div>

      <div className="statusBarButtonsSection flex flex-row-reverse space-x-2">
        {widgets.map((widget) => widget.element)}
      </div>
    </div>
  );
}
