import React, {useState} from 'react';
import Card from '../../../components/Card';
import { ipcRenderer } from '../../../index';
import { notebookFromText } from '../../../API';
import NotebookPage from '../../../pages/NotebookPage';

const openIcon = {
    iconName: 'OpenFile',
};

const openDialogOptions = {
    properties: ['openFile'],
    filters: [
        { name: 'Notebooks', extensions: ["txt"] }
    ]
};

export default function FromText({appController}) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpen = () => {
        if (dialogOpen) return;
        setDialogOpen(true);

        ipcRenderer.invoke('openDialog', openDialogOptions).then((results) => {
            setDialogOpen(false);
            if (!results.canceled) {
                const path = results.filePaths[0];
                ipcRenderer.invoke('readFile', path, 'utf-8').then((text) => {
                    notebookFromText(text).then((notebook) => {
                        const id = appController.getNextTabId();
                        appController.addTab(<NotebookPage 
                            key={id}
                            id={id}
                            appController={appController}
                            notebook={notebook} />
                        );
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
                    title="Open text file"
                    subtitle="Create a Notebook from a text file"
                    onClick={handleOpen} />
            </div>
        </div>
    )
}
