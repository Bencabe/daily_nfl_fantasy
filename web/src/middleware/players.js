const getPlayersPerPosition = async (position) => {
    const response = await fetch('http://localhost:5000/players_per_position', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'position': position,
        'Access-Control-Allow-Origin': 'http://localhost:3000'
      }
    });
    const players = await response.json();
    return players
  }

export {getPlayersPerPosition}