import React, {Component} from 'react'
import CreateLeagueModal from './CreateLeagueModal'
import JoinLeagueModal from './JoinLeagueModal'
import {connect} from 'react-redux'
import styles from '../../styles/League.module.css'

const get_user_leagues = () => {
    let leagues = []
    return leagues
}

class League extends Component {
    constructor(props) {
        super(props)
    }
    state = {
        showCreateLeagueModal: false,
        showJoinLeagueModal: false
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

    render() {
        console.log(this.props)
        return(
            <div>
                <div>League</div>
                <button onClick={() => this.toggleCreateLeagueModal()}>Create League</button>
                { this.state.showCreateLeagueModal ? <CreateLeagueModal handleClose={() => this.toggleCreateLeagueModal()}/> : null}
                <button onClick={() => this.toggleJoinLeagueModal()}>Join League</button>
                { this.state.showJoinLeagueModal ? <JoinLeagueModal handleClose={() => this.toggleJoinLeagueModal()}/> : null}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    state: JSON.parse(window.localStorage.getItem('state')) || state
});

export default connect(mapStateToProps)(League);