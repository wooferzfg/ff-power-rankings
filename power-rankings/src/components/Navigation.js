import React, { Component } from 'react';
import '../styles/Navigation.css';
var tokens = require('../tokens.js');

class Navigation extends Component {
    render() {
        return (
            <div className={"nav-bar"}>
                <a href={`${tokens.clientUrl()}/leagues?token=${this.props.token}`} className="button leagues">Back to Leagues</a>
                <a href={`${tokens.clientUrl()}/rankings/${this.props.league_key}?token=${this.props.token}`} className={`button${(this.props.selected === "Rankings" ? " selected" : "")}`}>Rankings</a>
                <a href={`${tokens.clientUrl()}/graph/${this.props.league_key}?token=${this.props.token}`} className={`button${(this.props.selected === "Graph" ? " selected" : "")}`}>Graph</a>
                <a href={`${tokens.clientUrl()}/standings/${this.props.league_key}?token=${this.props.token}`} className={`button${(this.props.selected === "Standings" ? " selected" : "")}`}>Standings</a>
                <a href={`${tokens.clientUrl()}/data/${this.props.league_key}?token=${this.props.token}`} className={`button${(this.props.selected === "Data" ? " selected" : "")}`}>Data</a>
            </div>
        );
    }
}

export default Navigation;
