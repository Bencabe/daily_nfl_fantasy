const getUserLeagues = () => {
    const response = await fetch('http://localhost:5000/get_user_leagues', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'email': userEmail,
        'Access-Control-Allow-Origin': 'http://localhost:3000'
      }
    });
    const user = await response.json(); //extract JSON from the http response
    // do something with myJson
    return user
  }

export {getUserLeagues}