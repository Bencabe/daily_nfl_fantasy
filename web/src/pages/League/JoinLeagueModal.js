import React, { useState }  from "react";
import styles from '../../styles/League.module.css'
import { getLeague, joinLeague } from '../../middleware/leagues'

function JoinLeagueModal(props) {
    const [errMessage, setErrMessage] = useState();

    const handleJoinLeagueForm = async event => {
        event.preventDefault()
        const passwordAttempted = event.target.leaguePassword.value
        const leagueId = event.target.leagueId.value
        const teamName = event.target.teamName.value
        if (!league || !teamName){
            setErrMessage("Please provide a league ID and team name")
            return
        }
        let league = {}
        league = await getLeague(leagueId)
        const leaguePassword = league[2]
        const userId = props.userId
        if (!leaguePassword){
            joinLeague(userId, leagueId, teamName)
            window.location.reload(false)
        }
        else if (leaguePassword && passwordAttempted != leaguePassword){
            setErrMessage("Incorrect password")
        }
        else if (passwordAttempted == leaguePassword){
            joinLeague(userId, leagueId, teamName)
            window.location.reload(false)
        }
    }

  
    return (
        <div className={styles.leagueModal}>
            <div className={styles.leagueModalContent}>
                <h2>Join League <button className={styles.closeButton} onClick={props.handleClose}>x</button></h2>
                <form onSubmit={handleJoinLeagueForm}>
                    <label>League ID<br/>
                        <input id='leagueId' type="text"/>
                    </label><br/>
                    <label>League Password<br/>
                        <input id='leaguePassword' type="text"/>
                    </label><br/>
                    <label>Team Name<br/>
                        <input id='teamName' type="text"/>
                    </label><br/>
                    <p>{errMessage}</p>
                    <input id='joinLeagueSubmitButton' type='submit'/>
                </form>
            </div>
        </div>
    );
  }

export default JoinLeagueModal