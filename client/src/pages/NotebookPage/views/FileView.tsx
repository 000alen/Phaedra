import { Icon, Label, mergeStyles } from "@fluentui/react";

import { strings } from "../../../strings";

const iconClass = mergeStyles({
  fontSize: 100,
  color: "#dddddd",
});

export function FileView() {
  return (
    <div className="flex items-center justify-center fill-parent">
      <div className="flex-col items-center">
        <Icon iconName="TextDocument" className={iconClass} />
        <Label>{strings.welcome}</Label>
      </div>
    </div>
  );
}
