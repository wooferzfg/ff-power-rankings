import React, { Component } from 'react';
import Navigation from './Navigation';
import axios from 'axios';
import '../styles/Data.css';
var tokens = require('../tokens.js');

class Data extends Component {
    state = {
        week: 0,
        settings: {
            num_teams: 0,
            name: "",
            season: ""
        },
        league_key: this.props.match.params.league_key,
        teams: [],
        scores: null,
        sort_by: null
    }

    componentWillMount() {
        this.loadSettings();
        this.loadTeams();
    }

    loadSettings() {
        axios.get(`${tokens.serverUrl()}/league/${this.state.league_key}/settings?token=${this.props.token}`).then(res => {
            this.setState({
                settings: res.data
            });

            var week = res.data.current_week - 1;
            this.setWeek(week, res.data.total_weeks);

            this.loadScores();
        });
    }

    setWeek(selectedWeek, totalWeeks) {
        var week = Math.min(totalWeeks, Math.max(selectedWeek, 1));
        this.setState({
            week: week
        });
    }

    loadTeams() {
        axios.get(`${tokens.serverUrl()}/league/${this.state.league_key}/teams?token=${this.props.token}`).then(res => {
            this.setState({
                teams: res.data
            });
        });
    }

    loadScores() {
        axios.get(`${tokens.serverUrl()}/scores/${this.state.league_key}/${this.state.week}?token=${this.props.token}`).then(res => {
            var result = {};
            for (var i = 1; i <= this.state.settings.num_teams; i++) {
                result[i] = {};
            }
            for (var i = 0; i < res.data.length; i++) {
                var curData = res.data[i];
                result[curData.team_id][curData.week] = curData.points;
            }
            this.setState({
                scores: result
            });
        });
    }

    getWeeks() {
        var weeks = [];
        if (this.state.scores) {
            for (var i = 1; i <= this.state.week; i++) {
                weeks.push(i);
            }
            weeks.sort((a, b) => {
                if (this.state.sort_by) {
                    return this.state.scores[this.state.sort_by][a] - this.state.scores[this.state.sort_by][b];
                } else {
                    return a - b;
                }
            });
        }
        return weeks;
    }

    setSortBy(team) {
        if (this.state.sort_by == team.team_id) {
            this.setState({
                sort_by: null
            });
        } else {
            this.setState({
                sort_by: team.team_id
            });
        }
    }

    render() {
        var weeks = this.getWeeks();

        return (
            <div className={"content-container"}>
                <Navigation league_key={this.state.league_key} token={this.props.token} selected={"Data"} />
                <h1>{`${this.state.settings.season} ${this.state.settings.name}`}</h1>
                <h2 className={"sub-label"}>Data</h2>
                <div className={"description"}>The number of points that each team scored in every week of the season.</div>
                <table className={"data"}>
                    <tbody>
                        <tr>
                            <td></td>
                            {
                                this.state.teams.map(team =>
                                    <td>
                                        <div onClick={() => this.setSortBy(team)} className={"team-label"}>
                                            <div className={"team-logo"}><img src={team.logo_url} /></div>
                                            <div className={"team-name"}>{team.name}</div>
                                            <div className={"sort-by"}>{this.state.sort_by === team.team_id ? "▼" : " "}</div>
                                        </div>
                                    </td>
                                )
                            }
                        </tr>
                        {
                            weeks.map(week =>
                                <tr>
                                    <td className={"week"}>Week {week}</td>
                                    {
                                        this.state.teams.map(team =>
                                            <td className={"score"}>{this.state.scores[team.team_id][week]}</td>
                                        )
                                    }
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Data;
