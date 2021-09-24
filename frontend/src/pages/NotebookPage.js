import React, { Component } from 'react';
import {ToolBar} from '../components/ToolBar';
import {Notebook} from '../components/Notebook/Notebook';
import { QuestionBox } from '../components/QuestionBox';

export class NotebookPage extends Component {
    constructor(props) {
        super(props);

        const {id, appController, notebook, path} = props;

        appController.changeTabTitle(id, notebook.name);

        this.notebookRef = React.createRef();

        this.state = {
            id: id,
            appController: appController,
            notebook: notebook,
            path: path
        };
    }
    
    render() {
        return (
            <div className="page notebookPage">
                <ToolBar  notebookRef={this.notebookRef} />
                <Notebook key={this.id} ref={this.notebookRef} tabId={this.state.id} appController={this.state.appController} notebook={this.state.notebook} path={this.state.path} />
                <QuestionBox notebookRef={this.notebookRef} />
            </div>
        )
    }
}
