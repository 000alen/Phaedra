import React from "react";
import { Subtract } from "utility-types";
import { v4 as uuidv4 } from "uuid";

import { getStrings } from "../strings";
import { EmptyTab } from "../tabs/EmptyTab";

export interface ITab {
  id: string;
  title: string;
  component: any;
  props: any;
  dirty: boolean;
}

interface UseTabsProps {
  forwardedRef: React.Ref<any>;
}

interface UseTabsState {
  tabs: ITab[];
  activeTabId: string | undefined;
}

export interface UseTabsInjectedProps {
  tabs: ITab[];
  activeTabId: string | undefined;
  tabsManager: TabsManager;
}

export interface TabsManager {
  empty(): ITab;
  get(id: string): ITab | undefined;
  activeId(): string | undefined;
  add(tab: ITab, callback?: () => void): void;
  remove(id: string, callback?: () => void): void;
  select(id: string, callback?: () => void): void;
  setTitle(id: string, title: string, callback?: () => void): void;
  setComponent(
    id: string,
    component: any,
    props: any,
    callback?: () => void
  ): void;
  setProps(id: string, props: any, callback?: () => void): void;
  setDirty(id: string, dirty: boolean, callback?: () => void): void;
}

type Props<P extends UseTabsInjectedProps> = Subtract<
  P & UseTabsProps,
  UseTabsInjectedProps
>;

type PropsWithoutRef<P extends UseTabsInjectedProps> = Subtract<
  Props<P>,
  { forwardedRef: React.Ref<any> }
>;

export function UseTabs<P extends UseTabsInjectedProps>(
  Component: React.ComponentType<P>
) {
  class WithTabs extends React.Component<Props<P>, UseTabsState> {
    constructor(props: Props<P>) {
      super(props);

      this.state = {
        tabs: [],
        activeTabId: undefined,
      };
    }

    empty(): ITab {
      return {
        id: uuidv4(),
        title: getStrings().newTabTitle,
        component: EmptyTab,
        props: {},
        dirty: false,
      };
    }

    get(id: string) {
      return this.state.tabs.find((tab) => tab.id === id);
    }

    activeId() {
      return this.state.activeTabId;
    }

    add(tab: ITab, callback?: () => void) {
      const newTabs = [...this.state.tabs];
      newTabs.push(tab);
      this.setState({ tabs: newTabs, activeTabId: tab.id }, callback);
    }

    remove(id: string, callback?: () => void) {
      const newTabs = this.state.tabs.filter((tab) => tab.id !== id);
      const activeTabIndex = this.state.tabs.findIndex(
        (tab) => tab.id === this.state.activeTabId
      );

      const newActiveTabId = newTabs.length
        ? activeTabIndex !== 0
          ? newTabs[activeTabIndex - 1].id
          : newTabs[activeTabIndex].id
        : undefined;

      this.setState(
        {
          tabs: newTabs,
          activeTabId: newActiveTabId,
        },
        callback
      );
    }

    select(id: string, callback?: () => void) {
      this.setState({ activeTabId: id }, callback);
    }

    setTitle(id: string, title: string, callback?: () => void) {
      const newTabs = this.state.tabs.map((tab) =>
        tab.id === id ? { ...tab, title } : tab
      );
      this.setState({ tabs: newTabs }, callback);
    }

    setComponent(
      id: string,
      component: any,
      props: any,
      callback?: () => void
    ) {
      const newTabs = this.state.tabs.map((tab) =>
        tab.id === id ? { ...tab, component, props } : tab
      );
      this.setState({ tabs: newTabs }, callback);
    }

    setProps(id: string, props: any, callback?: () => void) {
      const newTabs = this.state.tabs.map((tab) =>
        tab.id === id ? { ...tab, props } : tab
      );
      this.setState({ tabs: newTabs }, callback);
    }

    setDirty(id: string, dirty: boolean, callback?: () => void) {
      const newTabs = this.state.tabs.map((tab) =>
        tab.id === id ? { ...tab, dirty } : tab
      );
      this.setState({ tabs: newTabs }, callback);
    }

    render() {
      return (
        <Component
          {...(this.props as P)}
          ref={this.props.forwardedRef}
          tabs={this.state.tabs}
          activeTabId={this.state.activeTabId}
          tabsManager={this}
        />
      );
    }
  }

  return React.forwardRef<unknown, PropsWithoutRef<P>>((props, ref) => (
    <WithTabs {...(props as Props<P>)} forwardedRef={ref} />
  ));
}
