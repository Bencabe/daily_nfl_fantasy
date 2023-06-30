import config from '../config'

const getUserLeagues = async (userId) => {
    const response = await fetch(`http://localhost:${config.port}/get_user_leagues`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'user_id': userId,
        'Access-Control-Allow-Origin': 'http://localhost:3000'
      }
    });
    const userLeagues = await response.json();
    return userLeagues
  }

const getLeague = async (leagueId) => {
  const response = await fetch(`http://localhost:${config.port}/league`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'league_id': leagueId,
      'Access-Control-Allow-Origin': 'http://localhost:3000'
    }
  });
  const league = await response.json();
  return league
}

const createLeague = async (leagueName, leaguePassword, leagueAdmin, playerLimit, leagueType, privateLeague, teamName) => {
  const response = await fetch(`http://localhost:${config.port}/league`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'league_name': leagueName,
      'league_password': leaguePassword,
      'league_admin': leagueAdmin,
      'player_limit': playerLimit,
      'league_type': leagueType,
      'private_league': privateLeague,
      'team_name': teamName,
      'Access-Control-Allow-Origin': 'http://localhost:3000'
    }
  });
  const responseJson = await response.json();
  return responseJson
}

const joinLeague = async (userId, leagueId, teamName) => {
  const response = await fetch(`http://localhost:${config.port}/join_league`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'user_id': userId,
      'league_id': leagueId,
      'team_name': teamName,
      'Access-Control-Allow-Origin': 'http://localhost:3000'
    }
  });
  const responseJson = await response.json();
  return responseJson
}

export {getUserLeagues, getLeague, createLeague, joinLeague}