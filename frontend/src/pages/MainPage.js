import React, {useState} from 'react';
import { ipcRenderer } from '../index';
import {newNotebookFromPdf} from '../API';
import {NotebookPage} from './NotebookPage';
import { CardButton } from '../components/CardButton';

const openDialogOptions = {
    properties: ['openFile'],
    filters: [
        { name: 'Notebooks', extensions: ['pdf', "json"] }
    ]
};

export function MainPage({id, appController}) {
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
                newNotebookFromPdf(path, base64).then((notebook) => {
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
                notebookPath={path} />);
        });
    };

    const handleNew = () => {

    };

    return (
        <div className="page mainPage flex flex-wrap content-center justify-center space-x-4">
            <CardButton onClick={handleOpen}>
                Open
            </CardButton>

            <CardButton onClick={handleNew}>
                New
            </CardButton>
       </div>
    )
}
