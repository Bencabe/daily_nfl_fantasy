import React, {Component} from 'react'
import {getPlayersPerPosition} from '../../middleware/players'
import {connect} from 'react-redux'
import {addPlayer, loadPlayers, setSelectedGameweek} from './TeamSelectReducer'
import {saveUserLeagueTeam} from '../../middleware/teams'
import styles from '../../styles/Team.module.css'
import Select from 'react-select';

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
        playerSelectErrorMessage: null,
        allowedPlayersPerPosition: {'goalkeepers': {'starters': 1, 'total': 2},
                                    'defenders': {'starters': 5, 'total': 5},
                                    'midfielders': {'starters': 5, 'total': 5},
                                    'forwards': {'starters': 3, 'total': 3},}
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
        return <option key={playerResult[1]} player-id={playerResult[1]} player-position={playerResult[6]}>{playerResult[8]}</option>
    }

    selectedPlayer(event) {
        switch (event.position){
            case 'goalkeeper':
                this.setState({
                    selectedGoalkeeper: event.id
                })
            case 'defender':
                this.setState({
                    selectedDefender: event.id
                })
            case 'midfielder':
                this.setState({
                    selectedMidfielder: event.id
                })
            case 'forward':
                this.setState({
                    selectedForward: event.id
                })
        }
    }

    numStartingPlayers() {
        const numPlayersInTeam = this.props.team.teamPlayers['goalkeepers'].length + 
            this.props.team.teamPlayers['defenders'].length + 
            this.props.team.teamPlayers['midfielders'].length + 
            this.props.team.teamPlayers['forwards'].length -
            this.props.team.teamPlayers['subs'].length
            return numPlayersInTeam
    }

    validateSelection(playerId, position){
        let validation = {errMessage: null, isSub: false}
        const numStartingPlayers = this.numStartingPlayers()
        if (this.props.team.teamPlayers[position].includes(parseInt(playerId))){
            validation.errMessage = 'Player already selected'
        }
        else if (this.props.team.teamPlayers[position].length >= this.state.allowedPlayersPerPosition[position].total){
            validation.errMessage = 'Allowed number of ' + position +  ' reached'
        }
        if (this.props.team.teamPlayers[position].length >= this.state.allowedPlayersPerPosition[position].starters || numStartingPlayers >= 11){
            validation.isSub = true
        }
        return validation
    }

    handlePlayerSelection(playerId, position){
        const selectionValidation = this.validateSelection(playerId, position)
        if (selectionValidation.errMessage) {
            this.setState({
                playerSelectErrorMessage: selectionValidation.errMessage
            })
        }
        else{
            const playerPayload = {id: playerId, position: position, isSub: selectionValidation.isSub}
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
            this.props.team.teamPlayers.forwards,
            this.props.team.teamPlayers.subs)
    }

    createPlayerOptions(players){
        const playerOptions = []
        for (const i in players){
            playerOptions.push({value: players[i][1], id: players[i][1], label: players[i][8], position: players[i][6]})
        }
        return playerOptions
    }

    render(){
        return(
                <div id={styles.playerSelectContainer}>
                    <div className={styles.playerSelectContent}>
                        <Select 
                            className={styles.playerSelectDropdownContainer} 
                            classNamePrefix='playerSelectDropdown'
                            placeholder='Select Goalkeeper' 
                            options={this.createPlayerOptions(this.props.team.allPlayers.goalkeepers)} 
                            onChange={this.selectedPlayer.bind(this)}>
                        </Select>
                        <button className={styles.playerSelectTickBox} onClick={() => this.handlePlayerSelection(this.state.selectedGoalkeeper, 'goalkeepers')}>✓</button><br/>
                    </div><br/>
                    <div className={styles.playerSelectContent}>
                        <Select 
                            className={styles.playerSelectDropdownContainer} 
                            classNamePrefix='playerSelectDropdown'
                            placeholder='Select Defender' 
                            options={this.createPlayerOptions(this.props.team.allPlayers.defenders)} 
                            onChange={this.selectedPlayer.bind(this)}>
                        </Select>
                        <button className={styles.playerSelectTickBox} onClick={() => this.handlePlayerSelection(this.state.selectedDefender, 'defenders')}>✓</button><br/>
                    </div><br/>
                    <div className={styles.playerSelectContent}>
                        <Select 
                            className={styles.playerSelectDropdownContainer} 
                            classNamePrefix='playerSelectDropdown'
                            placeholder='Select Midfielder' 
                            options={this.createPlayerOptions(this.props.team.allPlayers.midfielders)} 
                            onChange={this.selectedPlayer.bind(this)}>
                        </Select>
                        <button className={styles.playerSelectTickBox} onClick={() => this.handlePlayerSelection(this.state.selectedMidfielder, 'midfielders')}>✓</button><br/>
                    </div><br/>
                    <div className={styles.playerSelectContent}>
                        <Select 
                        classNamePrefix='playerSelectDropdown'
                            className={styles.playerSelectDropdownContainer} 
                            placeholder='Select Forward' 
                            options={this.createPlayerOptions(this.props.team.allPlayers.forwards)} 
                            onChange={this.selectedPlayer.bind(this)}>
                        </Select>
                        <button className={styles.playerSelectTickBox} onClick={() => this.handlePlayerSelection(this.state.selectedForward, 'forwards')}>✓</button><br/>
                    </div><br/>
                    <div>{this.state.playerSelectErrorMessage}</div>
                    <button onClick={() => this.saveTeam()}>Save Team</button>
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