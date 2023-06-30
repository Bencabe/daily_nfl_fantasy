import config from '../config'

const getUser = async (userEmail) => {
    const response = await fetch(`http://localhost:${config.port}/get_user`, {
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