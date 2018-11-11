import React, { Component } from 'react';
import '../styles/Login.css';
var tokens = require('../tokens.js');

class Login extends Component {
    render() {
        return (
            <a href={`${tokens.serverUrl()}/auth/yahoo`} className="button">Log In</a>
        );
    }
}

export default Login;
