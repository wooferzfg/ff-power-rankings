import React, { Component } from 'react';
import '../styles/Leagues.css';
import axios from 'axios';
var tokens = require('../tokens.js');

class Leagues extends Component {
    state = {
        leagues: []
    }

    componentWillMount() {
        axios.get(tokens.serverUrl() + "/user/leagues").then(res => {
            this.setState({
                leagues: res.data
            })
        })
    }

    render() {
        return <div>{this.state.leagues.map(league =>
            <a href={"/rankings/" + league.league_key}>
                <div>{league.name}</div>
                <div>{league.season}</div>
            </a>
        )}</div>
    }
}

export default Leagues;
