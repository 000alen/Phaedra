import React from 'react';
import { ipcRenderer } from '../index';

import '../css/ToolBar.css';

const saveDialogOptions = {
    filters: [
        { name: 'Notebooks', extensions: ["json"] }
    ]
};

export function ToolBar({notebookRef}) {
    const handleSave = () => {
        if (notebookRef.current.state.notebookPath) {
            ipcRenderer.invoke('writeFile', notebookRef.current.state.notebookPath, JSON.stringify(notebookRef.current.state.notebook), {flag: 'w+'});
        } else {
            ipcRenderer.invoke('saveDialog', saveDialogOptions).then((filePath) => {
                ipcRenderer.invoke('writeFile', filePath, JSON.stringify(notebookRef.current.state.notebook), {flag: 'w+'});
            });
        }
    };

    return (
        <div className="toolBar bg-gray-900 flex flex-row p-2 space-x-2">
            <img src="./assets/feather_white/save.svg"/>
        </div>
    )
}
