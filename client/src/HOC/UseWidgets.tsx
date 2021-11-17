import React from "react";

export interface IWidget {
  id: string;
  element: JSX.Element;
}

interface UseWidgetsProps {}

interface UseWidgetsState {
  widgets: IWidget[];
}

export function UseWidgets<P extends object>(
  Component: React.ComponentType<P>
) {
  return class extends React.Component<P & UseWidgetsProps, UseWidgetsState> {
    constructor(props: P & UseWidgetsProps) {
      super(props);

      this.get = this.get.bind(this);
      this.add = this.add.bind(this);
      this.remove = this.remove.bind(this);
      this.setElement = this.setElement.bind(this);

      this.state = {
        widgets: [],
      };
    }

    get(id: string) {
      return this.state.widgets.find((w) => w.id === id);
    }

    add(widget: IWidget) {
      const newWidgets = [...this.state.widgets];
      newWidgets.push(widget);
      this.setState({ widgets: newWidgets });
    }

    remove(id: string) {
      const newWidgets = this.state.widgets.filter(
        (widget) => widget.id !== id
      );
      this.setState({ widgets: newWidgets });
    }

    setElement(id: string, element: JSX.Element) {
      const newWidgets = this.state.widgets.map((widget) =>
        widget.id === id ? { ...widget, element } : widget
      );
      this.setState({ widgets: newWidgets });
    }

    render() {
      return (
        <Component
          widgets={this.state.widgets}
          widgetsManager={this}
          {...(this.props as P)}
        />
      );
    }
  };
}
