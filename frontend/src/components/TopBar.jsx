import React, { useRef } from 'react';

import '../css/TopBar.css';

const ipcRenderer = window.require("electron").ipcRenderer;

export function TopBar({ children }) {
    const maxResBtnRef = useRef(null);

    const changeMaxResBtn = (isMaximizedApp) => {
        if (isMaximizedApp) {
            maxResBtnRef.title = 'Restore'
            maxResBtnRef.classList.remove('maximizeBtn')
            maxResBtnRef.classList.add('restoreBtn')
        } else {
            maxResBtnRef.title = 'Maximize'
            maxResBtnRef.classList.remove('restoreBtn')
            maxResBtnRef.classList.add('maximizeBtn')
        }
    }

    const handleMinimize = () => {
        ipcRenderer.send('minimizeApp')
    };

    const handleMaxRes = () => {
        ipcRenderer.send('maximizeRestoreApp')
    };

    const handleClose = () => {
        ipcRenderer.send('closeApp');
    };

    ipcRenderer.on('isMaximized', () => {
        changeMaxResBtn(true)
    });

    ipcRenderer.on('isRestored', () => {
        changeMaxResBtn(false)
    });

    return (
        <div className="topBar">
            <div className="titleBar">
                <div className="title">
                    Phaedra
                </div>
            </div>

            <div className="topBarChildren">
                {children}
            </div>

            <div className="titleBarBtns">
                <button id="minimizeBtn" className="topBtn minimizeBtn" onClick={handleMinimize}></button>
                <button ref={maxResBtnRef} id="maxResBtn" className="topBtn maximizeBtn" onClick={handleMaxRes}></button>
                <button id="closeBtn" className="topBtn closeBtn" onClick={handleClose}></button>
            </div>
        </div>
    )
}
