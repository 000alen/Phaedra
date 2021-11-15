import { useState } from "react";

import { IDialog } from "../App";

export function useDialogs(initialDialogs: IDialog[]) {
  const [dialogs, setDialogs] = useState(initialDialogs);

  return {
    dialogs,
    dialogsManager: new DialogsManager(dialogs, setDialogs),
  };
}

export class DialogsManager {
  dialogs: IDialog[];
  setDialogs: (dialogs: IDialog[]) => void;

  constructor(dialogs: IDialog[], setDialogs: (dialogs: IDialog[]) => void) {
    this.dialogs = dialogs;
    this.setDialogs = setDialogs;
  }

  get(id: string) {}

  add(dialog: IDialog) {}

  remove(id: string) {}

  setVisible(id: string, visible: boolean) {}
}
