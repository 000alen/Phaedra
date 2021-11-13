import { Icon, Label, mergeStyles } from "@fluentui/react";

import { strings } from "../resources/strings";

const iconClass = mergeStyles({
  fontSize: 100,
  color: "#dddddd",
});

export function FileView() {
  return (
    <div className="w-[100%] h-[100%] flex items-center justify-center">
      <div className="flex-col items-center">
        <Icon iconName="TextDocument" className={iconClass} />
        <Label>{strings.welcome}</Label>
      </div>
    </div>
  );
}
