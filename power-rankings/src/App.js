import React, { Component } from 'react';
import './styles/App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Login from './components/Login';
import Leagues from './components/Leagues';
import Rankings from './components/Rankings';

class App extends Component {
    render() {
        return (
            <div className={"main-container"}>
                <div className={"content"}>
                    <BrowserRouter>
                        <div className="app">
                            <Switch>
                                <Route exact path="/Leagues" component={Leagues} />
                                <Route path="/Rankings/:league_key/:week?" component={Rankings} />
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
