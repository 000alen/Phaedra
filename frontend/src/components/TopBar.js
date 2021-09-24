import React from 'react'
import { ipcRenderer } from '../index';

import '../css/TopBar.css';

export function TopBar({children}) {
    const handleMinimizeButtonClick = () => {
        ipcRenderer.send('minimizeApp');
    };

    const handleMaximizeRestoreButtonClick = () => {
        ipcRenderer.send('maximizeRestoreApp');
    };
    
    const handleCloseButtonClick = () => {
        ipcRenderer.send('closeApp');
    };

    return (
        <div className="topBar bg-gray-900">
            <div className="titleBar">
                <div className="titleBarChildren">
                    {children}
                </div>
            </div>
            <div className="titleBarButtons">
                <button className="topButton minimizeButton hover:bg-gray-800 active:bg-blue-400" onClick={handleMinimizeButtonClick} id="minimizeButton" title="Minimize"></button>
                <button className="topButton maximizeButton hover:bg-gray-800 active:bg-blue-400" onClick={handleMaximizeRestoreButtonClick} id="maximizeRestoreButton"  title="Maximize"></button>
                <button className="topButton closeButton hover:bg-gray-800 active:bg-blue-400" onClick={handleCloseButtonClick} id="closeButton" title="Close"></button>
            </div>
        </div>
    )
}
