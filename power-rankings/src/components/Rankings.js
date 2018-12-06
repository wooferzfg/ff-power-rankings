import React, { Component } from 'react';
import Navigation from './Navigation';
import '../styles/Rankings.css';
import axios from 'axios';
var tokens = require('../tokens.js');

class Rankings extends Component {
    state = {
        week: 0,
        settings: {
            total_weeks: 0,
            name: "",
            season: ""
        },
        league_key: this.props.match.params.league_key,
        teams: {},
        rankings: [],
        page_name: this.props.weighted ? "Rankings" : "Standings",
        page_description: this.props.weighted
            ? "Teams ranked based on the quality of their recent performance, where the win percentage represents the full season win rate that their recent performance is equivalent to. More recent weeks are weighted more heavily."
            : "Teams ranked based on the win percentage they are expected to have, which is calculated from the number of points they have scored in each week. All weeks are weighted equally."
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
        axios.get(`${tokens.serverUrl()}/league/${this.state.league_key}/teams?token=${this.props.token}`).then(res => {
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
        var unweightedPart = "";
        if (!this.props.weighted) {
            unweightedPart = "/unweighted";
        }
        axios.get(`${tokens.serverUrl()}/rankings/${this.state.league_key}/${this.state.week}${unweightedPart}?token=${this.props.token}`).then(res => {
            this.setState({
                rankings: res.data
            });
        });
    }

    formatWinPercentage(winPercentage) {
        return winPercentage.toFixed(3).substring(1);
    }

    render() {
        var weeks = [];
        for (var i = 1; i <= this.state.settings.total_weeks; i++) {
            weeks.push(i);
        }

        return <div className={"content-container"}>
            <Navigation league_key={this.state.league_key} token={this.props.token} selected={this.state.page_name} />
            <h1>{`${this.state.settings.season} ${this.state.settings.name}`}</h1>
            <h2 className={"sub-label"}>{this.state.page_name}</h2>
            <div className={"description"}>{this.state.page_description}</div>
            <div className={"weeks-list"}>
                <div className={"week-label"}>Week:</div>
                {
                    weeks.map(week =>
                        <div key={week} className={`week${(week === this.state.week ? " current-week" : "")}${(week > this.state.settings.current_week ? " disabled" : "")}`}>
                            <a href={`/${this.state.page_name.toLowerCase()}/${this.state.league_key}/${week}?token=${this.props.token}`}>{week}</a>
                        </div>
                    )
                }
            </div>
            <table className={"rankings"}>
                <tbody>
                    <tr className={"table-header"}>
                        <td>Rank</td>
                        <td colSpan={"2"}>Team</td>
                        <td>Pct</td>
                        <td colSpan={"2"}>Change</td>
                    </tr>
                    {
                        this.state.rankings.map((team, index) => {
                            var teamInfo = this.state.teams[team.team_id];
                            return <tr key={index}>
                                <td className={"rank"}>{index + 1}</td>
                                <td><img className={"team-logo"} src={teamInfo.logo_url}></img></td>
                                <td className={"team-name"}>{teamInfo.name}</td>
                                <td className={"win-percentage"}>{this.formatWinPercentage(team.win_percentage)}</td>
                                {team.change === 0 ?
                                    <td className={"change-dash"} colSpan={"2"}>-</td>
                                    : <>
                                        <td>{team.change > 0 ?
                                            <img className={"change-arrow"} src="/images/uparrow.png"></img>
                                            :
                                            <img className={"change-arrow"} src="/images/downarrow.png"></img>
                                        }
                                        </td>
                                        <td className={"change-text"}>{Math.abs(team.change)}</td>
                                    </>
                                }
                            </tr>;
                        })
                    }
                </tbody>
            </table>
        </div>
    }
}

export default Rankings;
