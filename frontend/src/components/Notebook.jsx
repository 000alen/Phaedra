import React from 'react';
import { Page } from './Page';
import { addQuestionCell } from '../API';

import "../css/Notebook.css";
import { times } from 'lodash-es';

export class Notebook extends React.Component {
    constructor(props) {
        super();

        this.addQuestionCell = this.addQuestionCell.bind(this);

        const {file, notebook} = props;

        this.state = {
            file: file,
            notebook: notebook
        };
    }

    addQuestionCell(question, page_index) {
        addQuestionCell(this.state.notebook, page_index, question).then((notebook) => {
            this.setState((state) => {
                return {
                    file: state.file,
                    notebook: notebook
                };
            });
        });
    }

    render() {
        const { notebook, file } = this.state;

        return (
            <div className="notebook">
                {notebook.pages.map(page => {
                    return <Page
                        key={page.id}
                        file={file}
                        number={page.data.number}
                        cells={page.cells} />;
                })}
            </div>
        );
    }
}
