import React, { Component } from 'react';
import {ToolBar} from '../components/ToolBar';
import {Notebook} from '../components/Notebook/Notebook';
import { QuestionBox } from '../components/QuestionBox';

export class NotebookPage extends Component {
    constructor(props) {
        super(props);

        const {id, appController, notebook, notebookPath} = props;

        appController.changeTabTitle(id, notebook.name);

        this.notebookRef = React.createRef();

        this.state = {
            id: id,
            appController: appController,
            notebook: notebook,
            notebookPath: notebookPath
        };
    }
    
    render() {
        return (
            <div className="page notebookPage">
                <ToolBar  notebookRef={this.notebookRef} />
                <Notebook key={this.state.id} ref={this.notebookRef} tabId={this.state.id} appController={this.state.appController} notebook={this.state.notebook} notebookPath={this.state.notebookPath} />
                <QuestionBox notebookRef={this.notebookRef} />
            </div>
        )
    }
}
