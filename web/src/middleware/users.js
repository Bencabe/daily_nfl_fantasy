import config from '../config'

const getUser = async (userEmail) => {
    const response = await fetch(`http://localhost:${config.port}/user`, {
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

const registerUser = async (userDetails) => {
    const response = await fetch(`http://localhost:${config.port}/user`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000'
      },
      body: JSON.stringify(userDetails)
    });
    if (response.status == 200){
      return {message: "User added successfully"}
    }
    return {message: "error adding user"}
  }

export {getUser, registerUser}