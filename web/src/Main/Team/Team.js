import React, {Component} from 'react'
import {connect} from 'react-redux'
import {getUserLeagues, getLeague} from '../../middleware/leagues'
import TeamSelectModal from './TeamSelectModal'
import TeamDisplayModal from './TeamDisplayModal'
import {pickTeam} from './TeamSelectReducer'
import {addGoalkeepers} from './TeamSelectReducer'
import {getUserLeagueTeam} from '../../middleware/teams'

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
                            }
                        }),
                    )
                }
            }
        )
    }

    handleLeagueSelect(event) {
        let selectedIndex = event.target.options.selectedIndex
        let team = event.target.options[selectedIndex].getAttribute('league-id')
        this.props.pickTeam(team)
        const userId = this.props.user.payload[0][0]
        getUserLeagueTeam(userId, team).then(
            (result) => {
                if (result){
                    const goalkeepers = JSON.parse(result[2])
                    this.props.addGoalkeepers(goalkeepers)
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
                key='leagueSelect'
                placeholder='Select League'>
                    <option>Select League</option>
                    {this.state.userLeagues.map(createLeagueOptions)}
                </select>
                <div>
                    <TeamSelectModal/><TeamDisplayModal/>
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => ({
    user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
    // state: JSON.parse(window.localStorage.getItem('state')) || state,
    team: state.team
});

const mapDispatchtoPros = () => {
    return {
        pickTeam,
        addGoalkeepers
    };
}

export default connect(mapStateToProps, mapDispatchtoPros())(Team);