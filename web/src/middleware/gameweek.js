import {getUserLeague} from './teams'
import config from '../config'
import GameweekTeam from '../classes/database/GameweekTeam'

const getGameweek = async (gameweekNumber) => {
    const response = await fetch(`http://localhost:${config.port}/gameweeks`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'gameweek_number': gameweekNumber,
        'Access-Control-Allow-Origin': 'http://localhost:3000'
  
      },
    });
    const responseJson = await response.json();
    return responseJson
}

const getGameweekTeam = async(gameweekNumber, leagueId, userId) => {
    const userLeague = await getUserLeague(userId, parseInt(leagueId))
    const gameweek = await getGameweek(gameweekNumber)
    const teamId = userLeague[0][0]
    const gameweekId = gameweek[0][0]
    const response = await fetch(`http://localhost:${config.port}/gameweek_team`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'gameweek_id': gameweekId,
        'team_id':  teamId,
        'Access-Control-Allow-Origin': 'http://localhost:3000'
      }
    });
    const userLeagueTeam = await response.json();
    const gameweekTeam = new GameweekTeam(userLeagueTeam[0])
    return gameweekTeam
}

const getGameweekStats = async (gameweek_number) => {
    const gameweek_id = await getGameweek(gameweek_number)
    const response = await fetch(`http://localhost:${config.port}/gameweek_stats`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'gameweek_id': gameweek_id,
        'Access-Control-Allow-Origin': 'http://localhost:3000'
      }
    });
    const gameweekStats = await response.json();
    const transformedStats = {}
    for (const key in Object.keys(gameweekStats)){
      transformedStats[gameweekStats[key]['player_id']] = gameweekStats[key]
    }
    return transformedStats
    // return gameweekStats
  }

export {getGameweek, getGameweekTeam, getGameweekStats}