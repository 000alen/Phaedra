import React from 'react'

export function Tab({ id, appController, title, active}) {
    const handleSelect = () => {
        appController.selectTab(id);
    };

    const handleClose = () => {
        appController.closeTab(id);
    };

    return (
        <div onClick={handleSelect} className={`group tab p-0.5 ${active ? "bg-blue-400" : "bg-white hover:bg-gray-200"} rounded-sm shadow-md flex items-center space-x-2`}>
            <div className={`font-medium ${active ? "text-white" : "text-black"}`}>{title}</div>
            <img className="h-4 w-4" onClick={handleClose} src={`./assets/feather${active ? "_white" : ""}/x.svg`} />
        </div>
    );       
}
