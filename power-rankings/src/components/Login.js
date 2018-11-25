import React, { Component } from 'react';
import '../styles/Login.css';
var tokens = require('../tokens.js');

class Login extends Component {
    render() {
        return (
            <div className={"login-content"}>
                <h1>Yahoo Fantasy Football Power Rankings</h1>
                <a href={`${tokens.serverUrl()}/auth/yahoo`} className="login-button">Log In With Yahoo</a>
            </div>
        );
    }
}

export default Login;
