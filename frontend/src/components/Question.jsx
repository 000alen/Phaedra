
import React, { Component } from "react";

import "../css/Question.css";

export class Question extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);

    const {notebookRef} = props;

    this.state = {
      value: '', 
      active: true,
      notebookRef: notebookRef
    };
  }

  handleSubmit(event) {
    // Acá se puede hacer la request
    // alert("Testing alert → " + this.state.value);
    this.state.notebookRef.current.addQuestionCell(this.state.value, 0);
    this.setState(() => ({ ...this.state, value: '' }));
    event.preventDefault();
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  forceUpdateHandler() {
    this.forceUpdate();
  };

  handleClick(event) {
    this.state.active = !this.state.active;
    this.forceUpdate()
    event.preventDefault();
  }

  render() {
    return (
      <div className="posicional-div">
        <form onSubmit={this.handleSubmit}>
          <div className={this.state.active ? 'search' : 'open'}>
            <input className="search-box" type="text" placeholder="Make a question..." value={this.state.value} onChange={this.handleChange} />
            <span className="search-button" onClick={this.handleClick}> <span className="search-icon" /></span>
            <button style={{ visibility: "hidden" }} />
          </div>
        </form>
      </div>
    );
  }
}