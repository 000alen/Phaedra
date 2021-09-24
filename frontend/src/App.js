import React, { Component } from 'react';
import { TopBar } from './components/TopBar';
import { Tabs } from './components/Tabs/Tabs';
import { MainPage } from './pages/MainPage';
import { EmptyPage } from './pages/EmptyPage';

import './App.css';
import './index.css';

export class App extends Component {
	constructor(props) {
		super(props);

		this.moveTab = this.moveTab.bind(this);
		this.selectTab = this.selectTab.bind(this);
		this.closeTab = this.closeTab.bind(this);
		this.addTab = this.addTab.bind(this);
		this.changeTabContent = this.changeTabContent.bind(this);
		this.changeTabTitle = this.changeTabTitle.bind(this);

		const appController = {
			moveTab: this.moveTab,
			selectTab: this.selectTab,
			closeTab: this.closeTab,
			addTab: this.addTab,
			changeTabContent: this.changeTabContent,
			changeTabTitle: this.changeTabTitle,
		};

		this.state = {
			appController: appController,
			tabs: []
		};
	}

	idToIndex(id) {
		return this.state.tabs.findIndex(tab => tab.id === id);
	}

	moveTab(initialIndex, finalIndex) {
		this.setState((state) => {
			let newTabs = [...state.tabs];
			newTabs.splice(finalIndex, 0, newTabs.splice(initialIndex, 1)[0]);
			return {...state, tabs: newTabs};
		});
	}

	selectTab(id) {
		this.setState((state) => {
			const newTabs = state.tabs.map(tab => ({
				...tab,
				active: tab.id === id
			  }));
			return {...state, tabs: newTabs};
		});
	}

	closeTab(id) {
		this.setState((state) => {
			let newTabs = state.tabs.filter((tab) => tab.id !== id);

			const index = this.idToIndex(id);			
			if (state.tabs[index].active && newTabs.length !== 0) {
				const newIndex = index === 0 ? 0 : index - 1;
				newTabs[newIndex].active = true;
			}

			return {...state, tabs: newTabs};
		});
	}

	addTab() {
		this.setState((state) => {
			let newTabs = [...state.tabs];			
			const id = newTabs.length + 1;

			let newTab = {
				id: id,
				title: `Tab ${id}`,
				active: true,
				content: <MainPage 
					key={id}
					id={id} 
					appController={this.state.appController} />,
			};
			newTabs.push(newTab);

			newTabs = newTabs.map(tab => ({
				...tab,
				active: tab.id === id
			}));

			return {...state, tabs: newTabs};
		});
	}

	changeTabContent(id, newContent) {
		this.setState((state) => {
			const newTabs = state.tabs.map(tab => ({
				...tab,
				content: tab.id === id ? newContent : tab.content
			  }));
			return {...state, tabs: newTabs};
		});
	}

	changeTabTitle(id, newTitle) {
		this.setState((state) => {
			const newTabs = state.tabs.map(tab => ({
				...tab,
				title: tab.id === id ? newTitle : tab.title
			  }));
			return {...state, tabs: newTabs};
		});
	}

	render() {
		const activeTab = this.state.tabs.filter((tab) => tab.active === true);

		return (
			<div className="app">
				<TopBar>
					<Tabs
						appController={this.state.appController}
						tabs={this.state.tabs} />	
				</TopBar>
					
				<div className="appContent">
					{activeTab.length !== 0 ? activeTab[0].content : <EmptyPage />}
				</div>
			</div>
		);
	}
}
