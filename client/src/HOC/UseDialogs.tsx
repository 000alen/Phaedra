import React from "react";
import { Subtract } from "utility-types";

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

interface UseDialogsProps {
  forwardedRef: React.Ref<any>;
}

interface UseDialogsState {
  dialogs: IDialog[];
}

export interface UseDialogsInjectedProps {
  dialogs: IDialog[];
  dialogsManager: DialogsManager;
}

type Props<P extends UseDialogsInjectedProps> = Subtract<
  P & UseDialogsProps,
  UseDialogsInjectedProps
>;

type PropsWithoutRef<P extends UseDialogsInjectedProps> = Subtract<
  Props<P>,
  { forwardedRef: React.Ref<any> }
>;

export interface DialogsManager {
  get(id: string): IDialog | undefined;
  add(dialog: IDialog): void;
  remove(id: string): void;
  setTitle(id: string, title: string): void;
  setSubText(id: string, subText: string): void;
  setType(id: string, type: DialogType): void;
  setVisible(id: string, visible: boolean): void;
  setFooter(id: string, footer: JSX.Element): void;
  setOnDismiss(id: string, onDismiss: () => void): void;
}

export function UseDialogs<P extends UseDialogsInjectedProps>(
  Component: React.ComponentType<P>
) {
  class WithDialogs extends React.Component<Props<P>, UseDialogsState> {
    constructor(props: Props<P>) {
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
          {...(this.props as P)}
          ref={this.props.forwardedRef}
          dialogs={this.state.dialogs}
          dialogsManager={this}
        />
      );
    }
  }

  return React.forwardRef<unknown, PropsWithoutRef<P>>((props, ref) => (
    <WithDialogs {...(props as Props<P>)} forwardedRef={ref} />
  ));
}
