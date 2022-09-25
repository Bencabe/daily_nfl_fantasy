import {getUserLeague} from './teams'

const getGameweek = async (gameweekNumber) => {
    const response = await fetch('http://localhost:5000/gameweeks', {
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
    const userLeague = await getUserLeague(userId, leagueId)
    const gameweek = await getGameweek(gameweekNumber)
    const response = await fetch('http://localhost:5000/gameweek_team', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'gameweek_id': gameweek[0][0],
        'team_id':  userLeague[0][0],
        'Access-Control-Allow-Origin': 'http://localhost:3000'
      }
    });
    const userLeagueTeam = await response.json();
    return userLeagueTeam
}

const getGameweekStats = async (gameweek_number) => {
    const gameweek_id = await getGameweek(gameweek_number)
    const response = await fetch('http://localhost:5000/gameweek_stats', {
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