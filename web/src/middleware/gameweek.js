import {getUserLeague} from './teams'
import config from '../config'
import GameweekTeam from '../classes/GameweekTeam'
import Gameweek from '../classes/Gameweek'

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
    return Gameweek.update(responseJson[0])
}

const getGameweekTeam = async(gameweekId, leagueId, userId) => {
    const userLeague = await getUserLeague(userId, parseInt(leagueId))
    const teamId = userLeague[0][0]
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

const setGameweekTeam = async(userId, gameweekId, leagueId, seasonId, players) => {
  const userLeague = await getUserLeague(userId, parseInt(leagueId))
  const teamId = userLeague[0][0]
  const response = await fetch(`http://localhost:${config.port}/gameweek_team`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'gameweek_id': gameweekId,
      'season_id': seasonId,
      'team_id':  teamId,
      'Access-Control-Allow-Origin': 'http://localhost:3000'
    },
    body: JSON.stringify({      
      'goalkeepers': players.goalkeepers,
      'defenders': players.defenders,
      'midfielders': players.midfielders,
      'forwards': players.forwards,
      'subs': players.subs})
  });
  return await response.json()
}

const getGameweekStats = async (gameweekId) => {
    const response = await fetch(`http://localhost:${config.port}/gameweek_stats`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'gameweek_id': gameweekId,
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

export {getGameweek, getGameweekTeam, getGameweekStats, setGameweekTeam}