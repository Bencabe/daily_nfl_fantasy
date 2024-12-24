import React, {Component} from 'react'
import {connect} from 'react-redux'
import {getUserLeagues, getLeague} from '../../middleware/leagues'
import TeamSelectModal from './TeamSelectModal'
import TeamDisplayModal from './TeamDisplayModal'
import {pickTeam, setPlayers, setSelectedGameweek, setCurrentGameweek, setPlayerStats} from './TeamSelectReducer'
import {getGameweek, getGameweekTeam, getGameweekStats} from '../../middleware/gameweek'
import styles from '../../styles/Team.module.css'
import Gameweek from '../../classes/Gameweek'

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
        userLeagueTeam: null,
        canDelete: false
    }

    async componentDidMount() {
        const userId = this.props.user.payload[0][0]
        const curGameweek = await getGameweek('current')
        await this.props.setCurrentGameweek(curGameweek.serialize())
        await this.props.setSelectedGameweek(curGameweek.serialize())
        this.setState({
            selectedGameweek: curGameweek
        })
        getUserLeagues(userId).then(
            (result) => {
                for (let i=0; i<result.length; i++){
                    const leagueId = result[i][1]
                    getLeague(leagueId).then(
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
                        this.loadTeam()
                    }
                }
            }
        )
    }

    async handleLeagueSelect(event) {
        let selectedIndex = event.target.options.selectedIndex
        let leagueId = event.target.options[selectedIndex].getAttribute('league-id')
        await this.props.pickTeam(leagueId)
        this.loadTeam()
    }

    async loadTeam(){
        const gameweekStats = await getGameweekStats(this.props.team.gameweekSelected.id)
        this.props.setPlayerStats(gameweekStats)
        const gameweekTeam = await getGameweekTeam(this.props.team.gameweekSelected.id, this.props.team.leagueId, this.props.user.payload[0][0])
        this.props.setPlayers({'players': gameweekTeam.goalkeepers, position: 'goalkeepers'})
        this.props.setPlayers({'players': gameweekTeam.defenders, position: 'defenders'})
        this.props.setPlayers({'players': gameweekTeam.midfielders, position: 'midfielders'})
        this.props.setPlayers({'players': gameweekTeam.forwards, position: 'forwards'})
        this.props.setPlayers({'players': gameweekTeam.subs, position: 'subs'})
    }

    async updateSelectedGameweek(operation) {
        // const curGameweek = new Gameweek(this.props.team.gameweekSelected)
        // console.log(this.props.team.gameweekSelected)
        // console.log(curGameweek)
        this.state.selectedGameweek.updateNumber(operation)
        console.log(this.props.team.gameweekSelected)
        console.log(this.state.selectedGameweek)
        this.loadTeam()
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
                {/* {console.log(this.props.team.gameweekSelected)} */}
                <div><button onClick={() => this.updateSelectedGameweek('subtract')} disabled={this.props.team.gameweekSelected.number <= 1} >{"<"}</button>
                <span>Gameweek {this.props.team.gameweekSelected.number}</span>
                <button onClick={() => this.updateSelectedGameweek('add')} disabled={this.props.team.gameweekSelected.number  >= this.props.team.curGameweek.number}>{">"}</button></div>
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