import React, {Component} from 'react'
import {connect} from 'react-redux'
import {getUserLeagues, getLeague} from '../../middleware/leagues'
import TeamSelectModal from './TeamSelectModal'
import TeamDisplayModal from './TeamDisplayModal'
import {pickTeam, setPlayers, setSelectedGameweek, setCurrentGameweek, setPlayerStats} from './TeamSelectReducer'
import {getUserLeagueTeam} from '../../middleware/teams'
import {getGameweek, getGameweekTeam, getGameweekStats} from '../../middleware/gameweek'
import styles from '../../styles/Team.module.css'

class Team extends Component {
    constructor(props) {
        super(props)
        this.handleLeagueSelect = this.handleLeagueSelect.bind(this);
        this.updateSelectedGameweek = this.updateSelectedGameweek.bind(this);
    }
    state = {
        userLeagues: [],
        leaguePlayers: {},
        selectedLeague: null,
        curGameweek: null,
        selectedGameweek: null,
        userLeagueTeam: null
    }

    componentDidMount() {
        const userId = this.props.user.payload[0][0]
        getGameweek('current').then(
            result => {
                setCurrentGameweek(result[0][1])
                this.setState({
                    curGameweek: result[0][1],
                    selectedGameweek: result[0][1]
                })
            }
        )
        getUserLeagues(userId).then(
            (result) => {
                for (let i=0; i<result.length; i++){
                    const leagueId = result[i][1]
                    getLeague(result[i]).then(
                        getLeagueresult => 
                            this.setState({
                            userLeagues: [...this.state.userLeagues, getLeagueresult],
                            leaguePlayers: {
                                ...this.state.leaguePlayers,
                                [getLeagueresult[1]]: {
                                    goalkeepers: result[0][3],
                                    defenders: result[0][4],
                                    midfielder: result[0][5],
                                    forwards: result[0][6],
                                }
                            }
                        }),
                    )
                    this.setState({selectedLeague: leagueId})
                    if (this.props.team.leagueId == null){
                        this.props.pickTeam(leagueId)
                        this.loadTeam(userId, leagueId, this.state.curGameweek)
                    }
                }
            }
        )
    }

    handleLeagueSelect(event) {
        let selectedIndex = event.target.options.selectedIndex
        let leagueId = event.target.options[selectedIndex].getAttribute('league-id')
        const userId = this.props.user.payload[0][0]
        this.props.pickTeam(leagueId)
        this.loadTeam(userId, leagueId, this.state.curGameweek)
    }

    loadTeam(userId, leagueId, gameweek){
        getGameweekStats(gameweek).then(function(result){
            this.props.setPlayerStats(result)
        }.bind(this))
        if (this.state.curGameweek != gameweek){
            // TODO: this is obviously awful, needs fixing so no duplication of code
            getGameweekTeam(gameweek, this.state.selectedLeague, this.props.user.payload[0][0]).then(
                result => {
                    this.props.setPlayers({'players': JSON.parse(result[0][3]), position: 'goalkeepers'})
                    this.props.setPlayers({'players': JSON.parse(result[0][4]), position: 'defenders'})
                    this.props.setPlayers({'players': JSON.parse(result[0][5]), position: 'midfielders'})
                    this.props.setPlayers({'players': JSON.parse(result[0][6]), position: 'forwards'})
                    this.props.setPlayers({'players': JSON.parse(result[0][7]), position: 'subs'})
                }
            )
        }
        getUserLeagueTeam(userId, leagueId).then(
            (result) => {
                if (result){
                    // console.log(result)
                    this.setState({userLeagueTeam: result})
                    this.setAllPlayers(result)
                }
            }
        )
        console.log(this.state)
    }

    setAllPlayers(result) {
        this.props.setPlayers({'players': JSON.parse(result[3]), position: 'goalkeepers'})
        this.props.setPlayers({'players': JSON.parse(result[4]), position: 'defenders'})
        this.props.setPlayers({'players': JSON.parse(result[5]), position: 'midfielders'})
        this.props.setPlayers({'players': JSON.parse(result[6]), position: 'forwards'})
        this.props.setPlayers({'players': JSON.parse(result[8]), position: 'subs'})

    } 
    updateSelectedGameweek(operation){
        const newGameweek = operation=='add'? this.state.selectedGameweek + 1 : this.state.selectedGameweek - 1
        this.setState({
            selectedGameweek: newGameweek
        })
        this.loadTeam(this.props.user.payload[0][0], this.props.team.leagueId, newGameweek)
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
                    <div id={styles.teamName}><h4>{this.state.userLeagueTeam ? this.state.userLeagueTeam[7] : null}</h4> <div>{}</div></div>
                <br/>
                <br/>
                <div><button onClick={() => this.updateSelectedGameweek('subtract')} disabled={this.state.selectedGameweek <= 1} >{"<"}</button>
                <span>Gameweek {this.state.selectedGameweek}</span>
                <button onClick={() => this.updateSelectedGameweek('add')} disabled={this.state.selectedGameweek >= this.state.curGameweek}>{">"}</button></div>
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
        setPlayers,
        setSelectedGameweek,
        setCurrentGameweek,
        setPlayerStats
    };
}

export default connect(mapStateToProps, mapDispatchtoPros())(Team);