import React, { useState } from 'react';
import Card from '../../../components/Card';
import NotebookPage from '../../../pages/NotebookPage';
import { openJson } from '../../../NotebookFS';

const openIcon = {
    iconName: 'OpenFile',
};

export default function NotebookView({ appController, statusBarRef }) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpen = () => {
        if (dialogOpen) return;
        setDialogOpen(true);

        openJson().then(({notebook, notebookPath}) => {
            setDialogOpen(false);
            if (!notebook) return;

            const id = appController.getNextTabId();
            appController.addTab(<NotebookPage
                key={id}
                id={id}
                appController={appController}
                statusBarRef={statusBarRef}
                notebook={notebook}
                notebookPath={notebookPath} />
            );

        });
    };

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
