const getUserLeagues = async (userId) => {
    const response = await fetch('http://localhost:5000/get_user_leagues', {
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
    const response = await fetch('http://localhost:5000/league', {
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

export {getUserLeagues, getLeague}