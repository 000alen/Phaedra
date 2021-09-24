import React, { Component } from 'react'

export class QuestionBox extends Component {
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
            <div className="questionBox">
                <form onSubmit={this.handleSubmit}>
                    <input type="text" placeholder="Type your question here" value={this.state.value} onChange={this.handleChange} />
                </form>
            </div>
        )
    }
}
