import React, { Component } from 'react';
import Navigation from './Navigation';
import axios from 'axios';
import '../styles/Details.css';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
var gaussian = require('gaussian');
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
            var curTeam;
            for (var i = 0; i < res.data.length; i++) {
                var team = res.data[i];
                if (team.team_id === this.state.team_id) {
                    curTeam = team;
                }
            }
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
        var fixedPercentage = percentage.toFixed(3);
        if (fixedPercentage.startsWith("1")) {
            return fixedPercentage;
        }
        return fixedPercentage.substring(1);
    }

    getLineData() {
        var distribution = gaussian(0, 1);
        var data = [];
        for (var i = -3; i <= 3; i += 0.01) {
            var x = i.toFixed(2);
            var y = distribution.pdf(i);
            data.push({
                "x": x,
                "y": y
            })
        }

        return [{
            "id": "dist",
            "data": data
        }];
    }

    getMarkerValue(wins) {
        var distribution = gaussian(0, 1);
        var ppf = distribution.ppf(wins);

        if (Math.abs(ppf) < 0.01) {
            ppf = 0.01;
        } else if (ppf > 2.95) {
            ppf = 2.95;
        } else if (ppf < -2.95) {
            ppf = -2.95;
        }

        return ppf.toFixed(2);
    }

    getPieData(ratio) {
        return [{
            id: "other",
            value: 1 - ratio
        }, {
            id: "current",
            value: ratio
        }]
    }

    getPieStartAngle(week) {
        var curTotal = 0;
        for (var i = 0; i < week - 1; i++) {
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
                <div className={"description"}>
                    This shows details about Power Rankings calculation for a specific team.
                    The win percentage indicates the likelihood that the team would win their game given the number of points that they scored.
                    The weight indicates how much the week is considered in the Power Rankings calculation relative to the rest of the weeks.
                </div>
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
                                <td>Win Percentage</td>
                                <td>Weight</td>
                            </tr>
                            {
                                this.state.details.calculation.map(week =>
                                    <tr key={week.week}>
                                        <td>{`Week ${week.week}`}</td>
                                        <td className={"points-text"}>{week.points}</td>
                                        <td>
                                            <div className={"wins-graph"}>
                                                <ResponsiveLine
                                                    data={this.getLineData()}
                                                    axisTop={null}
                                                    axisRight={null}
                                                    axisBottom={null}
                                                    axisLeft={null}
                                                    enableGridX={false}
                                                    enableGridY={false}
                                                    enableDots={false}
                                                    isInteractive={false}
                                                    colors={"paired"}
                                                    markers={[{
                                                        axis: 'x',
                                                        value: this.getMarkerValue(week.wins),
                                                        lineStyle: { stroke: '#1F78B4', strokeWidth: 2 }
                                                    }]}
                                                />
                                            </div>
                                            <div className={"wins-text"}>{this.formatPercentage(week.wins)}</div>
                                        </td>
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
                                                    colors={"paired"}
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
