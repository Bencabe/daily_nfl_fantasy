import React, {useState} from "react";
import styles from '../../styles/League.module.css'
import { createLeague, joinLeague } from '../../middleware/leagues'

function CreateLeagueModal(props) {
    const [errMessage, setErrMessage] = useState()


    const handleCreateLeagueForm = event => {
        const leagueName = event.target.leagueName.value
        const leaguePassword = event.target.leaguePassword.value
        const playerLimit = event.target.playerLimit.value
        const leagueType = event.target.leagueType.value
        const privateLeague = event.target.private.checked ? 1 : 0
        const leagueAdminId = props.userId
        const teamName = event.target.teamName.value
        if (!leagueName){
            event.preventDefault()
            setErrMessage("Please provide a league name")
        }
        if (privateLeague && !leaguePassword){
            event.preventDefault()
            setErrMessage("Please set password when creating private league")
        }
        if (!teamName){
            event.preventDefault()
            setErrMessage("Please provide a team name")
        }
        else{
            createLeague(leagueName, leaguePassword, leagueAdminId, playerLimit, leagueType, privateLeague, teamName)
        }
    }
  
    return (
        <div className={styles.leagueModal}>
            <div className={styles.leagueModalContent}>
                <h2>Create League <button className={styles.closeButton} onClick={props.handleClose}>x</button></h2>
                <form onSubmit={handleCreateLeagueForm}>
                    <label>League Name</label><br/>
                    <input id='leagueName' type="text"/><br/>
                    <label>League Password</label><br/>
                    <input id='leaguePassword' type="text"/><br/>
                    <label>Max Players </label><br/>
                    <input id='playerLimit' type="text"/><br/>
                    <label>Team Name </label><br/>
                    <input id='teamName' type="text"/><br/>
                    <label>League Type </label><br/>
                    <select id='leagueType'>
                        <option id='modernOption' value='modern'>Modern</option>
                        <option id='draftOption' value='draft' disabled={true}>Draft</option>
                        <option id='classicOption' value='classic' disabled={true}>Classic</option>
                    </select>
                    <br/>
                    <label>Private League:</label>
                    <input id='private' type="checkbox"/><br/>
                    <p id={styles.errorMessage}>{errMessage}</p>
                    <input id='submit' type="submit" value='Create League'></input>
                </form>
            </div>
        </div>
    );
  }

export default CreateLeagueModal