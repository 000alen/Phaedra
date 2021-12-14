import React from "react";

import { Dialog as FluentDialog, DialogType } from "@fluentui/react";

interface DialogProps {
  id: string;
  title: string;
  subText: string;
  type: DialogType;
  visible: boolean;
  footer?: JSX.Element;
  onDismiss?: () => void;
}

export function Dialog({
  id,
  title,
  subText,
  type,
  visible,
  footer,
  onDismiss,
}: DialogProps) {
  return (
    <FluentDialog
      key={id}
      hidden={!visible}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: type,
        title: title,
        subText: subText,
      }}
    >
      {footer}
    </FluentDialog>
  );
}
