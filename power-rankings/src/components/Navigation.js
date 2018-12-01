import React, { Component } from 'react';
import '../styles/Navigation.css';
var tokens = require('../tokens.js');

class Navigation extends Component {
    render() {
        return (
            <div className={"nav-bar"}>
                <a href={`${tokens.clientUrl()}/leagues`} className="button leagues">Back to Leagues</a>
                <a href={`${tokens.clientUrl()}/rankings/${this.props.league_key}`} className="button">Rankings</a>
                <a href={`${tokens.clientUrl()}/graph/${this.props.league_key}`} className="button">Graph</a>
                <a href={`${tokens.clientUrl()}/data/${this.props.league_key}`} className="button">Data</a>
            </div>
        );
    }
}

export default Navigation;
