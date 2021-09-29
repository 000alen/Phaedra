import React, {useState} from 'react';
import Card from '../../../components/Card';
import { ipcRenderer } from '../../../index';
import { notebookFromPdf } from '../../../API';
import NotebookPage from '../../../pages/NotebookPage';

const openIcon = {
    iconName: 'OpenFile',
};

const openDialogOptions = {
    properties: ['openFile'],
    filters: [
        { name: 'Notebooks', extensions: ['pdf'] }
    ]
};

export default function FromPdf({appController}) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpen = () => {
        if (dialogOpen) return;
        setDialogOpen(true);

        ipcRenderer.invoke('openDialog', openDialogOptions).then((results) => {
            setDialogOpen(false);
            if (!results.canceled) {
                const path = results.filePaths[0];
                
                ipcRenderer.invoke('readFile', path).then((content) => {
                    ipcRenderer.invoke('base64encode', content).then((base64) => {
                        notebookFromPdf(path, base64).then((notebook) => {
                            const id = appController.getNextTabId();
                            appController.addTab(<NotebookPage 
                                key={id}
                                id={id}
                                appController={appController}
                                notebook={notebook} />
                            );
                        });    
                    });
                });
            }
        });
    };

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
