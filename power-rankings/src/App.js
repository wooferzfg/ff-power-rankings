import React, { Component } from 'react';
import './styles/App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import queryString from 'query-string';

import Login from './components/Login';
import Leagues from './components/Leagues';
import Rankings from './components/Rankings';
import Graph from './components/Graph';

class App extends Component {
    state = {
        token: null
    }

    componentWillMount() {
        var token = queryString.parse(window.location.search).token;
        this.setState({
            token: token
        });
    }

    render() {
        return (
            <div className={"main-container"}>
                <div className={"content"}>
                    <BrowserRouter>
                        <div className="app">
                            <Switch>
                                {this.state.token && <Route exact path="/Leagues" render={(props) => <Leagues token={this.state.token} {...props} />} />}
                                {this.state.token && <Route path="/Rankings/:league_key/:week?" render={(props) => <Rankings token={this.state.token} {...props} />} />}
                                {this.state.token && <Route path="/Graph/:league_key" render={(props) => <Graph token={this.state.token} {...props} />} />}
                                <Route exact path="/" component={Login} />
                            </Switch>
                        </div>
                    </BrowserRouter>
                </div>
            </div>
        );
    }
}

export default App;
