import React, {Component} from 'react'
import CreateLeagueModal from './CreateLeagueModal'
import {connect} from 'react-redux'

const get_user_leagues = () => {
    let leagues = []
    return leagues
}

class League extends Component {
    constructor(props) {
        super(props)
    }
    state = {
        showCreateLeagueModal: false
    }

    displayCreateLeagueModal = () => {
        console.log(this.state)
        this.setState({showCreateLeagueModal: true})
    }
    hideCreateLeagueModal = () => {
        this.setState({showCreateLeagueModal: false})
    }

    render() {
        console.log(this.props)
        return(
            <div>
                <div>League</div>
                <button onClick={() => this.displayCreateLeagueModal()}>Create League</button>
                { this.state.showCreateLeagueModal ? <CreateLeagueModal handleClose={() => this.hideCreateLeagueModal()}/> : null}
                <button >Join League</button>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    state: JSON.parse(window.localStorage.getItem('state')) || state
});

export default connect(mapStateToProps)(League);