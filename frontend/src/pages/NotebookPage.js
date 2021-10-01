import React, { Component } from 'react';
import Ribbon from '../components/Ribbon/Ribbon';
import Notebook from '../components/Notebook/Notebook';
import CommandBox from '../components/CommandBox';
import '../css/NotebookPage.css';

class NotebookPage extends Component {
    constructor(props) {
        super(props);

        this.showCommandBox = this.showCommandBox.bind(this);
        this.hideCommandBox = this.hideCommandBox.bind(this);

        const { id, appController, notebook } = props;

        appController.setTabTitle(id, notebook.name);

        this.notebookRef = React.createRef();
        this.commandBoxRef = React.createRef();

        const pageController = {
            showCommandBox: this.showCommandBox,
            hideCommandBox: this.hideCommandBox
        }

        this.state = {
            id: id,
            appController: appController,
            pageController: pageController,
            commandBoxShown: false,
        };
    }

    showCommandBox() {
        this.setState((state) => {
            return { ...state, commandBoxShown: true }
        });
    }

    hideCommandBox() {
        this.setState((state) => {
            return { ...state, commandBoxShown: false }
        });
    }

    render() {
        return (
            <div className="notebookPage">
                <Ribbon 
                    notebookRef={this.notebookRef} 
                    commandBoxRef={this.commandBoxRef} 
                    appController={this.state.appController}
                    pageController={this.state.pageController} />

                <div className="notebookPageContent">
                    <Notebook
                        key={this.state.id}
                        ref={this.notebookRef}
                        appController={this.state.appController}
                        pageController={this.state.pageController}
                        tabId={this.state.id}
                        notebook={this.props.notebook}
                        notebookPath={this.props.notebookPath} />

                    {this.state.commandBoxShown && <CommandBox 
                        ref={this.commandBoxRef} 
                        notebookRef={this.notebookRef} />}
                </div>
            </div>
        )
    }
}

export default NotebookPage;
