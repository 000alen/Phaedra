import React, { Component } from 'react';
import Ribbon from '../components/Ribbon';
import Notebook from '../components/Notebook/Notebook';
import '../css/NotebookPage.css';

class NotebookPage extends Component {
    constructor(props) {
        super(props);

        const {id, appController, notebook } = props;

        appController.changeTabTitle(id, notebook.name);

        this.notebookRef = React.createRef();

        this.state = {
            id: id,
            appController: appController,
        };
    }

    render() {
        return (
            <div>
                <div className="ribbonDiv">
                    <Ribbon notebookRef={this.notebookRef} />
                </div>
   
                <div className="notebookPageContent">
                    <Notebook 
                        key={this.state.id}
                        ref={this.notebookRef}
                        appController={this.state.appController}
                        tabId={this.state.id} 
                        notebook={this.props.notebook}
                        notebookPath={this.props.notebookPath} />
                </div>
           </div>
        )
    }
}

export default NotebookPage;
