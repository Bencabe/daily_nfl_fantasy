import defaultStyles from '../../styles/Default.module.css'
import {statsMultiplyer, getMinutesScore, goalsConcededScore} from '../../middleware/scoring'
import React from "react";

function PlayerPointsModal(props) {
    const createPointsTable = (stat, statsType) =>  {
        if (props.playerStats[stat] && stat in statsMultiplyer[statsType]) {
            return <tr>
                        <td>{generateStatName(stat)}</td> 
                        <td>{props.playerStats[stat]}</td> 
                        <td>{props.playerStats[stat] * statsMultiplyer[statsType][stat]}</td>
                    </tr>
        }
    }

    const generateStatName = (stat) => {
        const wordArr = stat.split('_')
        return wordArr.map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()  + " ";
        });
    }

    return (
    <div className={defaultStyles.modal}>
        <div className={defaultStyles.modalContent}>
            <h2>Player Stats <button className={defaultStyles.closeButton} onClick={props.handleClose}>x</button></h2>
            <table>
                <thead>
                    <tr>
                        <th>Stat</th>
                        <th>Value</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {/* <tr>
                        <td>General Points</td>
                    </tr> */}
                    <tr>
                        <td>Minutes</td>
                        <td>{props.playerStats['minutes']}</td>
                        <td>{getMinutesScore(props.playerStats['minutes'])}</td>
                    </tr>
                        {Object.keys(props.playerStats).map(function(key){
                            return createPointsTable(key, 'general')
                        })}
                    { props.playerPosition == "goalkeeper" ?
                    Object.keys(props.playerStats).map(function(key){
                        return createPointsTable(key, 'goalkeeping')
                    }) : null
                    }
                    {/* <tr>
                        <td>Defending Points</td>
                    </tr> */}
                    {props.playerPosition == "defender" ||  props.playerPosition == "midfielder" ? 
                    <tr>
                        <td>Goals Conceded</td>
                        <td>{props.playerStats['goals_conceded']}</td>
                        <td>{goalsConcededScore(props.playerStats['goals_conceded'])}</td>
                    </tr>: null}
                    {props.playerPosition == "defender" || props.playerPosition == "midfielder" ?  
                     Object.keys(props.playerStats).map(function(key){
                        return createPointsTable(key, 'defending') 
                    }): null}
                    {/* <tr>
                        <td>Passing Points</td>
                    </tr> */}
                    {props.playerPosition == "midfielder" ||  props.playerPosition == "forward" ? 
                    Object.keys(props.playerStats).map(function(key){
                        return createPointsTable(key, 'passing')
                    }): null}
                    {props.playerPosition == "midfielder" ||  props.playerPosition == "forward" ? 
                    <tr>
                        <td>Passing Accuracy</td>
                        <td>{props.playerStats['pass_accuracy']}</td>
                        <td>{props.playerStats['pass_accuracy'] >= 90 ? 1 : 0}</td>
                    </tr>: null}
                    {props.playerPosition == "midfielder" ||  props.playerPosition == "forward" ? 
                    Object.keys(props.playerStats).map(function(key){
                        return createPointsTable(key, 'attacking')
                    }): null}
                </tbody>
            </table>
        </div>
    </div>
    )
}

export default PlayerPointsModal