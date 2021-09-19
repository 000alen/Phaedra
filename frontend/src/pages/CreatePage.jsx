import React, {useState} from "react";
import { newNotebookFromPdf, openNotebook } from "../API"
import { Card } from '../components/Card'
import { LoadingPage } from "./LoadingPage"
import { NotebookPage } from "./NotebookPage";

import '../css/CreatePage.css';

const fileTypes = ["PDF", "JSON"];

export function CreatePage({id, setState}) {
    const [showLoadingPage, setShowLoadingPage] = useState(false);

    const handleFile = (file) => {
        setShowLoadingPage(true);

        const extension = file.path.split(".").at(-1).toLowerCase();
        if (extension === "pdf") {
            newNotebookFromPdf(file.path).then((notebook) => {
                console.log(id);

                setState((state) => {
                    const newTabs = state.tabs.map(tab => ({
                        ...tab,
                        notebook: tab.id === id ? notebook : tab.notebook,
                        file: tab.id === id ? file : tab.file,
                        display: tab.id === id ? <NotebookPage notebook={notebook} file={file} /> : tab.display,
                    }))

                    return { tabs: newTabs };
                });
            });
        } else {
            openNotebook(file.path).then((notebook) => {
                setState((state) => {
                    const newTabs = state.tabs.map(tab => ({
                        ...tab,
                        notebook: tab.id === id ? notebook : tab.notebook,
                        file: tab.id === id ? file : tab.file
                    }));
                    
                    return { tabs: newTabs };
                });
            });
        }
    }

    if (showLoadingPage) {
        return <LoadingPage show={showLoadingPage} />;
    } else {
        return (
            <div className="createPage">
                <Card fileTypes={fileTypes} handleFile={handleFile} />
            </div>
        );
    }
}
