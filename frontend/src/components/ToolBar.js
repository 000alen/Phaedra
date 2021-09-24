import React from 'react';

import '../css/ToolBar.css';

export function ToolBar({notebookRef}) {
    return (
        <div className="toolBar bg-gray-900 flex flex-row">
            <button className="p-2 m-2 bg-white rounded-sm shadow-md">Save</button>
            <button className="p-2 m-2 bg-white rounded-sm shadow-md">Save as</button>
            <button className="p-2 m-2 bg-white rounded-sm shadow-md">Open</button>
            <button className="p-2 m-2 bg-white rounded-sm shadow-md">Close</button>
        </div>
    )
}
