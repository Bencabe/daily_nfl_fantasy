import { useState } from 'react';
import styles from './Login.module.css';
import { login } from '../api/login';
import { useNavigate } from 'react-router-dom';

export type User = {
  firstName: string,
  lastName: string,
  email: string,
  id: number,
  activeLeague: number
}


const LoginPage = () => {
  console.log('login page');
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isUser = (user: any): user is User =>  {
    return 'firstName' in user
  }

  const onLogin = async (username: string, password: string) => {
    // Perform login logic here
    console.log('Login:', username, password);
    const user = await login(username, password)
    if (isUser(user)) {
      console.log(user)
      navigate('/', {state: {user: user}})
      setError('')
    }
    else {
      setError('Incorrect username or password')
      console.log(user)
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.title}>EPL Fantasy</h1>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.loginButton}>
          Log In
        </button>
      </form>
      <div className={styles.loginError}>{error}</div>
    </div>
  );
};

export default LoginPage;
