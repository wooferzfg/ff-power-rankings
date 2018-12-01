import React, { Component } from 'react';
import Navigation from './Navigation';
import axios from 'axios';
import { ResponsiveLine } from '@nivo/line';
import '../styles/Graph.css';
var tokens = require('../tokens.js');

class Graph extends Component {
    state = {
        week: 0,
        settings: {
            total_weeks: 0,
            num_teams: 0
        },
        league_key: this.props.match.params.league_key,
        teams: null,
        rankings: null,
        team_ids: null
    }

    componentWillMount() {
        this.loadSettings();
        this.loadTeams();
    }

    loadSettings() {
        axios.get(tokens.serverUrl() + "/league/" + this.state.league_key + "/settings?token=" + this.props.token).then(res => {
            this.setState({
                settings: res.data
            });

            var week = res.data.current_week - 1;
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
        axios.get(tokens.serverUrl() + "/league/" + this.state.league_key + "/teams?token=" + this.props.token).then(res => {
            var teams = {};
            var data = res.data;
            for (var i = 0; i < data.length; i++) {
                var curTeam = data[i];
                var curTeamResult = {
                    name: curTeam.name,
                };
                teams[curTeam.team_id] = curTeamResult;
            }

            this.setState({
                teams: teams
            });
        });
    }

    loadRankings() {
        axios.get(tokens.serverUrl() + "/rankings/" + this.state.league_key + "/" + this.state.week + "/all?token=" + this.props.token).then(res => {
            var result = [];
            var team_ids = [];
            var finalRankings = res.data[res.data.length - 1];

            for (var i = this.state.settings.num_teams - 1; i >= 0; i--) {
                var teamData = [];
                var teamID = finalRankings[i].team_id;
                team_ids.push(teamID);
                for (var j = 1; j <= this.state.week; j++) {
                    var winPercentage = this.getWinPercentage(res.data, j, teamID);
                    var weekResult = { x: j, y: winPercentage };
                    teamData.push(weekResult);
                }
                result.push(teamData);
            }

            this.setState({
                rankings: result,
                team_ids: team_ids
            });
        });
    }

    getWinPercentage(data, week, team_id) {
        var weekData = data[week - 1];
        for (var i = 0; i < weekData.length; i++) {
            var curData = weekData[i];
            if (curData.team_id == team_id) {
                return curData.win_percentage;
            }
        }
    }

    getGraphData() {
        if (this.state.rankings && this.state.teams) {
            var data = [];
            for (var i = 0; i < this.state.team_ids.length; i++) {
                var teamID = this.state.team_ids[i];
                var curTeam = this.state.teams[teamID];
                var curResult = {};
                curResult.id = curTeam.name;
                curResult.data = this.state.rankings[i];
                data.push(curResult);
            }
            return data;
        }
        return [];
    }

    dataFormat(data) {
        return data.toFixed(3);
    }

    render() {
        var data = this.getGraphData();

        return (
            <div className={"content-container"}>
                <Navigation league_key={this.state.league_key} token={this.props.token} selected={"Graph"} />
                <h1>Graph</h1>
                <div className={"graph-container"}>
                    <ResponsiveLine
                        data={data}
                        margin={{
                            "top": 20,
                            "right": 200,
                            "bottom": 50,
                            "left": 60
                        }}
                        xScale={{
                            "type": "point"
                        }}
                        yScale={{
                            "type": "linear",
                            "min": 0,
                            "max": 1
                        }}
                        minY="auto"
                        maxY="auto"
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            "orient": "bottom",
                            "tickSize": 5,
                            "tickPadding": 5,
                            "tickRotation": 0,
                            "legend": "Week",
                            "legendOffset": 36,
                            "legendPosition": "middle"
                        }}
                        axisLeft={{
                            "orient": "left",
                            "tickSize": 5,
                            "tickPadding": 5,
                            "tickRotation": 0,
                            "legend": "Win Percentage",
                            "legendOffset": -40,
                            "legendPosition": "middle"
                        }}
                        colors="paired"
                        dotSize={10}
                        dotColor="inherit:darker(0.3)"
                        dotBorderWidth={2}
                        dotBorderColor="#ffffff"
                        animate={true}
                        motionStiffness={90}
                        motionDamping={15}
                        tooltipFormat={this.dataFormat}
                        legends={[
                            {
                                "anchor": "bottom-right",
                                "direction": "column",
                                "justify": false,
                                "translateX": 190,
                                "translateY": 0,
                                "itemsSpacing": 0,
                                "itemDirection": "left-to-right",
                                "itemWidth": 150,
                                "itemHeight": 20,
                                "itemOpacity": 0.75,
                                "symbolSize": 12,
                                "symbolShape": "circle",
                                "symbolBorderColor": "rgba(0, 0, 0, .5)",
                                "effects": [
                                    {
                                        "on": "hover",
                                        "style": {
                                            "itemBackground": "rgba(0, 0, 0, .03)",
                                            "itemOpacity": 1
                                        }
                                    }
                                ]
                            }
                        ]}
                    />
                </div>
            </div>
        );
    }
}

export default Graph;
