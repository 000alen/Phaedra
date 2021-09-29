import React, {useState} from 'react';
import Card from '../../../components/Card';
import { ipcRenderer } from '../../../index';
import NotebookPage from '../../../pages/NotebookPage';

const openIcon = {
    iconName: 'OpenFile',
};

const openDialogOptions = {
    properties: ['openFile'],
    filters: [
        { name: 'Notebooks', extensions: ["json"] }
    ]
};

export default function Notebook({appController}) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpen = () => {
        if (dialogOpen) return;
        setDialogOpen(true);

        ipcRenderer.invoke('openDialog', openDialogOptions).then((results) => {
            setDialogOpen(false);
            if (!results.canceled) {
                const path = results.filePaths[0];
                
                ipcRenderer.invoke('readFile', path, 'utf-8').then((notebook) => {
                    const id = appController.getNextTabId();
                    appController.addTab(<NotebookPage
                        key={id} 
                        id={id}
                        appController={appController}
                        notebook={JSON.parse(notebook)} />
                    );
                });
            }
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
