export interface IDialog {
  id: string;
  title: string;
  subText: string;
  type: DialogType;
  visible: boolean;
  footer?: JSX.Element;
  onDismiss?: () => void;
}

export interface IMessage {
  id: string;
  text: string;
  type: MessageBarType;
}

export interface IPanel {
  id: string;
  type: PanelType;
  visible: boolean;
  content: JSX.Element;
  onDismiss?: () => void;
}

export interface ITab {
  id: string;
  title: string;
  component: any;
  props: any;
  dirty: boolean;
}

export interface ITask {
  id: string;
  name: string;
}

export interface IWidget {
  id: string;
  element: JSX.Element;
}
