import React from 'react';
import Card from '../../../components/Card';

const openIcon = {
    iconName: 'OpenFile',
};

const openDialogOptions = {
    properties: ['openFile'],
    filters: [
        { name: 'Notebooks', extensions: ["json"] }
    ]
};

export default function Notebook() {
    const handleOpen = () => {};
    
    return (
        <div className="flex items-center justify-center">
            <div className="flex flex-row space-x-1">
                <Card
                    iconProps={openIcon}
                    title="Open Notebook"
                    subtitle="Open a JSON Notebook"
                    onClick={handleOpen} />
            </div>
        </div>
    )
}
