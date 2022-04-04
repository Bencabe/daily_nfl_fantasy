import React, {Component} from 'react'
import CreateLeagueModal from './CreateLeagueModal'

const get_user_leagues = () => {
    let leagues = []
    return leagues
}


class League extends Component {
    state = {
        showCreateLeagueModal: false
    }

    displayCreateLeagueModal = () => {
        this.setState({showCreateLeagueModal: true})
    }
    hideCreateLeagueModal = () => {
        this.setState({showCreateLeagueModal: false})
    }

    render() {
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

export default League