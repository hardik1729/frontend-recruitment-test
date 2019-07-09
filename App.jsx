import React, {Component} from 'react';
import Friends from './friends';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      tempinput: ''
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.setState({
      tempinput: event.target.value
    });
  }

  onSubmit(event) {
    this.setState({
      username: this.state.tempinput
    });
    event.preventDefault();
  }

  render() {
    return (

      <div>
        <h1>Friends</h1>
        <form onSubmit={this.onSubmit}>
          <label>
            Username:
          </label>
          <input
            type="text"
            onChange={this.onChange}
            style={{width: '300px'}}
          />
          <button type="submit">Search</button>
        </form>
        <hr/>
        <Friends username={this.state.username}/>
      </div>
    );
  }
}

