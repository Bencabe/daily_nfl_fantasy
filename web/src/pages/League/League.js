import React, {Component} from 'react'
import CreateLeagueModal from './CreateLeagueModal'
import JoinLeagueModal from './JoinLeagueModal'
import {pickTeam} from '../Team/TeamSelectReducer'
import {getUserLeagues, getLeague, createLeague} from '../../middleware/leagues'
import {connect} from 'react-redux'
import styles from '../../styles/League.module.css'

class League extends Component {
    constructor(props) {
        super(props)
        this.handleLeagueSelect = this.handleLeagueSelect.bind(this)

    }
    state = {
        showCreateLeagueModal: false,
        showJoinLeagueModal: false,
        leagues: {}
    }

    componentDidMount = () => {
        getUserLeagues(this.props.user.payload[0][0]).then(
            result => {
                for (let i=0; i<result.length; i++){
                    getLeague(result[i]).then(
                        leagueResult => {
                            let leagueID = leagueResult[1]
                            this.setState(prevState => ({
                                leagues: {
                                    ...prevState.leagues,
                                    [leagueID]: {'name': leagueResult[1],
                                                'players': result[i]}
                                }
                            }))
                        }
                    )
                }
            }
        )
    }

    toggleCreateLeagueModal = () => {
        if (this.state.showCreateLeagueModal) {
            this.setState({showCreateLeagueModal: false})
        }
        else {
            this.setState({showCreateLeagueModal: true})
        }
    }

    toggleJoinLeagueModal = () => {
        if (this.state.showJoinLeagueModal) {
            this.setState({showJoinLeagueModal: false})
        }
        else {
            this.setState({showJoinLeagueModal: true})
        }
    }

    createLeagueOption = (leagueId) => {
        const league = this.state.leagues[leagueId]
        return <option key={leagueId} league-id={leagueId}>{league['name']}</option>
    }

    handleLeagueSelect(event) {
        let selectedIndex = event.target.options.selectedIndex
        let team = event.target.options[selectedIndex].getAttribute('league-id')
        this.props.pickTeam(team)
    }

    render() {
        return(
            <div id={styles.leagueMain}>
                <select onChange={this.handleLeagueSelect}>
                    {/* {this.state.leagues.map(this.createLeagueOption)} */}
                    {Object.keys(this.state.leagues).map(this.createLeagueOption)}
                </select>
                <div id={styles.leagueModals}>
                    <button id={styles.createLeagueButton} className={styles.leagueModalButton} onClick={() => this.toggleCreateLeagueModal()}>Create League</button>
                    { this.state.showCreateLeagueModal ? <CreateLeagueModal handleClose={() => this.toggleCreateLeagueModal()} 
                                                                            userId={this.props.user.payload[0][0]}
                                                                            createLeague={createLeague}/> : null}
                    <button id={styles.joinLeagueButton} className={styles.leagueModalButton} onClick={() => this.toggleJoinLeagueModal()}>Join League</button>
                    { this.state.showJoinLeagueModal ? <JoinLeagueModal handleClose={() => this.toggleJoinLeagueModal()}
                                                                        userId={this.props.user.payload[0][0]} /> : null}
                </div>
                <div id={styles.footer}>League ID: {this.props.team.leagueId}</div>
            </div>
        );
    }
}

const mapDispatchToProps = state => {
    return {
        pickTeam
    };
}

const mapStateToProps = state => ({
    user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
    team: state.team
});

export default connect(mapStateToProps, mapDispatchToProps())(League);