import React, { Component } from 'react';
import Ribbon from '../components/Ribbon';
import Notebook from '../components/Notebook/Notebook';
import QuestionBox from '../components/QuestionBox';

class NotebookPage extends Component {
    constructor(props) {
        super(props);

        this.showQuestionBox = this.showQuestionBox.bind(this);
        this.hideQuestionBox = this.hideQuestionBox.bind(this);

        const {id, appController, notebook, notebookPath} = props;

        appController.changeTabTitle(id, notebook.name);

        const pageController = {
            showQuestionBox: this.showQuestionBox,
            hideQuestionBox: this.hideQuestionBox
        }

        this.notebookRef = React.createRef();

        this.state = {
            id: id,
            appController: appController,
            pageController: pageController,
            notebook: notebook,
            notebookPath: notebookPath,
            questionBoxShown: false
        };
    }

    showQuestionBox() {
        this.setState({
            ...this.state,
            questionBoxShown: true
        });
    }

    hideQuestionBox() {
        this.setState({
            ...this.state,
            questionBoxShown: false
        });
    }

    render() {
        return (
            <div>
                <Ribbon />

                <Notebook 
                    key={this.state.id}
                    ref={this.notebookRef}
                    appController={this.state.appController}
                    pageController={this.state.pageController}
                    tabId={this.state.id} 
                    notebook={this.state.notebook}
                    notebookPath={this.state.notebookPath} />

                {this.state.questionBoxShown && <QuestionBox 
                    notebookRef={this.state.notebookRef} />}
            </div>
        )
    }
}

export default NotebookPage;
