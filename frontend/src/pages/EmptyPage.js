import React, {useState} from 'react';
import Card from '../components/Card';
import {ipcRenderer} from '../index';
import {notebookFromPdf} from '../API';
import NotebookPage from './NotebookPage';
import { createNotebook } from '../components/Notebook/Notebook';

const openIcon = {
    iconName: 'OpenFile',
};

const newIcon = {
    iconName: 'FileTemplate',
};

const openDialogOptions = {
    properties: ['openFile'],
    filters: [
        { name: 'Notebooks', extensions: ['pdf', "json"] }
    ]
};

function EmptyPage({id, appController}) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpen = () => {
        if (dialogOpen) return;
        setDialogOpen(true);

        ipcRenderer.invoke('openDialog', openDialogOptions).then((results) => {
            setDialogOpen(false);
            if (!results.canceled) {
                const path = results.filePaths[0];
                const extension = path.split('.').pop().toLowerCase();

                if (extension === 'pdf') {
                    handleOpenPdf(path);
                } else if (extension === 'json') {
                    handleOpenJson(path);
                }
            }
        });
    };

    const handleOpenPdf = (path) => {
        ipcRenderer.invoke('readFile', path).then((content) => {
            ipcRenderer.invoke('base64encode', content).then((base64) => {
                notebookFromPdf(path, base64).then((notebook) => {
                    appController.changeTabContent(id, <NotebookPage 
                        key={id}
                        id={id}
                        appController={appController}
                        notebook={notebook} />
                    );
                });    
            });
        });
    };

    const handleOpenJson = (path) => {
        ipcRenderer.invoke('readFile', path, "utf-8").then((content) => {
            const notebook = JSON.parse(content);
            appController.changeTabContent(id, <NotebookPage 
                key={id}
                id={id} 
                appController={appController}
                notebook={notebook}
                notebookPath={path} />
            );
        });
    };

    const handleNew = () => {
        const notebook = createNotebook(`Unnamed Notebook ${id}`);

        appController.changeTabContent(id, <NotebookPage
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
