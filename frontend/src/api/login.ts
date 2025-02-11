import config from '../../config'
import axios from 'axios';

const getUser = async (userEmail: string) => {
    const response = await fetch(`${config.host}:${config.port}/user`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'email': userEmail,
        'Access-Control-Allow-Origin': '*'
      }
    });
    const user = await response.json();
    return user
  }

  const login = async (userEmail: string, password: string) => {
    // TODO encrypt password
    const response = await axios.post(`${config.host}:${config.port}/login`, null, {
      headers: {
        'email': userEmail,
        'password': password,
        'Access-Control-Allow-Origin': '*'
      },
      withCredentials: true,
    });
    console.log("HELLO") 
    console.log(response.data) 
    // TODO this isn't great, using as a fallback for now because httponly cookie not reliable
    localStorage.setItem('jwt_token', response.data.token);
    
    return response.data.user;
  };

const validateJWT = async () => {
  try {
    const response = await axios.post(`${config.host}:${config.port}/whoami`, {}, {
      withCredentials: true,
      headers: {
        'Access-Control-Allow-Origin': config.frontendHost,
        'Access-Control-Allow-Credentials': 'true',
        // TODO this isn't great, using as a fallback for now because httponly cookie not reliable
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      }
    });
    return response.data.user;
  } catch (error) {
    console.error('Error validating JWT:', error);
    throw error;
  }
};

const registerUser = async (userDetails: object) => {
    const response = await fetch(`${config.host}:${config.port}/user`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': config.frontendHost
      },
      body: JSON.stringify(userDetails)
    });
    if (response.status == 200){
      return {message: "User added successfully"}
    }
    return {message: "error adding user"}
  }

export {getUser, registerUser, login, validateJWT}