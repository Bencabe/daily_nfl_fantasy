const getPlayerScore = (playerFixture, position) => {
    // console.log(playerFixture)
    // console.log(position)
    if (!playerFixture || !position){
        return 0
    }
    const score = getGeneralScore(playerFixture)
    const attacking_score = getAttackingScore(playerFixture)
    const passing_score = getPassingScore(playerFixture)
    const defending_score = getDefendingScore(playerFixture)
    const goalkeeping_score = getGoalkeepingScore(playerFixture)
    if (position == 'goalkeeper' || position == 'goalkeepers') {
        return score + defending_score + goalkeeping_score
    }
    if (position == 'defender' || position == 'defenders') {
        return score + defending_score
    }
    if (position == 'midfielder' || position == 'midfielders'){
        return score + defending_score + passing_score + attacking_score
    }
    if (position == 'forward' || position == 'forwards'){
        return score + passing_score + attacking_score
    }
}
    
const getAttackingScore = (playerFixture) => {
    let score = 0
    score += playerFixture['dribble_success'] * 0.2
    score += playerFixture['fouls_drawn'] * 0.2
    score += playerFixture['shots_on_target'] * 0.25
    return score
}
    
const getPassingScore = (playerFixture) => {
    let score = 0
    score += playerFixture['accurate_crosses'] * 0.2
    score += playerFixture['key_passes'] * 0.5
    score += playerFixture['total_passes'] * 0.01
    if (playerFixture['pass_accuracy'] >= 90){
        score += 1
    }
    return score
}
    
const getDefendingScore = (playerFixture) => {
    let score = 0
    score += playerFixture['interceptions'] * 0.2
    score += playerFixture['blocks'] * 0.2
    score += playerFixture['tackles'] * 0.2
    score += playerFixture['dribble_past'] * -0.5
    score += goalsConcededScore(playerFixture['goals_conceded'])
    return score
}
        
const getGoalkeepingScore = (playerFixture) => {
    let score = 0
    score += playerFixture['saves'] * 0.2
    return score
}

const getGeneralScore = (playerFixture) => {
    let score = 0
    score += playerFixture['aerials_won'] * 0.2
    score += playerFixture['duels_won'] * 0.2
    score += playerFixture['owngoals'] * -4
    score += playerFixture['redcards'] ? 0 * -3 : 0
    score += playerFixture['yellowcards'] ? 0 * -1 : 0
    score += playerFixture['yellowred'] ? 0 * -3 : 0
    score += playerFixture['fouls_comitted'] * -0.2
    score += playerFixture['dispossesed'] * -0.25
    score += playerFixture['goals'] * 5
    score += playerFixture['assists'] * 3
    score += playerFixture['penalties_committed'] * -3
    score += playerFixture['penalties_won'] * 3
    score += playerFixture['penalties_missed'] * -3
    score += getMinutesScore(playerFixture['minutes'])
    return score
}
    
    
const getMinutesScore = (minutes) => {
    if (minutes >= 60){
        return 2
    }
    if (minutes >= 1){
        return 1
    }
    else
        return 0
}

const goalsConcededScore = (goalsConceded) => {
    if (goalsConceded == 0){
        return 4
    }
    else {
        return goalsConceded * -0.2
    }
}

const getTeamScore = (players, playerStats) => {
    let teamScore = 0
    const positions = Object.keys(players)
    for (let i=0; i<=positions.length; i++ ){
        let playerPerPosition = players[positions[i]]
        if (playerPerPosition && positions[i] != "subs" && typeof positions[i] === 'string'){
            for(let i=0; i<=playerPerPosition.length; i++ ){
                let player = playerPerPosition[i]
                const playerScore = getPlayerScore(playerStats[player], positions[i])
                teamScore += playerScore ? playerScore : 0
            }
        }
    }
    return teamScore
} 

const statsMultiplyer = {
    attacking: {
        dribble_success:  0.2,
        fouls_drawn: 0.2,
        shots_on_target: 0.25
    },
    passing: {
        accurate_crosses: 0.2,
        key_passes: 0.5,
        total_passes: 0.01,
    },
    defending: {
        interceptions: 0.2,
        blocks: 0.2,
        tackles: 0.2,
        dribble_past: -0.5,

    },
    goalkeeping: {
        saves: 0.2
    },
    general: {
        aerials_won: 0.2,
        duels_won: 0.2,
        owngoals: -4,
        redcards: -3 ,
        yellowcards: -1,
        yellowred: -3,
        fouls_comitted: -0.2,
        dispossesed: -0.25,
        goals: 5,
        assists: 3,
        penalties_committed: -3,
        penalties_won: 3,
        penalties_missed: -3,
    }

}

export {getPlayerScore, statsMultiplyer, getMinutesScore, goalsConcededScore, getTeamScore}