import React, { Component } from 'react';
import Tabs from 'react-draggable-tabs';
import {TopBar} from './components/TopBar';
import {CreatePage} from './pages/CreatePage';

import './css/App.css';
import './css/Tabs.css';

export class App extends Component {
  constructor(props) {
    super(props);

    this.setState = this.setState.bind(this);

    this.moveTab = this.moveTab.bind(this);
    this.selectTab = this.selectTab.bind(this);
    this.closedTab = this.closedTab.bind(this);
    this.addTab = this.addTab.bind(this);
    
    this.state = {
      tabs: [
        {
          id: "1",
          content: "New Tab",
          display: <CreatePage setState={this.setState} id="1" key="1" />,
          active: true,
          notebook: null,          
          file: null,
        }
      ]
    };
  }

  moveTab(dragIndex, hoverIndex) {
    this.setState((state, props) => {
      let newTabs = [...state.tabs]
      newTabs.splice(hoverIndex, 0, newTabs.splice(dragIndex, 1)[0]);
      return { tabs: newTabs };
    });
  }

  selectTab(selectedIndex, selectedID) {
    this.setState((state, props) => {
      const newTabs = state.tabs.map(tab => ({
        ...tab,
        active: tab.id === selectedID
      }));        

      return { tabs: newTabs };
    });
  }

  closedTab(removedIndex, removedID) {
    this.setState((state, props) => {
      let newTabs = [...state.tabs];

      newTabs.splice(removedIndex, 1);

      if (state.tabs[removedIndex].active && newTabs.length !== 0) {
        const newActive = removedIndex === 0 ? 0 : removedIndex - 1;
        newTabs[newActive].active = true;
      }

      return { tabs: newTabs };
    });
  }

  addTab() {
    this.setState((state, props) => {
      let newTabs = [...state.tabs];
      newTabs.push({
        id: newTabs.length + 1,
        content: "New Tab",
        display: <CreatePage setState={this.setState} id={newTabs.length + 1} key={newTabs.length + 1} />,
        active: false,
        notebook: null,
        file: null,
      });

      return { tabs: newTabs };
    });
  }
  
  render() {
    const activeTab = this.state.tabs.filter(tab => tab.active === true);

    return (
      <div className="appContainer">
        <TopBar>
          <Tabs
            moveTab={this.moveTab}
            selectTab={this.selectTab}
            closeTab={this.closedTab}
            tabs={this.state.tabs}
          >
            <button className="tabAddButton" onClick={this.addTab}>+</button>
          </Tabs>
        </TopBar>

        <div className="pageContainer">
          {activeTab.length !== 0 ? activeTab[0].display : <div className="empty" />}
        </div>
      </div>
    );
  }
}
