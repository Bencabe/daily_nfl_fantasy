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

export {getUserLeagues, getUserLeagueTeam}