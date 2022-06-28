import React, { useState }  from "react";
import styles from '../../styles/League.module.css'

function JoinLeagueModal(props) {
    // Declare a new state variable, which we'll call "count"
    const [leagueName, setLeagueName] = useState(0);

    function createLeague() {
        return 
    }
    console.log(props.toggleJoinLeagueModal)

  
    return (
        <div class={styles.leagueModal}>
            <div class={styles.leagueModalContent}>
                <h2>Join League <button class={styles.closeButton} onClick={props.handleClose}>x</button></h2>
                <label>League Name<br/>
                    <input id='league-name' type="text"/>
                </label><br/>
                <label>League Password<br/>
                    <input id='league-password' type="text"/>
                </label><br/>
                <button onClick={() => createLeague()}>Join League</button>
            </div>
        </div>
    );
  }

export default JoinLeagueModal