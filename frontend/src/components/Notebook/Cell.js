import React from 'react';
import ReactMarkdown from 'react-markdown';

export function Cell({id, notebookController, data, content, pageId, active}) {
    const handleSelect = () => {
        notebookController.toggleSelectCell(pageId, id);
    };

    return (
        <div className={`cell p-2 m-2 rounded-sm shadow-md text-justify ${active ? "bg-blue-400 text-white" : "bg-gray-100 text-black hover:bg-gray-200"}`} onClick={handleSelect}>
            <ReactMarkdown children={content} />    
        </div>
    );
}
