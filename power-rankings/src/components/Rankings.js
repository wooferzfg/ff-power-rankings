import React, { Component } from 'react';
import axios from 'axios';
var tokens = require('../tokens.js');

class Rankings extends Component {
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
            <div>
                <div>{league.name}</div>
                <div>{league.season}</div>
            </div>
        )}</div>
    }
}

export default Rankings;
