const getUser = async (userEmail) => {
    const response = await fetch('http://localhost:5000/get_user', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'email': userEmail,
        'Access-Control-Allow-Origin': 'http://localhost:3000'
      }
    });
    const user = await response.json();
    return user
  }

export {getUser}