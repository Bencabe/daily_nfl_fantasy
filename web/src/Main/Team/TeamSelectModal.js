import React, {Component} from 'react'
import {getPlayersPerPosition} from '../../middleware/players'
import {connect} from 'react-redux'
import {addGoalkeeper, allGoalkeepers} from './TeamSelectReducer'
import {saveUserLeagueTeam} from '../../middleware/teams'

class TeamSelectModal extends Component {
    constructor(props) {
        super(props)
        this.handleGoalkeeperSelection = this.handleGoalkeeperSelection.bind(this);
    }
    state = {
            allGoalkeepers: [],
            selectedGoalkeeper: null,
            goalkeeperErrorMessage: null
    }
    componentDidMount() {
        getPlayersPerPosition('goalkeeper').then(
            (result) => {
                this.props.allGoalkeepers(result)
            }
        )
    }

    parseGoalkeepers() {
        const selectedLeague = this.props.state.selectedLeague
        const goalkeepers = selectedLeague == null ? null : this.props.state.leaguePlayers[selectedLeague].goalkeepers
        return goalkeepers
    }
    createPlayerOption(goalkeeperResult) {
        return <option key={goalkeeperResult[0]} player-id={goalkeeperResult[0]}>{goalkeeperResult[2]} {goalkeeperResult[3]}</option>
    }

    selectedGoalkeeper(event) {
        let selectedIndex = event.target.options.selectedIndex
        this.setState({
            selectedGoalkeeper: event.target.options[selectedIndex].getAttribute('player-id')
        })
    }

    handleGoalkeeperSelection(goalkeeper){
        console.log(this.props.team.players.goalkeepers)
        if (this.props.team.players.goalkeepers.includes(parseInt(goalkeeper))){
            this.setState({
                goalkeeperErrorMessage: 'Player already selected'
            })
        }
        else{
            this.props.addGoalkeeper(goalkeeper)
            this.setState({
                goalkeeperErrorMessage: null
            })
        }
    }

    saveTeam(){
        saveUserLeagueTeam(this.props.team.leagueId, this.props.user.payload[0][0], this.props.team.players.goalkeepers, [], [], [])
    }

    render(){
        return(
            <div>
                <div>
                    <div>
                        <h3>Goalkeepers</h3>
                        <div>
                            <select onChange={this.selectedGoalkeeper.bind(this)}>
                                <option>Choose Player</option>
                                {this.props.team.allGoalkeepers.map(this.createPlayerOption)}
                            </select>
                            <button onClick={() => this.handleGoalkeeperSelection(this.state.selectedGoalkeeper)}>Select Player</button><br/>
                            <div>{this.state.goalkeeperErrorMessage}</div>
                        </div><br/>
                    </div>
                    <div>
                        <h3>Defenders</h3>
                    </div>
                    <div>
                        <h3>Midfielders</h3>
                    </div>
                    <div>
                        <h3>Forwards</h3>
                    </div>
                    <button onClick={() => this.saveTeam()}>Save Team</button>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = () => {
    return {
        addGoalkeeper,
        allGoalkeepers
    };
}

const mapStateToProps = state => ({
    user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
    loggedIn: state.auth.loggedIn,
    team: state.team
});

export default connect(mapStateToProps, mapDispatchToProps())(TeamSelectModal);