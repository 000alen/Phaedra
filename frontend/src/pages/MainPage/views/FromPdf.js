import React from 'react';
import Card from '../../../components/Card';

const openIcon = {
    iconName: 'OpenFile',
};

const openDialogOptions = {
    properties: ['openFile'],
    filters: [
        { name: 'Notebooks', extensions: ['pdf'] }
    ]
};

export default function FromPdf() {
    const handleOpen = () => {};

    return (
        <div className="flex items-center justify-center">
            <div className="flex flex-row space-x-1">
                <Card
                    iconProps={openIcon}
                    title="Open PDF file"
                    subtitle="Create a Notebook from a PDF file"
                    onClick={handleOpen} />
            </div>
        </div>
    )
}
