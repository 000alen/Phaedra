import React from "react";

import { DialogType } from "@fluentui/react";

export interface IDialog {
  id: string;
  title: string;
  subText: string;
  type: DialogType;
  visible: boolean;
  footer?: JSX.Element;
  onDismiss?: () => void;
}

interface UseDialogsProps {}

interface UseDialogsState {
  dialogs: IDialog[];
}

export function UseDialogs<P extends object>(
  Component: React.ComponentType<P>
) {
  return class extends React.Component<P & UseDialogsProps, UseDialogsState> {
    constructor(props: P & UseDialogsProps) {
      super(props);

      this.get = this.get.bind(this);
      this.add = this.add.bind(this);
      this.remove = this.remove.bind(this);
      this.setTitle = this.setTitle.bind(this);
      this.setSubText = this.setSubText.bind(this);
      this.setType = this.setType.bind(this);
      this.setVisible = this.setVisible.bind(this);
      this.setFooter = this.setFooter.bind(this);
      this.setOnDismiss = this.setOnDismiss.bind(this);

      this.state = {
        dialogs: [],
      };
    }

    get(id: string) {
      return this.state.dialogs.find((dialog) => dialog.id === id);
    }

    add(dialog: IDialog) {
      const newDialogs = [...this.state.dialogs];
      newDialogs.push(dialog);
      this.setState({ dialogs: newDialogs });
    }

    remove(id: string) {
      const newDialogs = this.state.dialogs.filter(
        (dialog) => dialog.id !== id
      );
      this.setState({ dialogs: newDialogs });
    }

    setTitle(id: string, title: string) {
      const newDialogs = this.state.dialogs.map((dialog) =>
        dialog.id === id ? { ...dialog, title } : dialog
      );
      this.setState({ dialogs: newDialogs });
    }

    setSubText(id: string, subText: string) {
      const newDialogs = this.state.dialogs.map((dialog) =>
        dialog.id === id ? { ...dialog, subText } : dialog
      );
      this.setState({ dialogs: newDialogs });
    }

    setType(id: string, type: DialogType) {
      const newDialogs = this.state.dialogs.map((dialog) =>
        dialog.id === id ? { ...dialog, type } : dialog
      );
      this.setState({ dialogs: newDialogs });
    }

    setVisible(id: string, visible: boolean) {
      const newDialogs = this.state.dialogs.map((dialog) =>
        dialog.id === id ? { ...dialog, visible } : dialog
      );
      this.setState({ dialogs: newDialogs });
    }

    setFooter(id: string, footer: JSX.Element) {
      const newDialogs = this.state.dialogs.map((dialog) =>
        dialog.id === id ? { ...dialog, footer } : dialog
      );
      this.setState({ dialogs: newDialogs });
    }

    setOnDismiss(id: string, onDismiss: () => void) {
      const newDialogs = this.state.dialogs.map((dialog) =>
        dialog.id === id ? { ...dialog, onDismiss } : dialog
      );
      this.setState({ dialogs: newDialogs });
    }

    render() {
      return (
        <Component
          dialogs={this.state.dialogs}
          dialogsManager={this}
          {...(this.props as P)}
        />
      );
    }
  };
}
