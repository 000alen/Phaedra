import Mousetrap from "mousetrap";
import React from "react";
import { Subtract } from "utility-types";

export type IShortcuts<T> = {
  [keys: string]: (componentRef: T) => void;
};

interface UseShortcutsProps {
  forwardedRef: React.RefObject<any>;
}

interface UseShortcutsState {}

interface UseShortcutsInjectedProps {}

export function UseShortcuts<P>(
  Component: React.ComponentType<P>,
  Shortcuts: IShortcuts<React.RefObject<React.Component<P>>>
) {
  class WithShortcuts extends React.Component<
    Subtract<P, UseShortcutsInjectedProps>,
    UseShortcutsState
  > {
    componentRef: React.RefObject<React.Component<P>>;

    constructor(props: P & UseShortcutsProps) {
      super(props);

      const { forwardedRef } = props;

      this.componentRef = forwardedRef ? props.forwardedRef : React.createRef();
    }

    componentDidMount() {
      for (const [keys, action] of Object.entries(Shortcuts)) {
        Mousetrap.bind(
          keys,
          (event) => {
            action(this.componentRef);
            event.preventDefault();
          },
          "keyup"
        );
      }
    }

    componentWillUnmount() {
      for (const keys of Object.keys(Shortcuts)) {
        Mousetrap.unbind(keys);
      }
    }

    render() {
      return <Component {...(this.props as P)} ref={this.componentRef} />;
    }
  }

  return React.forwardRef((props, ref) => (
    <WithShortcuts {...(props as P)} forwardedRef={ref} />
  ));
}
