import React, { Component } from 'react';
import '../styles/Leagues.css';
import axios from 'axios';
var tokens = require('../tokens.js');

class Leagues extends Component {
    state = {
        leagues: []
    }

    componentWillMount() {
        axios.get(`${tokens.serverUrl()}/user/leagues?token=${this.props.token}`).then(res => {
            this.setState({
                leagues: res.data
            })
        })
    }

    render() {
        return <div className={"content-container"}>
            <h1>Leagues</h1>
            <div className={"leagues-list"}>{this.state.leagues.map((league, index) =>
                <div key={index} className={"league"}>
                    <a href={`/rankings/${league.league_key}?token=${this.props.token}`}>
                        <div className={"season"}>{league.season}</div>
                        <div className={"name"}>{league.name}</div>
                    </a>
                </div>
            )}</div>
        </div>
    }
}

export default Leagues;
