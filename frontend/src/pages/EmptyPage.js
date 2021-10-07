import React, { useState } from 'react';
import Card from '../components/Card';
import NotebookPage from './NotebookPage';
import { openFile } from '../NotebookFS';
import { createNotebook } from '../components/Notebook/Notebook';
import '../css/EmptyPage.css';

const openIcon = {
    iconName: 'OpenFile',
};

const newIcon = {
    iconName: 'FileTemplate',
};

function EmptyPage({ id, appController, statusBarRef }) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpen = () => {
        const { statusBarController } = statusBarRef.current.state;

        if (dialogOpen) return;

        statusBarController.showLoading();
        setDialogOpen(true);

        openFile().then(({notebook, notebookPath}) => {
            statusBarController.hideLoading();
            setDialogOpen(false);

            if (!notebook) return;
            
            appController.setTabContent(id, <NotebookPage
                key={id}
                id={id}
                appController={appController}
                notebook={notebook}
                notebookPath={notebookPath} />
            );
        });
    };

    const handleNew = () => {
        const notebook = createNotebook({name: `Unnamed Notebook ${id}`});

        appController.setTabContent(id, <NotebookPage
            key={id}
            id={id}
            appController={appController}
            notebook={notebook} />
        );
    };

    return (
        <div className="emptyPage flex items-center justify-center">
            <div className="flex flex-row space-x-1">
                <Card
                    iconProps={openIcon}
                    title="Open file"
                    subtitle="Open a PDF document or a JSON notebook"
                    onClick={handleOpen} />

                <Card
                    iconProps={newIcon}
                    title="Create new file"
                    subtitle="Create a JSON notebook"
                    onClick={handleNew} />

            </div>
        </div>
    );
}

export default EmptyPage;
