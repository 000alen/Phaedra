import React from "react";
import { Subtract } from "utility-types";

export interface IWidget {
  id: string;
  element: JSX.Element;
}

interface UseWidgetsProps {
  forwardedRef: React.Ref<any>;
}

interface UseWidgetsState {
  widgets: IWidget[];
}

export interface UseWidgetsInjectedProps {
  widgets: IWidget[];
  widgetsManager: WidgetsManager;
}

export interface WidgetsManager {
  get(id: string): IWidget | undefined;
  add(widget: IWidget): void;
  remove(id: string): void;
  setElement(id: string, element: JSX.Element): void;
}

export function UseWidgets<P extends UseWidgetsInjectedProps>(
  Component: React.ComponentType<P>
) {
  class WithWidgets extends React.Component<
    Subtract<P & UseWidgetsProps, UseWidgetsInjectedProps>,
    UseWidgetsState
  > {
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
          {...(this.props as P)}
          ref={this.props.forwardedRef}
          widgets={this.state.widgets}
          widgetsManager={this}
        />
      );
    }
  }

  return React.forwardRef((props, ref) => (
    <WithWidgets {...(props as P)} forwardedRef={ref} />
  ));
}
