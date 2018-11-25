import React, { Component } from 'react';
import axios from 'axios';
var tokens = require('../tokens.js');

class Rankings extends Component {
    state = {
        week: 1,
        settings: {
            total_weeks: 1
        },
        league_key: this.props.match.params.league_key,
        teams: {},
        rankings: []
    }

    componentWillMount() {
        this.loadSettings();
        this.loadTeams();
    }

    loadSettings() {
        axios.get(tokens.serverUrl() + "/league/" + this.state.league_key + "/settings").then(res => {
            this.setState({
                settings: res.data
            });

            if (this.props.match.params.week) {
                var week = parseInt(this.props.match.params.week);
            } else {
                var week = res.data.current_week - 1;
            }
            this.setWeek(week, res.data.total_weeks);

            this.loadRankings();
        });
    }

    setWeek(selectedWeek, totalWeeks) {
        var week = Math.min(totalWeeks, Math.max(selectedWeek, 1));
        this.setState({
            week: week
        });
    }

    loadTeams() {
        axios.get(tokens.serverUrl() + "/league/" + this.state.league_key + "/teams").then(res => {
            var teams = {};
            var data = res.data;
            for (var i = 0; i < data.length; i++) {
                var curTeam = data[i];
                var curTeamResult = {
                    name: curTeam.name,
                    logo_url: curTeam.logo_url
                };
                teams[curTeam.team_id] = curTeamResult;
            }

            this.setState({
                teams: teams
            });
        });
    }

    loadRankings() {
        axios.get(tokens.serverUrl() + "/rankings/" + this.state.league_key + "/" + this.state.week).then(res => {
            this.setState({
                rankings: res.data
            });
        });
    }

    render() {
        var weeks = [];
        for (var i = 1; i <= this.state.settings.total_weeks; i++) {
            weeks.push(i);
        }

        return <div>
            <a href={"/leagues"}>Leagues</a>
            <div>
                {
                    weeks.map(week =>
                        <a href={"/rankings/" + this.state.league_key + "/" + week}>{week}</a>
                    )
                }
            </div>
            <div>
                {
                    this.state.rankings.map(team => {
                        var teamInfo = this.state.teams[team.team_id];
                        return <div>
                            <img src={teamInfo.logo_url}></img>
                            <div>{teamInfo.name}</div>
                            <div>{team.win_percentage}</div>
                            <div>{team.change}</div>
                        </div>;
                    })
                }
            </div>
        </div>
    }
}

export default Rankings;
