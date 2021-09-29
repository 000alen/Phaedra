import React, { useState } from 'react';
import Card from '../../../components/Card';
import NotebookPage from '../../NotebookPage';
import { openPdf } from '../../../NotebookFS';

const openIcon = {
    iconName: 'OpenFile',
};

export default function FromPdfView({ appController }) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpen = () => {
        if (dialogOpen) return;
        setDialogOpen(true);

        openPdf().then((notebook) => {
            setDialogOpen(false);
            if (!notebook) return;

            const id = appController.getNextTabId();
            appController.addTab(<NotebookPage
                key={id}
                id={id}
                appController={appController}
                notebook={notebook} />
            );
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
