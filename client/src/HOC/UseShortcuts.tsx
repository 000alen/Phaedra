import Mousetrap from "mousetrap";
import React from "react";
import { Subtract } from "utility-types";

export interface IShortcut<T> {
  keys: string;
  description: string;
  action: (componentRef: React.RefObject<T>) => void;
}

interface UseShortcutsProps {
  forwardedRef: React.RefObject<any>;
}

interface UseShortcutsState {}

interface UseShortcutsInjectedProps {}

type Props<P extends UseShortcutsInjectedProps> = Subtract<
  P & UseShortcutsProps,
  UseShortcutsInjectedProps
>;

type PropsWithoutRef<P extends UseShortcutsInjectedProps> = Subtract<
  Props<P>,
  { forwardedRef: React.RefObject<any> }
>;

export function UseShortcuts<P>(
  Component: React.ComponentType<P>,
  Shortcuts: IShortcut<any>[]
) {
  class WithShortcuts extends React.Component<Props<P>, UseShortcutsState> {
    componentRef: React.RefObject<React.Component<P>>;

    constructor(props: Props<P>) {
      super(props);

      const { forwardedRef } = props;

      this.componentRef = forwardedRef ? props.forwardedRef : React.createRef();
    }

    componentDidMount() {
      for (const { keys, action } of Shortcuts) {
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

  return React.forwardRef<unknown, PropsWithoutRef<P>>((props, ref) => (
    <WithShortcuts {...(props as Props<P>)} forwardedRef={ref} />
  ));
}
