import React from 'react';
import Card from '../../../components/Card';

const openIcon = {
    iconName: 'OpenFile',
};

const openDialogOptions = {
    properties: ['openFile'],
    filters: [
        { name: 'Notebooks', extensions: ["txt"] }
    ]
};

export default function FromText() {
    const handleOpen = () => {};

    return (
        <div className="flex items-center justify-center">
            <div className="flex flex-row space-x-1">
                <Card
                    iconProps={openIcon}
                    title="Open text file"
                    subtitle="Create a Notebook from a text file"
                    onClick={handleOpen} />
            </div>
        </div>
    )
}
