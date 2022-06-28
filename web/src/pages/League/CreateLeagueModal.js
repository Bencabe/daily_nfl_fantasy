import React from "react";
import styles from '../../styles/League.module.css'

function CreateLeagueModal(props) {

    function createLeague() {
        console.log()
    }
  
    return (
        <div className={styles.leagueModal}>
            <div className={styles.leagueModalContent}>
                <h2>Create League <button className={styles.closeButton} onClick={props.handleClose}>x</button></h2>
                <form onSubmit={() => createLeague()}>
                    <label>League Name</label><br/>
                    <input id='leagueName' type="text"/><br/>
                    <label>League Password</label><br/>
                    <input id='leaguePassword' type="text"/><br/>
                    <label>Max Players </label><br/>
                    <input id='playerLimit' type="text"/><br/>
                    <label>League Type </label><br/>
                    <select id='leagueType'>
                        <option id='modernOption' value='modern'>Modern</option>
                        <option id='draftOption' value='draft' disabled={true}>Draft</option>
                        <option id='classicOption' value='classic' disabled={true}>Classic</option>
                    </select>
                    <br/>
                    <label>Private League:</label>
                    <input id='private' type="checkbox"/><br/><br/>
                    <input id='submit' type="submit" value='Create League'></input>
                </form>
            </div>
        </div>
    );
  }

export default CreateLeagueModal