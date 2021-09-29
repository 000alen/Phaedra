import { notebookFromPdf, notebookFromText } from './API';
import { openDialog, readFile, base64encode } from './ElectronAPI';

export function openPdf() {
    const openDialogOptions = {
        properties: ['openFile'],
        filters: [
            { name: 'Notebooks', extensions: ['pdf'] }
        ]
    };
    
    return new Promise((resolve, reject) => {
        openDialog(openDialogOptions).then((results) => {
            if (!results.canceled) {
                const path = results.filePaths[0];
    
                readFile(path).then((content) => {
                    base64encode(content).then((base64) => {
                        notebookFromPdf(path, base64).then((notebook) => {
                            resolve(notebook);
                        });
                    });
                });
            }
        });
    });
}

export function openJson() {
    const openDialogOptions = {
        properties: ['openFile'],
        filters: [
            { name: 'Notebooks', extensions: ["json"] }
        ]
    };
    
    return new Promise((resolve, reject) => {
        openDialog(openDialogOptions).then((results) => {
            if (!results.canceled) {
                const path = results.filePaths[0];
    
                readFile(path, 'utf-8').then((notebook) => {
                    resolve(JSON.parse(notebook))
                });
            }
        });
    
    });    
}

export function openText() {
    const openDialogOptions = {
        properties: ['openFile'],
        filters: [
            { name: 'Notebooks', extensions: ["txt"] }
        ]
    };    

    return new Promise((resolve, reject) => {
        openDialog(openDialogOptions).then((results) => {
            if (!results.canceled) {
                const path = results.filePaths[0];
                readFile(path, 'utf-8').then((text) => {
                    notebookFromText(text).then((notebook) => {
                        resolve(notebook);
                    });
                });
            }
        });    
    
    });
}

export function openFile() {
    const openDialogOptions = {
        properties: ['openFile'],
        filters: [
            { name: 'Notebooks', extensions: ['pdf', "json", "txt"] }
        ]
    };

    const handleOpenPdf = (path) => {
        return new Promise((resolve, reject) => {
            readFile(path).then((content) => {
                base64encode(content).then((base64) => {
                    notebookFromPdf(path, base64).then((notebook) => {
                        resolve(notebook);
                    });
                });
            });    
        });
   };

    const handleOpenJson = (path) => {
        return new Promise((resolve, reject) => {
            readFile(path, "utf-8").then((content) => {
                resolve(JSON.parse(content));
            });
    
        });
    };
    
    const handleOpenText = (path) => {
        return new Promise((resolve, reject) => {
            readFile(path, "utf-8").then((text) => {
                notebookFromText(text).then((notebook) => {
                    resolve(notebook);
                });
            });    
        });
    };

    return new Promise((resolve, reject) => {
        openDialog(openDialogOptions).then((results) => {
            if (!results.canceled) {
                const path = results.filePaths[0];
                const extension = path.split('.').pop().toLowerCase();
    
                let handler;
                if (extension === 'pdf') {
                    handler = handleOpenPdf(path);
                } else if (extension === 'json') {
                    handler = handleOpenJson(path);
                } else {
                    handler = handleOpenText(path);
                }

                handler.then((notebook) => {
                    resolve(notebook);
                });   
            }
        });    
    });
}
