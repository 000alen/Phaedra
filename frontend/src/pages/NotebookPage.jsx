import React, {useRef} from 'react'
import { Notebook } from '../components/Notebook'
import { Question } from '../components/Question'

export function NotebookPage({notebook, file}) {
    const notebookRef = useRef(null);

    return (
        <div className="notebookPage">
            <Notebook ref={notebookRef} notebook={notebook} file={file} />
            <Question notebookRef={notebookRef} />
        </div>
    )
}
