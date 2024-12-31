import config from '../../config'
import axios from 'axios';

const getUser = async (userEmail: string) => {
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

  const login = async (userEmail: string, password: string) => {
    // TODO encrypt password
    const response = await axios.post(`http://localhost:${config.port}/login`, null, {
      headers: {
        'email': userEmail,
        'password': password,
      },
      withCredentials: true,
    });
    
    return response.data;
  };

const validateJWT = async () => {
  try {
    const response = await axios.post(`http://localhost:${config.port}/whoami`, {}, {
      withCredentials: true,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
    return response.data.user;
  } catch (error) {
    console.error('Error validating JWT:', error);
    throw error;
  }
};

const registerUser = async (userDetails: object) => {
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

export {getUser, registerUser, login, validateJWT}