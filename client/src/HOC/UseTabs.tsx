import React from "react";
import { Subtract } from "utility-types";
import { v4 as uuidv4 } from "uuid";

import { getStrings } from "../resources/strings";
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
  tabsManager: any;
}

export function UseTabs<P extends UseTabsInjectedProps>(
  Component: React.ComponentType<P>
) {
  class WithTabs extends React.Component<
    Subtract<P & UseTabsProps, UseTabsInjectedProps>,
    UseTabsState
  > {
    constructor(props: P & UseTabsProps) {
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

    add(tab: ITab) {
      const newTabs = [...this.state.tabs];
      newTabs.push(tab);
      this.setState({ tabs: newTabs, activeTabId: tab.id });
    }

    remove(id: string) {
      const newTabs = this.state.tabs.filter((tab) => tab.id !== id);
      const activeTabIndex = this.state.tabs.findIndex(
        (tab) => tab.id === this.state.activeTabId
      );

      const newActiveTabId = newTabs.length
        ? activeTabIndex !== 0
          ? newTabs[activeTabIndex - 1].id
          : newTabs[activeTabIndex].id
        : undefined;

      this.setState({
        tabs: newTabs,
        activeTabId: newActiveTabId,
      });
    }

    select(id: string) {
      this.setState({ activeTabId: id });
    }

    setTitle(id: string, title: string) {
      const newTabs = this.state.tabs.map((tab) =>
        tab.id === id ? { ...tab, title } : tab
      );
      this.setState({ tabs: newTabs });
    }

    setComponent(id: string, component: any, props: any) {
      const newTabs = this.state.tabs.map((tab) =>
        tab.id === id ? { ...tab, component, props } : tab
      );
      this.setState({ tabs: newTabs });
    }

    setProps(id: string, props: any) {
      const newTabs = this.state.tabs.map((tab) =>
        tab.id === id ? { ...tab, props } : tab
      );
      this.setState({ tabs: newTabs });
    }

    setDirty(id: string, dirty: boolean) {
      const newTabs = this.state.tabs.map((tab) =>
        tab.id === id ? { ...tab, dirty } : tab
      );
      this.setState({ tabs: newTabs });
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

  return React.forwardRef((props, ref) => (
    <WithTabs {...(props as P)} forwardedRef={ref} />
  ));
}
