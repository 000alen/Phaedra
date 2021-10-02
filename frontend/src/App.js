import React, { Component } from 'react';
import TopBar from './components/TopBar';
import Tabs from './components/Tabs';
import EmptyPage from './pages/EmptyPage';
import MainPage from './pages/MainPage/MainPage';
import { v4 as uuidv4 } from 'uuid';
import './css/App.css'
import StatusBar from './components/StatusBar';

class App extends Component {
    constructor(props) {
        super(props);

        this.getNextTabId = this.getNextTabId.bind(this);
        this.selectTab = this.selectTab.bind(this);
        this.addTab = this.addTab.bind(this);
        this.closeTab = this.closeTab.bind(this);
        this.setTabTitle = this.setTabTitle.bind(this);
        this.setTabContent = this.setTabContent.bind(this);

        this.getClipboard = this.getClipboard.bind(this);
        this.setClipboard = this.setClipboard.bind(this);

        this.statusBarRef = React.createRef();

        const appController = {
            getNextTabId: this.getNextTabId,
            selectTab: this.selectTab,
            addTab: this.addTab,
            closeTab: this.closeTab,
            setTabTitle: this.setTabTitle,
            setTabContent: this.setTabContent,
            getClipboard: this.getClipboard,
            setClipboard: this.setClipboard
        }

        this.state = {
            appController: appController,
            tabs: [],
            selectedTab: null,
            clipboard: null
        };
    }

    getNextTabId() {
        return this.state.tabs.length + 1;
    }

    getTabIndex(id) {
        return this.state.tabs.findIndex(tab => tab.id === id);
    }

    getTabId(index) {
        return this.state.tabs[index].id;
    }

    createEmptyTab() {
        const id = uuidv4();

        return {
            id: id,
            title: `New Tab`,
            content: <EmptyPage
                key={id}
                id={id}
                appController={this.state.appController} />
        }
    }

    selectTab(id) {
        this.setState({ ...this.state, selectedTab: id });
    }

    addTab(content) {
        let newTab;
        if (!content) {
            newTab = this.createEmptyTab();
        } else {
            const id = content.props.id;
            newTab = {
                id: id,
                title: `Tab ${id}`,
                content: content
            }
        }

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

            if (newTabs.length === 0) {
                newSelectedTab = null
            } else {
                newSelectedTab = newTabs[index === 0 ? 0 : index - 1].id
            };
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

    setTabTitle(id, newTitle) {
        const index = this.getTabIndex(id);
        let newTabs = [...this.state.tabs];
        newTabs[index].title = newTitle;
        this.setState({ ...this.state, tabs: newTabs });
    }

    setTabContent(id, newContent) {
        const index = this.getTabIndex(id);
        let newTabs = [...this.state.tabs];
        newTabs[index].content = newContent;
        this.setState({ ...this.state, tabs: newTabs });
    }

    getClipboard() {
        return this.state.clipboard;
    }

    setClipboard(content) {
        this.setState((state) => {
            return {
                ...state, 
                clipboard: content
            };
        });
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

                <StatusBar 
                    ref={this.statusBarRef} />
            </div>
        );
    }
}

export default App;
