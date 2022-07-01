const getUserLeagues = async (userId) => {
    const response = await fetch('http://localhost:5000/get_league_user', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'userId': userId,
        'Access-Control-Allow-Origin': 'http://localhost:3000'
      }
    });
    const userLeagues = await response.json();
    return userLeagues
}

const getUserLeagueTeam = async (userId, leagueId) => {
  const response = await fetch('http://localhost:5000/user_league_team', {
    method: 'GET',
    mode: 'cors',
    headers: {
      'user_id': userId,
      'league_id': leagueId,
      'Access-Control-Allow-Origin': 'http://localhost:3000'
    }
  });
  const userLeagueTeam = await response.json();
  return userLeagueTeam
}

const saveUserLeagueTeam = async (leagueId, userId, goalkeepers, defenders, midfielders, forwards) => {
  const response = await fetch('http://localhost:5000/user_league_team', {
    method: 'POST',
    mode: 'cors',
    headers: {
      'league_id': leagueId,
      'user_id': userId,
      'Access-Control-Allow-Origin': 'http://localhost:3000'

    },
    body: JSON.stringify({      
    'goalkeepers': goalkeepers,
    'defenders': defenders,
    'midfielders': midfielders,
    'forwards': forwards})
  });
  const resp = await response.json();
  return resp
}


export {getUserLeagues, getUserLeagueTeam, saveUserLeagueTeam}