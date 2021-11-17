import React from "react";

import { PanelType } from "@fluentui/react";

export interface IPanel {
  id: string;
  type: PanelType;
  visible: boolean;
  content: JSX.Element;
  onDismiss?: () => void;
}

interface UsePanelsProps {}

interface UsePanelsState {
  panels: IPanel[];
}

export function UsePanels<P>(Component: React.ComponentType<P>) {
  return class extends React.Component<P & UsePanelsProps, UsePanelsState> {
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
          panels={this.state.panels}
          panelsManager={this}
          {...(this.props as P)}
        />
      );
    }
  };
}
