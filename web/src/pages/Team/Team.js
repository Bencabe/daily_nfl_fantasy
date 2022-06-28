import React, {Component} from 'react'
import {connect} from 'react-redux'
import {getUserLeagues, getLeague} from '../../middleware/leagues'
import TeamSelectModal from './TeamSelectModal'
import TeamDisplayModal from './TeamDisplayModal'
import {pickTeam} from './TeamSelectReducer'
import {addPlayers} from './TeamSelectReducer'
import {getUserLeagueTeam} from '../../middleware/teams'
import styles from '../../styles/Team.module.css'

class Team extends Component {
    constructor(props) {
        super(props)
        this.handleLeagueSelect = this.handleLeagueSelect.bind(this);
    }
    state = {
        userLeagues: [],
        leaguePlayers: {},
        selectedLeague: null
    }

    componentDidMount() {
        const userId = this.props.user.payload[0][0]
        getUserLeagues(userId).then(
            (result) => {
                for (let i=0; i<result.length; i++){
                    let leagueId = result[i][0]
                    // console.log(leagueId)
                    getLeague(result[i]).then(
                        getLeagueresult => this.setState({
                            userLeagues: [...this.state.userLeagues, getLeagueresult],
                            leaguePlayers: {
                                ...this.state.leaguePlayers,
                                [getLeagueresult[0]]: {
                                    goalkeepers: result[0][2],
                                    defenders: result[0][3],
                                    midfielder: result[0][4],
                                    forwards: result[0][5],
                                }
                            },
                            selectedLeague: leagueId
                        }),
                    )
                    if (this.props.team.leagueId == null){
                        this.props.pickTeam(leagueId)
                        this.loadTeam(userId, leagueId)
                    }
                }
            }
        )
    }


    handleLeagueSelect(event) {
        let selectedIndex = event.target.options.selectedIndex
        let team = event.target.options[selectedIndex].getAttribute('league-id')
        const userId = this.props.user.payload[0][0]
        this.props.pickTeam(team)
        this.loadTeam(userId, team)
    }

    loadTeam(userId, team){
        getUserLeagueTeam(userId, team).then(
            (result) => {
                if (result){
                    this.props.addPlayers({'players': JSON.parse(result[2]), position: 'goalkeepers'})
                    this.props.addPlayers({'players': JSON.parse(result[3]), position: 'defenders'})
                    this.props.addPlayers({'players': JSON.parse(result[4]), position: 'midfielders'})
                    this.props.addPlayers({'players': JSON.parse(result[5]), position: 'forwards'})
                }
            }
        )
    }



    render() {
        const createLeagueOptions = (league) => {
            return <option key={league[0]} league-id={league[0]}>{league[1]}</option>
        }
        return(
            <div>
                <select 
                onChange={this.handleLeagueSelect}
                key='leagueSelect'>
                    {this.state.userLeagues.map(createLeagueOptions)}
                </select>
                <div id={styles.body}>
                    <div id={styles.selectModal}><TeamSelectModal/></div>
                    <div id={styles.displayModal}><TeamDisplayModal/></div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => ({
    user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
    team: state.team
});

const mapDispatchtoPros = () => {
    return {
        pickTeam,
        addPlayers
    };
}

export default connect(mapStateToProps, mapDispatchtoPros())(Team);