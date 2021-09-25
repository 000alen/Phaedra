import React from 'react'
import {Tab} from './Tab';

export function Tabs({appController, tabs}) {
    const handleDeselectAllTabs = () => {
        appController.deselectAllTabs();
    };

    const handleAddTab = () => {
        appController.addTab();
    };

    return (
        <div className="tabs flex flex-row items-center space-x-2">
            <img className="w-5 h-5 ml-2" src="/assets/feather_white/home.svg" onClick={handleDeselectAllTabs} />

            {tabs.map((tab) => 
                <Tab 
                    key={tab.id} 
                    id={tab.id} 
                    appController={appController}
                    title={tab.title}
                    active={tab.active} />
            )}
            <img className="w-4 h-4 ml-2 rounded-full hover:bg-gray-800" onClick={handleAddTab} src="./assets/feather_white/plus.svg" />
        </div>
    )
}