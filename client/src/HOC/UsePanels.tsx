import React from "react";
import { Subtract } from "utility-types";

import { PanelType } from "@fluentui/react";

export interface IPanel {
  id: string;
  type: PanelType;
  visible: boolean;
  content: JSX.Element;
  onDismiss?: () => void;
}

interface UsePanelsProps {
  forwardedRef: React.Ref<any>;
}

interface UsePanelsState {
  panels: IPanel[];
}

export interface UsePanelsInjectedProps {
  panels: IPanel[];
  panelsManager: PanelsManager;
}

type Props<P extends UsePanelsInjectedProps> = Subtract<
  P & UsePanelsProps,
  UsePanelsInjectedProps
>;
type PropsWithoutRef<P extends UsePanelsInjectedProps> = Subtract<
  Props<P>,
  { forwardedRef: React.Ref<any> }
>;

export interface PanelsManager {
  get(id: string): IPanel | undefined;
  add(panel: IPanel, callback?: () => void): void;
  remove(id: string, callback?: () => void): void;
  setType(id: string, type: PanelType, callback?: () => void): void;
  setVisible(id: string, visible: boolean, callback?: () => void): void;
  setContent(id: string, content: JSX.Element, callback?: () => void): void;
  setOnDismiss(id: string, onDismiss: () => void, callback?: () => void): void;
}

export function UsePanels<P extends UsePanelsInjectedProps>(
  Component: React.ComponentType<P>
) {
  class WithPanels extends React.Component<Props<P>, UsePanelsState> {
    constructor(props: Props<P>) {
      super(props);

      this.get = this.get.bind(this);
      this.add = this.add.bind(this);
      this.remove = this.remove.bind(this);
      this.setType = this.setType.bind(this);
      this.setVisible = this.setVisible.bind(this);
      this.setContent = this.setContent.bind(this);
      this.setOnDismiss = this.setOnDismiss.bind(this);

      this.state = {
        panels: [],
      };
    }

    get(id: string) {
      return this.state.panels.find((panel) => panel.id === id);
    }

    add(panel: IPanel, callback?: () => void) {
      const newPanels = [...this.state.panels];
      newPanels.push(panel);
      this.setState({ panels: newPanels }, callback);
    }

    remove(id: string, callback?: () => void) {
      const newPanels = this.state.panels.filter((panel) => panel.id !== id);
      this.setState({ panels: newPanels }, callback);
    }

    setType(id: string, type: PanelType, callback?: () => void) {
      const newPanels = this.state.panels.map((panel) =>
        panel.id === id ? { ...panel, type } : panel
      );
      this.setState({ panels: newPanels }, callback);
    }

    setVisible(id: string, visible: boolean, callback?: () => void) {
      const newPanels = this.state.panels.map((panel) =>
        panel.id === id ? { ...panel, visible } : panel
      );
      this.setState({ panels: newPanels }, callback);
    }

    setContent(id: string, content: JSX.Element, callback?: () => void) {
      const newPanels = this.state.panels.map((panel) =>
        panel.id === id ? { ...panel, content } : panel
      );
      this.setState({ panels: newPanels }, callback);
    }

    setOnDismiss(id: string, onDismiss: () => void, callback?: () => void) {
      const newPanels = this.state.panels.map((panel) =>
        panel.id === id ? { ...panel, onDismiss } : panel
      );
      this.setState({ panels: newPanels }, callback);
    }

    render() {
      return (
        <Component
          {...(this.props as P)}
          ref={this.props.forwardedRef}
          panels={this.state.panels}
          panelsManager={this}
        />
      );
    }
  }

  return React.forwardRef<unknown, PropsWithoutRef<P>>((props, ref) => (
    <WithPanels {...(props as Props<P>)} forwardedRef={ref} />
  ));
}
