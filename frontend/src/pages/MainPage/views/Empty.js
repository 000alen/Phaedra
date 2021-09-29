import React from 'react';
import Card from '../../../components/Card';
import NotebookPage from '../../../pages/NotebookPage';
import { createNotebook } from '../../../components/Notebook/Notebook';

const newIcon = {
    iconName: 'FileTemplate',
};

export default function Empty({appController}) {    
    const handleNew = () => {
        const id = appController.getNextTabId();
        const notebook = createNotebook(`Unnamed Notebook ${id}`);

        appController.addTab(<NotebookPage
            key={id}
            id={id}
            appController={appController}
            notebook={notebook} />
        );
    };

    return (
        <div className="flex items-center justify-center">
            <div className="flex flex-row space-x-1">
                <Card
                    iconProps={newIcon}
                    title="Create Notebook"
                    subtitle="Create a JSON Notebook"
                    onClick={handleNew} />
            </div>
        </div>
    )
}
