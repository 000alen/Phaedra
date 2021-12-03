import React from "react";

import { MessageBar, MessageBarType } from "@fluentui/react";

interface MessageProps {
  id: string;
  type: MessageBarType;
  text: string;
  onDismiss: (id: string) => void;
}

export function Message({ id, type, text, onDismiss }: MessageProps) {
  return (
    <MessageBar
      className="shadow-sm"
      key={id}
      id={id}
      isMultiline={false}
      messageBarType={type}
      onDismiss={() => onDismiss(id)}
    >
      {text}
    </MessageBar>
  );
}
