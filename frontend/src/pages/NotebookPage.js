import React, { Component } from 'react';
import {ToolBar} from '../components/ToolBar';
import {Notebook} from '../components/Notebook/Notebook';
import { QuestionBox } from '../components/QuestionBox';

export class NotebookPage extends Component {
    constructor(props) {
        super(props);

        this.showQuestionBox = this.showQuestionBox.bind(this);
        this.hideQuestionBox = this.hideQuestionBox.bind(this);

        const {id, appController, notebook, notebookPath} = props;

        appController.changeTabTitle(id, notebook.name);

        const pageController = {
            showQuestionBox: this.showQuestionBox,
            hideQuestionBox: this.hideQuestionBox
        };

        this.notebookRef = React.createRef();
    
        this.state = {
            id: id,
            appController: appController,
            pageController: pageController,
            notebook: notebook,
            notebookPath: notebookPath,
            showQuestionBox: false
        };
    }

    showQuestionBox() {
        this.setState((state) => {
            return {
                ...state,
                showQuestionBox: true
            };
        });
    }
    
    hideQuestionBox() {
        this.setState((state) => {
            return {
                ...state,
                showQuestionBox: false
            };
        });
    }

    render() {
        return (
            <div className="page notebookPage">
                <ToolBar  notebookRef={this.notebookRef} pageController={this.state.pageController} />
                <Notebook key={this.state.id} ref={this.notebookRef} pageController={this.state.pageController} tabId={this.state.id} appController={this.state.appController} notebook={this.state.notebook} notebookPath={this.state.notebookPath} />
                {this.state.showQuestionBox && <QuestionBox notebookRef={this.notebookRef} />}
            </div>
        )
    }
}
