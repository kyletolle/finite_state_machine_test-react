import React from 'react';
import './App.css';
import { Machine } from 'xstate';
import Auth from './Auth.js';
import Dashboard from './Dashboard.js';
import Login from './Login.js';

const appMachine = Machine({
  initial: 'loggedOut',
  states: {
    loggedOut: {
      onEntry: ['error'],
      on: {
        SUBMIT: 'loading',
      },
    },
    loading: {
      on: {
        SUCCESS: 'loggedIn',
        FAIL: 'loggedOut',
      },
    },
    loggedIn: {
      onEntry: ['setUser'],
      onExit: ['unsetUser'],
      on: {
        LOGOUT: 'loggedOut',
      },
    },
  },
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      authState: appMachine.initialState.value,
      error: '',
      logout: e => this.logout(e),
      user: {},
    };
  }

  transition(event) {
    const nextAuthState = appMachine.transition(this.state.authState, event.type);
    const nextState = nextAuthState.actions.reduce(
      (state, action) => this.command(action, event) || state,
      undefined,
    );
    this.setState({
      authState: nextAuthState.value,
      ...nextState,
    });
  }

  command(action, event) {
    // Note: The original article used `switch (action) {`, but I found I had to
    // change it to `switch (action.type) {` to get this to work.
    switch (action.type) {
      case 'setUser':
        if (event.username) {
          return { user: { name: event.username } };
        }
        break;
      case 'unsetUser':
        return {
          user: {},
        };
      case 'error':
        if (event.error) {
          return {
            error: event.error,
          };
        }
        break;
      default:
        return {
          error: 'We could not log you in.'
        };
    }
  }

  logout(e) {
    e.preventDefault();
    this.transition({ type: 'LOGOUT' });
  }

  render() {
    return (
      <Auth.Provider value={this.state}>
        <div className="w5">
          <div className="mb2">{this.state.error}</div>
          {this.state.authState === 'loggedIn' ? (
            <Dashboard />
          ) : (
            <Login transition={event => this.transition(event)} />
          )}
        </div>
      </Auth.Provider>
    );
  }
}

export default App;
