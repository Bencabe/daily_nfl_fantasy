import React, {Component} from 'react'
import {getPlayersPerPosition} from '../../middleware/players'
import {connect} from 'react-redux'
import {addPlayer, loadPlayers} from './TeamSelectReducer'
import {saveUserLeagueTeam} from '../../middleware/teams'
import styles from '../../styles/Team.module.css'

class TeamSelectModal extends Component {
    constructor(props) {
        super(props)
        this.handlePlayerSelection = this.handlePlayerSelection.bind(this);
    }
    state = {
            allGoalkeepers: [],
            selectedGoalkeeper: null,
            allDefenders: [],
            selectedDefender: null,
            allMidfielders: [],
            selectedMidfielder: null,
            allForwards: [],
            selectedForward: null,
            playerSelectErrorMessage: null
    }
    componentDidMount() {
        const positions = ['goalkeeper', 'defender', 'midfielder', 'forward']
        for (let i in positions){
            getPlayersPerPosition(positions[i]).then(
                (result) => {
                    this.props.loadPlayers(result)
                }
            )
        }
    }

    createPlayerOption(playerResult) {
        return <option key={playerResult[0]} player-id={playerResult[0]} player-position={playerResult[6]}>{playerResult[2]} {playerResult[3]}</option>
    }

    selectedPlayer(event) {
        // console.log(something)
        let selectedIndex = event.target.options.selectedIndex
        let playerPosition = event.target.options[selectedIndex].getAttribute('player-position')
        let playerID = event.target.options[selectedIndex].getAttribute('player-id')
        if (playerPosition == 'goalkeeper') {
            this.setState({
                selectedGoalkeeper: 1
            })
        }
        if (playerPosition == 'defender') {
            this.setState({
                selectedDefender: playerID
            })
        }
        if (playerPosition == 'midfielder') {
            this.setState({
                selectedMidfielder: playerID
            })
        }
        if (playerPosition == 'forward') {
            this.setState({
                selectedForward: playerID
            })
        }
    }

    handlePlayerSelection(playerId, position){
        if (this.props.team.teamPlayers[position].includes(parseInt(playerId))){
            this.setState({
                playerSelectErrorMessage: 'Player already selected'
            })
        }
        else{
            const playerPayload = {id: playerId, position: position}
            this.props.addPlayer(playerPayload)
            this.setState({
                playerSelectErrorMessage: null
            })
        }
    }

    saveTeam(){
        saveUserLeagueTeam(this.props.team.leagueId, 
            this.props.user.payload[0][0], 
            this.props.team.teamPlayers.goalkeepers, 
            this.props.team.teamPlayers.defenders, 
            this.props.team.teamPlayers.midfielders, 
            this.props.team.teamPlayers.forwards)
    }

    render(){
        return(
            <div>
                <div>
                    <div>
                        <h3>Goalkeepers</h3>
                        <div>
                            <select onChange={this.selectedPlayer.bind(this)}>
                                <option>Choose Player</option>
                                {this.props.team.allPlayers.goalkeepers.map(this.createPlayerOption)}
                            </select>
                            <button onClick={() => this.handlePlayerSelection(this.state.selectedGoalkeeper, 'goalkeepers')}>Select Player</button><br/>
                            <div>{this.state.playerSelectErrorMessage}</div>
                        </div><br/>
                    </div>
                    <div>
                        <h3>Defenders</h3>
                        <div>
                            <select onChange={this.selectedPlayer.bind(this)}>
                                <option>Choose Player</option>
                                {this.props.team.allPlayers.defenders.map(this.createPlayerOption)}
                            </select>
                            <button onClick={() => this.handlePlayerSelection(this.state.selectedDefender, 'defenders')}>Select Player</button><br/>
                            <div>{this.state.playerSelectErrorMessage}</div>
                        </div><br/>
                    </div>
                    <div>
                        <h3>Midfielders</h3>
                        <div>
                            <select onChange={this.selectedPlayer.bind(this)}>
                                <option>Choose Player</option>
                                {this.props.team.allPlayers.midfielders.map(this.createPlayerOption)}
                            </select>
                            <button onClick={() => this.handlePlayerSelection(this.state.selectedMidfielder, 'midfielders')}>Select Player</button><br/>
                            <div>{this.state.playerSelectErrorMessage}</div>
                        </div><br/>
                    </div>
                    <div>
                        <h3>Forwards</h3>
                        <div>
                            <select onChange={this.selectedPlayer.bind(this)}>
                                <option>Choose Player</option>
                                {this.props.team.allPlayers.forwards.map(this.createPlayerOption)}
                            </select>
                            <button onClick={() => this.handlePlayerSelection(this.state.selectedForward, 'forwards')}>Select Player</button><br/>
                            <div>{this.state.playerSelectErrorMessage}</div>
                        </div><br/>
                    </div>
                    <button onClick={() => this.saveTeam()}>Save Team</button>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = () => {
    return {
        addPlayer,
        loadPlayers
    };
}

const mapStateToProps = state => ({
    user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
    loggedIn: state.auth.loggedIn,
    team: state.team
});

export default connect(mapStateToProps, mapDispatchToProps())(TeamSelectModal);