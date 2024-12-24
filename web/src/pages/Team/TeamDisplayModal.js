import React, {Component} from 'react'
import {connect} from 'react-redux'
import {setPlayers} from './TeamSelectReducer'
import styles from '../../styles/Team.module.css'
import {getPlayerScore, getTeamScore} from '../../middleware/scoring'
import PlayerPointsModal from './PlayerPointsModal'

class TeamDisplayModal extends Component {
    constructor(props) {
        super(props)
        this.createPlayerOption = this.createPlayerOption.bind(this);
        this.createStartingPlayerOption = this.createStartingPlayerOption.bind(this);
        this.deletePlayer = this.deletePlayer.bind(this);
        this.togglePointsModal = this.togglePointsModal.bind(this);
    }
    state = {
        errorMessage: null,
        displayPointsModal: false,
        statsPlayer: null, 
        statsPlayerPosition: null,
        gameweekScore: 0,
        canDelete: false
    }

    createPlayerOption(playerId) {
        let player
        const fullPlayerList = [...this.props.team.allPlayers.goalkeepers,
                                ...this.props.team.allPlayers.defenders,
                                ...this.props.team.allPlayers.midfielders,
                                ...this.props.team.allPlayers.forwards]
        for (let i=0; i<fullPlayerList.length; i++){
            if (fullPlayerList[i][1] == playerId){
                player = fullPlayerList[i]
                let playerPosition = player[6]
                const playerScore = getPlayerScore(this.props.team.playerStats[player[1]], playerPosition).toFixed(1)
                return <div key={player[1]} className={styles.selectedPlayer}>
                            <option className={styles.selectedPlayerName} player-id={player[1]}>{player[8].split(' ')[1]}</option>
                            <button className={styles.playerScore } value={[playerPosition]} onClick={this.togglePointsModal} id={player[1]}>{playerScore}</button>
                            {this.canDeletePlayers() ? <button className={styles.selectedPlayerDeleteButton} id={player[1]} value={playerPosition} onClick={this.deletePlayer}>x</button> : null} 
                        </div>
            }
        }
    }

    createStartingPlayerOption(playerId) {
        if (!this.props.team.teamPlayers.subs.includes(playerId)){
            return this.createPlayerOption(playerId)
        }
    }

    getListOfPlayersPerPositionForDelete(event, position) {
        const indexOfPlayerToRemove = this.props.team.teamPlayers[position].indexOf(parseInt(event.currentTarget.id))
        const playersArray = [...this.props.team.teamPlayers[position]]
        playersArray.splice(indexOfPlayerToRemove, 1)
        return playersArray 
    }

    deletePlayer(event) {
        const position = event.currentTarget.value + 's'
        const startingPlayersArray = this.getListOfPlayersPerPositionForDelete(event, position)
        const playersToRemovePayload = {players: startingPlayersArray, position: position}
        this.props.setPlayers(playersToRemovePayload)
        if (this.props.team.teamPlayers.subs.includes(parseInt(event.currentTarget.id))) {
            const subsArray = this.getListOfPlayersPerPositionForDelete(event, 'subs')
            const subsToRemovePayload = {players: subsArray, position: 'subs'}
            this.props.setPlayers(subsToRemovePayload)
        }
    }

    togglePointsModal(event) {
        this.setState({statsPlayer: event.currentTarget.id, statsPlayerPosition: event.currentTarget.value})
        this.setState({displayPointsModal: this.state.displayPointsModal ? false : true})
    }

    canDeletePlayers() {
        return this.props.team.gameweekSelected.number == this.props.team.curGameweek.number && !this.curGameweekActive()
    }

    curGameweekActive() {
        return false
    }


    render() {
        return(
            <div>
            { this.state.displayPointsModal ? <PlayerPointsModal handleClose={() => this.togglePointsModal({currentTarget: {id: this.state.statsPlayer}})} 
                                                    playerStats={this.props.team.playerStats[this.state.statsPlayer]}
                                                    playerPosition={this.state.statsPlayerPosition}/> : null}
                <div id={styles.teamDisplayConatiner}>
                    <div id={styles.goalkeepersContainer}>
                        <div>{this.props.team.teamPlayers.goalkeepers.map(this.createStartingPlayerOption)}</div>
                    </div>
                    <div id={styles.defendersContainer}>
                        <div>{this.props.team.teamPlayers.defenders.map(this.createStartingPlayerOption)}</div>
                    </div>
                    <div id={styles.midfieldersContainer}>
                        <div>{this.props.team.teamPlayers.midfielders.map(this.createStartingPlayerOption)}</div>
                    </div>
                    <div id={styles.forwardsContainer}>
                        <div>{this.props.team.teamPlayers.forwards.map(this.createStartingPlayerOption)}</div>
                    </div>
                    <div id={styles.subsContainer}>
                        <h3>Subs</h3>
                        <div>{this.props.team.teamPlayers.subs.map(this.createPlayerOption)}</div>
                    </div>
                    <div id={styles.scoringContainer}>
                        <p>Gameweek Score: {parseInt(getTeamScore(this.props.team.teamPlayers, this.props.team.playerStats))}</p>
                        <p>Total Score: {}</p>
                    </div>
                </div>
            </div>
        )
    }

}

const mapDispatchToProps = () => {
    return{
        setPlayers
    };
}

const mapStateToProps = state => ({
    user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
    loggedIn: JSON.parse(window.localStorage.getItem('loggedIn')) || state.auth.loggedIn,
    team: state.team
});


export default connect(mapStateToProps, mapDispatchToProps())(TeamDisplayModal);