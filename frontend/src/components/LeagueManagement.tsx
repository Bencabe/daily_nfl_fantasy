import { useState, useEffect } from 'react';
import { useGlobalContext } from '../utils/customHooks';
import { LeagueTypes, League } from '../api/openapi';
import getApi from '../api/main';
import styles from './LeagueManagement.module.css';
import Select from 'react-select';

const LeagueManagement = () => {
  const { user, setUser } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [userLeagues, setUserLeagues] = useState<League[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const api = getApi();
  
  // Join League Form State
  const [joinFormData, setJoinFormData] = useState({
    leagueId: '',
    password: '',
    teamName: ''
  });

  // Create League Form State
  const [createFormData, setCreateFormData] = useState({
    name: '',
    password: '',
    admin: user?.id,
    private: true,
    type: LeagueTypes.MODERN,
    playerLimit: 8,
    draftStarted: false,
    draftCompleted: false,
    draftTurn: null,
    draftOrder: null,
    teamName: ''
  });

  useEffect(() => {
    fetchUserLeagues();
  }, []);

  // Add this effect after your other useEffect
  useEffect(() => {
    if (successMessage) {
        const timer = setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
        
        return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchUserLeagues = async () => {
    try {
      const leagues = await api.getUserLeagues(user.id);
      setUserLeagues(leagues);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.joinLeague(
            Number(joinFormData.leagueId),
            user?.id || 0,
            joinFormData.password,
            joinFormData.teamName
        );
        setSuccessMessage('Successfully joined league!');
        fetchUserLeagues();
        // Clear form
        setJoinFormData({ leagueId: '', password: '', teamName: '' });
    } catch (error) {
        console.error('Error joining league:', error);
    }
};

const handleCreateLeague = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
      const { teamName, ...leagueData } = createFormData;
      await api.createLeague(teamName, leagueData);
      setSuccessMessage('Successfully created league!');
      fetchUserLeagues();
      // Clear form
      setCreateFormData({
          name: '',
          password: '',
          admin: user?.id,
          private: true,
          type: LeagueTypes.MODERN,
          playerLimit: 8,
          draftStarted: false,
          draftCompleted: false,
          draftTurn: null,
          draftOrder: null,
          teamName: ''
      });
  } catch (error) {
      console.error('Error creating league:', error);
  }
};

const handleActiveLeagueChange = async (option: League | null) => {
  try {
    if (option) {
      const activeLeague = userLeagues.find(league => league.id === option.id);
      if (activeLeague) {
        const response = await api.changeActiveLeague(activeLeague.id, user.id);
        // Update localStorage with new token
        localStorage.setItem('jwt_token', response.token);
        setUser({ ...user, activeLeague: activeLeague.id });
      }
    }
  } catch (error) {
    console.error('Error updating active league:', error);
  }
};

  return (
    <div className={styles.leagueManagement}>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'join' ? styles.active : ''}`}
          onClick={() => setActiveTab('join')}
        >
          Join League
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'create' ? styles.active : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create League
        </button>
      </div>

      <div className={styles.formContainer}>
        {activeTab === 'join' ? (
          <form onSubmit={handleJoinLeague} className={styles.leagueForm}>
            <input
              type="number"
              placeholder="League ID"
              value={joinFormData.leagueId}
              onChange={(e) => setJoinFormData({...joinFormData, leagueId: e.target.value})}
            />
            <input
              type="password"
              placeholder="League Password"
              value={joinFormData.password}
              onChange={(e) => setJoinFormData({...joinFormData, password: e.target.value})}
            />
            <input
              type="text"
              placeholder="Your Team Name"
              value={joinFormData.teamName}
              onChange={(e) => setJoinFormData({...joinFormData, teamName: e.target.value})}
            />
            <button type="submit">Join League</button>
          </form>
        ) : (
          <form onSubmit={handleCreateLeague} className={styles.leagueForm}>
            <input
              type="text"
              placeholder="League Name"
              value={createFormData.name}
              onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
            />
            <input
              type="password"
              placeholder="Set League Password"
              value={createFormData.password}
              onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
            />
            <input
                type="text"
                placeholder="Your Team Name"
                value={createFormData.teamName}
                onChange={(e) => setCreateFormData({...createFormData, teamName: e.target.value})}
            />
            <div className={styles.formGroup}>
              <label>
                Private League
                <input
                  type="checkbox"
                  checked={createFormData.private}
                  onChange={(e) => setCreateFormData({...createFormData, private: e.target.checked})}
                />
              </label>
            </div>
            <div className={styles.formGroup}>
              <label>
                Player Limit
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={createFormData.playerLimit}
                  onChange={(e) => setCreateFormData({...createFormData, playerLimit: Number(e.target.value)})}
                />
              </label>
            </div>
            <button type="submit">Create League</button>
          </form>
        )}
      </div>
      {successMessage && (
          <div className={styles.successMessage}>
              {successMessage}
          </div>
      )}

      {userLeagues.length > 0 && (
        <div className={styles.activeLeagueSection}>
          <h2>Active League</h2>
          <div className={styles.selectWrapper}>
            <Select
              value={userLeagues.find(league => league.id === user.activeLeague)}
              onChange={(option: League | null) => option && handleActiveLeagueChange(option)}
              options={userLeagues}
              getOptionLabel={(option: League) => option.name}
              getOptionValue={(option: League) => option.id.toString()}
              className={styles.leagueDropdown}
            />
          </div>
          {user.activeLeague && (
            <div className={styles.leagueInfo}>
              <p><strong>League ID:</strong> {user.activeLeague}</p>
              <p><strong>Password:</strong> {userLeagues.find(league => league.id === user.activeLeague)?.password}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeagueManagement;
