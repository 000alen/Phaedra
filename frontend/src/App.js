import React, { Component } from 'react';
import TopBar from './components/TopBar';
import Tabs from './components/Tabs';
import NotebookPage from './pages/NotebookPage';
import EmptyPage from './pages/EmptyPage';
import MainPage from './pages/MainPage/MainPage';
import './css/App.css'

class App extends Component {
  constructor(props) {
    super(props);

    this.selectTab = this.selectTab.bind(this);
    this.addTab = this.addTab.bind(this);
    this.closeTab = this.closeTab.bind(this);
    this.changeTabTitle = this.changeTabTitle.bind(this);
    this.changeTabContent = this.changeTabContent.bind(this);

    const appController = {
      selectTab: this.selectTab,
      addTab: this.addTab,
      closeTab: this.closeTab,
      changeTabTitle: this.changeTabTitle,
      changeTabContent: this.changeTabContent
    }

    this.state = {
      appController: appController,
      tabs: [],
      selectedTab: null
    };
  }

  getTabIndex(id) {
    return this.state.tabs.findIndex(tab => tab.id === id);
  }

  getTabId(index) {
    return this.state.tabs[index].id;
  }

  createEmptyTab() {
    return {
      id: this.state.tabs.length + 1,
      title: `Tab ${this.state.tabs.length + 1}`,
      content: <EmptyPage 
        key={this.state.tabs.length + 1} 
        id={this.state.tabs.length + 1} 
        appController={this.state.appController} />
    }
  }

  selectTab(id) {
    this.setState({ ...this.state, selectedTab: id });
  }

  addTab() {
    const newTab = this.createEmptyTab();
    
    let newSelectedTab;
    if (!this.state.tabs.length) {
      newSelectedTab = newTab.id;
    } else {
      newSelectedTab = this.state.selectedTab;
    }

    this.setState({ ...this.state, tabs: [...this.state.tabs, newTab], selectedTab: newSelectedTab });
  }

  closeTab(id) {
    const newTabs = this.state.tabs.filter(tab => tab.id !== id);

    let newSelectedTab;
    if (this.state.selectedTab === id) {
      const index = this.getTabIndex(id);
      newSelectedTab = this.getTabId(index === 0 ? 0 : index - 1);
    } else {
      newSelectedTab = this.state.selectedTab;
    }

    if (!newTabs.length) newSelectedTab = null;

    this.setState({ ...this.state, tabs: newTabs, selectedTab: newSelectedTab })
  }

  getTabContent(id) {
    if (!id) return null;
    return this.state.tabs.find(tab => tab.id === id).content;
  }

  changeTabTitle(id, newTitle) {
    const index = this.getTabIndex(id);
    const newTabs = this.state.tabs.slice();
    newTabs[index].title = newTitle;
    this.setState({ ...this.state, tabs: newTabs });
  }

  changeTabContent(id, newContent) {
    const index = this.getTabIndex(id);
    const newTabs = this.state.tabs.slice();
    newTabs[index].content = newContent;
    this.setState({ ...this.state, tabs: newTabs });
  }

  render() {
    const { tabs, selectedTab } = this.state;

    return (
      <div className="app">
        <TopBar>
          <Tabs
            tabs={tabs}
            selectedTab={selectedTab}
            onAdd={this.addTab}
            onSelect={this.selectTab}
            onClose={this.closeTab} />
        </TopBar>
        <div className="appContent">
          {selectedTab ? this.getTabContent(selectedTab) : <MainPage appController={this.state.appController} />}
        </div>
      </div>
    );
  }
}

export default App;
