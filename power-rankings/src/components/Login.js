import React, { Component } from 'react';
var tokens = require('../tokens.js');

class Login extends Component {
    render() {
        return (
            <div className={"content-container"}>
                <h1>Yahoo Fantasy Football Power Rankings</h1>
                <a href={`${tokens.serverUrl()}/auth/yahoo`} className="button">Log In With Yahoo</a>
            </div>
        );
    }
}

export default Login;
