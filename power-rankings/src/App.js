import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Login from './components/Login';
import Leagues from './components/Leagues';
import Rankings from './components/Rankings';

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <div className="app">
                    <Switch>
                        <Route exact path="/Leagues" component={Leagues} />
                        <Route path="/Rankings/:league_key/:week?" component={Rankings} />
                        <Route exact path="/Login" component={Login} />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;
