import React from 'react';
import ReactMarkdown from 'react-markdown';
import { theme } from '../../index';

function Cell({ id, notebookController, data, content, pageId, active }) {
    const handleSelect = () => {
        notebookController.toggleSelectCell(pageId, id);
    };

    const style = {backgroundColor: theme.palette.neutralLight}
    const activeStyle = {backgroundColor: theme.palette.themePrimary, color: theme.palette.white }

    return (
        <div className="cell p-2 m-2 rounded-sm shadow-md text-justify" style={active ? activeStyle : style} onClick={handleSelect}>
            <ReactMarkdown children={content} />
        </div>
    );
}

export default Cell;
