import React, {Component} from 'react'
import {connect} from 'react-redux'
import {addPlayers} from './TeamSelectReducer'
import styles from '../../styles/Team.module.css'

class TeamDisplayModal extends Component {
    constructor(props) {
        super(props)
        this.createPlayerOption = this.createPlayerOption.bind(this);
        this.deletePlayer = this.deletePlayer.bind(this);
    }
    state = {
        error_message: null
    }

    createPlayerOption(playerId) {
        let player
        const fullPlayerList = this.props.team.allPlayers.goalkeepers.concat(this.props.team.allPlayers.defenders,
                                                                            this.props.team.allPlayers.midfielders,
                                                                            this.props.team.allPlayers.forwards)
        for (let i=0; i<fullPlayerList.length; i++){
            if (fullPlayerList[i][0] == playerId){
                player = fullPlayerList[i]
                let playerPosition = player[6]
                return <div class={styles.selectedPlayer}>
                            <option class={styles.selectedPlayerName} key={player[0]} player-id={player[0]}>{player[2]} {player[3]}</option>
                            <button class={styles.selectedPlayerDeleteButton} id={player[0]} value={playerPosition} onClick={this.deletePlayer}>Delete</button>
                        </div>
            }
        }
    }
    deletePlayer(event) {
        const position = event.currentTarget.value + 's'
        const indexOfPlayerToRemove = this.props.team.teamPlayers[position].indexOf(parseInt(event.currentTarget.id))
        const tmpArray = [...this.props.team.teamPlayers[position]]
        tmpArray.splice(indexOfPlayerToRemove, 1)
        const playersToRemovepayload = {players: tmpArray, position: position}
        this.props.addPlayers(playersToRemovepayload)

    }

    render() {
        return(
            <div>
                <div>
                    <div>
                        <h4>Goalkeepers</h4>
                        <div>{this.props.team.teamPlayers.goalkeepers.map(this.createPlayerOption)}</div>
                    </div>
                    <div>
                        <h4>Defenders</h4>
                        <div>{this.props.team.teamPlayers.defenders.map(this.createPlayerOption)}</div>
                    </div>
                    <div>
                        <h4>Midfielders</h4>
                        <div>{this.props.team.teamPlayers.midfielders.map(this.createPlayerOption)}</div>
                    </div>
                    <div>
                        <h4>Forwards</h4>
                        <div>{this.props.team.teamPlayers.forwards.map(this.createPlayerOption)}</div>
                    </div>
                </div>

            </div>
        )
    }

}

const mapDispatchToProps = () => {
    return{
        addPlayers
    };
}

const mapStateToProps = state => ({
    user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
    loggedIn: JSON.parse(window.localStorage.getItem('loggedIn')) || state.auth.loggedIn,
    team: state.team
});


export default connect(mapStateToProps, mapDispatchToProps())(TeamDisplayModal);