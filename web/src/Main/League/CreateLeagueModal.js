import { Component } from "react";

class CreateLeagueModal extends Component {
    state = {
        league_name: ""
    }
    
    updateLeagueName(event) {
        this.setState({ league_name: event.target.value });
    }

    createLeague() {
        console.log('league created')
    }

    render() {
        return(
            <div>
                <label>League Name<br/>
                    <input id='league-name' type="text" value={this.state.league_name} onChange={this.updateLeagueName.bind(this)}/>
                </label><br/>
                <button onClick={() => this.createLeague()}>Create League</button>
            </div>
        )
    }
}

export default CreateLeagueModal