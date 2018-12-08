import React, { Component } from 'react';
import Navigation from './Navigation';
import axios from 'axios';
import '../styles/Details.css';
import { ResponsivePie } from '@nivo/pie';
var tokens = require('../tokens.js');

class Details extends Component {
    state = {
        week: parseInt(this.props.match.params.week),
        settings: {
            total_weeks: 0,
            name: "",
            season: "",
            expected_mean: 0
        },
        league_key: this.props.match.params.league_key,
        team_id: this.props.match.params.team_id,
        team: null,
        details: null
    }

    componentWillMount() {
        this.loadSettings();
        this.loadTeam();
    }

    loadSettings() {
        axios.get(`${tokens.serverUrl()}/league/${this.state.league_key}/settings?token=${this.props.token}`).then(res => {
            this.setState({
                settings: res.data
            });

            this.loadDetails();
        });
    }

    loadTeam() {
        axios.get(`${tokens.serverUrl()}/league/${this.state.league_key}/teams?token=${this.props.token}`).then(res => {
            var teamIndex = parseInt(this.state.team_id) - 1;
            var curTeam = res.data[teamIndex];
            this.setState({
                team: curTeam
            });
        });
    }

    loadDetails() {
        var url = `${tokens.serverUrl()}/rankings/${this.state.league_key}/${this.state.week}/${this.state.settings.expected_mean}/details/${this.state.team_id}?token=${this.props.token}`;
        axios.get(url).then(res => {
            this.setState({
                details: res.data
            });
        });
    }

    formatPercentage(percentage) {
        return percentage.toFixed(3).substring(1);
    }

    getPieData(ratio) {
        return [{
            id: "current",
            value: ratio
        },
        {
            id: "other",
            value: 1 - ratio
        }]
    }

    getPieStartAngle(week) {
        var curTotal = 0;
        for (var i = 0; i < week; i++) {
            curTotal += this.state.details.calculation[i].ratio;
        }
        return curTotal * 360;
    }

    render() {
        var weeks = [];
        for (var i = 1; i <= this.state.settings.total_weeks; i++) {
            weeks.push(i);
        }

        return (
            <div className={"content-container"}>
                <Navigation league_key={this.state.league_key} token={this.props.token} />
                <h1>{`${this.state.settings.season} ${this.state.settings.name}`}</h1>
                <h2 className={"sub-label"}>Rankings Details</h2>
                <div className={"description"}>Details about the calculation for the Power Rankings win percentage for a specific team.</div>
                <div className={"weeks-list"}>
                    <div className={"week-label"}>Week:</div>
                    {
                        weeks.map(week =>
                            <div key={week} className={`week${(week === this.state.week ? " current-week" : "")}${(week > this.state.settings.current_week ? " disabled" : "")}`}>
                                <a href={`/details/${this.state.league_key}/${week}/${this.state.team_id}?token=${this.props.token}`}>{week}</a>
                            </div>
                        )
                    }
                </div>
                {this.state.team && this.state.details && <>
                    <div className={"team-details"}>
                        <div><img className={"team-logo"} src={this.state.team.logo_url}></img></div>
                        <div className={"team-name"}>{this.state.team.name}</div>
                        <div className={"win-percentage"}>{this.formatPercentage(this.state.details.win_percentage)}</div>
                    </div>
                    <table className={"calculation"}>
                        <tbody>
                            <tr className={"table-header"}>
                                <td>Week</td>
                                <td>Points</td>
                                <td>Wins</td>
                                <td>Weight</td>
                            </tr>
                            {
                                this.state.details.calculation.map(week =>
                                    <tr key={week.week}>
                                        <td>{`Week ${week.week}`}</td>
                                        <td className={"points-text"}>{week.points}</td>
                                        <td className={"wins-text"}>{this.formatPercentage(week.wins)}</td>
                                        <td>
                                            <div className={"ratio-pie"}>
                                                <ResponsivePie
                                                    data={this.getPieData(week.ratio)}
                                                    startAngle={this.getPieStartAngle(week.week)}
                                                    endAngle={-360}
                                                    enableRadialLabels={false}
                                                    enableSlicesLabels={false}
                                                    isInteractive={false}
                                                    fit={false}
                                                    colors={"set2"}
                                                />
                                            </div>
                                            <div className={"ratio-text"}>{this.formatPercentage(week.ratio)}</div>
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </>}
            </div>
        );
    }
}

export default Details;
