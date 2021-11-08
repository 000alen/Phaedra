import React from "react";

import { Label, Panel, PanelType, Spinner, SpinnerSize } from "@fluentui/react";

import { ITask } from "../structures/TasksStructure";

interface ITasksPanelComponentProps {
  tasksPanelShown: boolean;
  hideTasksPanel: () => void;
  tasks: ITask[];
}

export default function TasksPanelComponent({
  tasksPanelShown,
  hideTasksPanel,
  tasks,
}: ITasksPanelComponentProps) {
  return (
    <Panel
      isLightDismiss
      type={PanelType.smallFixedNear}
      isOpen={tasksPanelShown}
      onDismiss={hideTasksPanel}
    >
      <Label>Tasks panel!</Label>
      <div className="space-y-2">
        {tasks.map((task) => (
          <Spinner
            key={task.id}
            label={task.name}
            labelPosition="right"
            size={SpinnerSize.xSmall}
          />
        ))}
      </div>
    </Panel>
  );
}