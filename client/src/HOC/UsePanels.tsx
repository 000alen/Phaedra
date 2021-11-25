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

export interface PanelsManager {
  get(id: string): IPanel | undefined;
  add(panel: IPanel): void;
  remove(id: string): void;
  setType(id: string, type: PanelType): void;
  setVisible(id: string, visible: boolean): void;
  setContent(id: string, content: JSX.Element): void;
  setOnDismiss(id: string, onDismiss: () => void): void;
}

export function UsePanels<P extends UsePanelsInjectedProps>(
  Component: React.ComponentType<P>
) {
  class WithPanels extends React.Component<
    Subtract<P & UsePanelsProps, UsePanelsInjectedProps>,
    UsePanelsState
  > {
    constructor(props: P & UsePanelsProps) {
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

    add(panel: IPanel) {
      const newPanels = [...this.state.panels];
      newPanels.push(panel);
      this.setState({ panels: newPanels });
    }

    remove(id: string) {
      const newPanels = this.state.panels.filter((panel) => panel.id !== id);
      this.setState({ panels: newPanels });
    }

    setType(id: string, type: PanelType) {
      const newPanels = this.state.panels.map((panel) =>
        panel.id === id ? { ...panel, type } : panel
      );
      this.setState({ panels: newPanels });
    }

    setVisible(id: string, visible: boolean) {
      const newPanels = this.state.panels.map((panel) =>
        panel.id === id ? { ...panel, visible } : panel
      );
      this.setState({ panels: newPanels });
    }

    setContent(id: string, content: JSX.Element) {
      const newPanels = this.state.panels.map((panel) =>
        panel.id === id ? { ...panel, content } : panel
      );
      this.setState({ panels: newPanels });
    }

    setOnDismiss(id: string, onDismiss: () => void) {
      const newPanels = this.state.panels.map((panel) =>
        panel.id === id ? { ...panel, onDismiss } : panel
      );
      this.setState({ panels: newPanels });
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

  return React.forwardRef((props, ref) => (
    <WithPanels {...(props as P)} forwardedRef={ref} />
  ));
}
