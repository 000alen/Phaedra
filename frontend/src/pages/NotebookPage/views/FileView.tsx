import { Icon, Label, mergeStyles } from "@fluentui/react";

import { NotebookPageViewProps } from "../INotebookPage";

const iconClass = mergeStyles({
  fontSize: 100,
  color: "#dddddd",
});

export function FileView({}: NotebookPageViewProps) {
  return (
    <div className="flex items-center justify-center fill-parent">
      <div className="flex-col items-center">
        <Icon iconName="TextDocument" className={iconClass} />
        <Label>Welcome to Phaedra!</Label>
      </div>
    </div>
  );
}
