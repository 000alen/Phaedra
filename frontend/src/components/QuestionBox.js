import React, { Component } from 'react';
import {initializeIcons, Icon} from '@fluentui/react';
import '../css/QuestionBox.css';

initializeIcons();

class QuestionBox extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        const {notebookRef} = props;

        this.state = {
            value: '',
            notebookRef: notebookRef,
        };
    }

    handleChange = (event) => {
        this.setState((state) => {
            return {...state, value: event.target.value};
        });
    }

    handleSubmit = (event) => {
        this.state.notebookRef.current.addQuestionCell(this.state.value);

        this.setState((state) => {
            return {...state, value: ''};
        });

        event.preventDefault();
    }

    render() {
        return (
            <div className="questionBox flex items-center p-2 m-2 bg-gray-100 rounded-sm shadow-md space-x-2">
                <Icon iconName="SearchBookmark"/>
                <form onSubmit={this.handleSubmit}>
                    <input className="bg-transparent w-96" type="text" placeholder="Question" value={this.state.value} onChange={this.handleChange} />
                </form>
            </div>
        )
    }
}

export default QuestionBox;
